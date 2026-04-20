// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nextMessage } from "@/lib/waFlow";
import Redis from "ioredis";
import mongoose from "mongoose";

// ==========================================
// 1. DATABASE & REDIS SETUP
// ==========================================
const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 3
});

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

const ChatSchema = new mongoose.Schema({
  phoneNumber: String,
  waName: String,
  message: String,
  step: String,
  type: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

// ==========================================
// 2. WHATSAPP SENDER HELPER
// ==========================================
export async function sendWhatsAppMessage(
  to: string, 
  text: string, 
  options?: { buttons?: string[], list?: any, image?: string, urlButton?: { text: string; url: string } }
) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  /**
   * FIX: Logic to prevent double images
   * 1. List and URL Buttons (cta_url) DO NOT support headers. We must pre-send the image.
   * 2. Regular Buttons DO support headers. We should NOT pre-send to avoid duplicates.
   */
  const supportsHeader = options?.buttons && options.buttons.length > 0 && !options.urlButton && !options.list;
  const needsPreSend = options?.image && !supportsHeader;

  if (needsPreSend) {
    try {
      await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          messaging_product: "whatsapp", 
          to: to, 
          type: "image", 
          image: { link: options.image } 
        }),
      });
    } catch (e) {
      console.error("Image Pre-send Error:", e);
    }
  }

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  if (options?.urlButton) {
    payload.type = "interactive";
    payload.interactive = {
      type: "cta_url",
      body: { text: text },
      action: {
        name: "cta_url",
        parameters: { display_text: options.urlButton.text, url: options.urlButton.url }
      }
    };
  } else if (options?.list) {
    payload.type = "interactive";
    payload.interactive = { type: "list", body: { text: text }, action: options.list };
  } else if (options?.buttons && options.buttons.length > 0) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text: text },
      action: {
        buttons: options.buttons.slice(0, 3).map((btnTitle, index) => ({
          type: "reply",
          reply: { id: `btn_${index}`, title: btnTitle.substring(0, 20) }
        }))
      }
    };
    // If it supports headers, we attach the image here (Single Bubble)
    if (options.image) {
        payload.interactive.header = { type: "image", image: { link: options.image } };
    }
  } else if (options?.image) {
    payload.type = "image";
    payload.image = { link: options.image, caption: text };
  } else {
    payload.type = "text";
    payload.text = { body: text };
  }

  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!response.ok) console.error("Meta API Error:", await response.json());
  } catch (error) {
    console.error("Failed to send WA message:", error);
  }
}

// ==========================================
// 3. GET HANDLER
// ==========================================
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  if (search.get("hub.mode") === "subscribe" && search.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(search.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("Verification failed", { status: 403 });
}

// ==========================================
// 4. POST HANDLER (Incoming Messages)
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
    
    if (!message) return new NextResponse("OK", { status: 200 });

    const from = message.from as string;
    const messageId = message.id as string;
    const waName = contact?.profile?.name || "Seeker";

    // 1. DUPLICATE CHECK
    const isDuplicate = await redis.get(`msg_processed:${messageId}`);
    if (isDuplicate) return new NextResponse("OK", { status: 200 });
    await redis.set(`msg_processed:${messageId}`, "1", "EX", 3600);

    // 2. LOG DATA PREPARATION
    let incomingText = "";
    let msgType = "text";

    if (message.type === "interactive") {
      if (message.interactive?.list_reply) {
        incomingText = message.interactive.list_reply.title;
        msgType = "list_selection";
      } else if (message.interactive?.button_reply) {
        incomingText = message.interactive.button_reply.title;
        msgType = "button_click";
      }
    } else {
      incomingText = message.text?.body || "";
    }

    // 3. TRACK STATE
    const rawPrevState = await redis.get(`user_state:${from}`);
    const prev = rawPrevState ? JSON.parse(rawPrevState) : { step: "START", userData: { name: waName } };
    prev.userData.name = waName;

    // 4. GENERATE BOT RESPONSE
    const { reply, buttons, list, image, urlButton, newState } = nextMessage(incomingText, prev);

    // 5. SPEED OPTIMIZATION: FIRE ASYNC TASKS IN PARALLEL
    const tasks = [
        sendWhatsAppMessage(from, reply, { buttons, list, image, urlButton }),
        redis.set(`user_state:${from}`, JSON.stringify(newState), "EX", 86400),
        redis.hset("wa_last_interaction", from, Date.now().toString()),
        redis.hset("wa_names", from, waName),
        (async () => {
            await connectDB();
            return Chat.create({
                phoneNumber: from,
                waName: waName,
                message: incomingText,
                step: newState.step,
                type: msgType,
                timestamp: new Date()
            });
        })()
    ];

    await Promise.all(tasks);

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}