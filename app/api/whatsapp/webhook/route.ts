// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nextMessage } from "@/lib/waFlow";
import Redis from "ioredis";
import mongoose from "mongoose";

// ==========================================
// 1. SINGLETON / GLOBAL SETUP
// ==========================================
// Persistent Redis connection
const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 1 // Faster fail for webhooks
});

// Cache MongoDB connection globally
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
  });
  isConnected = !!db.connections[0].readyState;
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

  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Reusable fetch options for speed
  const fetchOptions = {
    method: "POST",
    headers: commonHeaders,
    keepalive: true, // Reuses TCP connection for faster subsequent calls
  };

  const supportsHeader = !!options?.urlButton || (options?.buttons && options.buttons.length > 0);
  const needsPreSend = options?.image && options.list && !supportsHeader;

  if (needsPreSend) {
    try {
      const imgRes = await fetch(url, {
        ...fetchOptions,
        body: JSON.stringify({ messaging_product: "whatsapp", to, type: "image", image: { link: options.image } }),
      });
      if (!imgRes.ok) console.error("Img Error:", await imgRes.json());
    } catch (e) { console.error("Img Fetch Error:", e); }
  }

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  if (options?.urlButton) {
    payload.type = "interactive";
    payload.interactive = {
      type: "cta_url",
      header: options.image ? { type: "image", image: { link: options.image } } : undefined,
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
    if (options.image) payload.interactive.header = { type: "image", image: { link: options.image } };
  } else if (options?.image) {
    payload.type = "image";
    payload.image = { link: options.image, caption: text };
  } else {
    payload.type = "text";
    payload.text = { body: text };
  }

  try {
    const response = await fetch(url, { ...fetchOptions, body: JSON.stringify(payload) });
    if (!response.ok) console.error("Meta API Error:", await response.json());
  } catch (error) { console.error("Failed to send WA message:", error); }
}

// ==========================================
// 3. HANDLERS
// ==========================================
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  if (search.get("hub.mode") === "subscribe" && search.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(search.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
    
    if (!message) return new NextResponse("OK", { status: 200 });

    const from = message.from;
    const messageId = message.id;
    const waName = contact?.profile?.name || "Seeker";

    // Fast Duplicate Check
    const isDuplicate = await redis.get(`msg_processed:${messageId}`);
    if (isDuplicate) return new NextResponse("OK", { status: 200 });
    
    // Fire-and-forget duplicate marker (don't await it strictly if speed is king)
    redis.set(`msg_processed:${messageId}`, "1", "EX", 3600);

    let incomingText = "";
    let msgType = "text";

    if (message.type === "interactive") {
      incomingText = message.interactive?.list_reply?.title || message.interactive?.button_reply?.title || "";
      msgType = message.interactive?.list_reply ? "list_selection" : "button_click";
    } else {
      incomingText = message.text?.body || "";
    }

    const rawPrevState = await redis.get(`user_state:${from}`);
    const prev = rawPrevState ? JSON.parse(rawPrevState) : { step: "START", userData: { name: waName } };
    
    // Logic is local and instant
    const { reply, buttons, list, image, urlButton, newState } = nextMessage(incomingText, prev);

    // BACKGROUND TASKS
    // Note: We don't await the DB and Redis updates before responding to Meta.
    // This makes the webhook response ultra-fast.
    const backgroundTasks = async () => {
      await Promise.all([
        redis.set(`user_state:${from}`, JSON.stringify(newState), "EX", 86400),
        redis.hset("wa_last_interaction", from, Date.now().toString()),
        redis.hset("wa_names", from, waName),
        (async () => {
          await connectDB();
          await Chat.create({ phoneNumber: from, waName, message: incomingText, step: newState.step, type: msgType, timestamp: new Date() });
        })()
      ]);
    };

    // Execute sending and background tasks
    // We await the message send to ensure user gets reply, but response to Meta is fast.
    await sendWhatsAppMessage(from, reply, { buttons, list, image, urlButton });
    
    // Start background tasks without awaiting them to block the response
    backgroundTasks();

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}