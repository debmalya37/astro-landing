// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nextMessage } from "@/lib/waFlow";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 3
});

// ✅ UPDATED: Added urlButton to the options interface
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

  // If both a List and an Image exist, send the Image FIRST as a standalone message
  if (options?.list && options?.image) {
    await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "image", image: { link: options.image } }),
    });
  }

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  // ✅ NEW LOGIC: Handle URL Buttons (cta_url)
  if (options?.urlButton) {
    payload.type = "interactive";
    payload.interactive = {
      type: "cta_url",
      body: { text: text },
      action: {
        name: "cta_url",
        parameters: {
          display_text: options.urlButton.text,
          url: options.urlButton.url
        }
      }
    };
  } 
  // Existing Logic for Lists
  else if (options?.list) {
    payload.type = "interactive";
    payload.interactive = { type: "list", body: { text: text }, action: options.list };
  } 
  // Existing Logic for Reply Buttons
  else if (options?.buttons && options.buttons.length > 0) {
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
  } 
  // Existing Logic for Images
  else if (options?.image) {
    payload.type = "image";
    payload.image = { link: options.image, caption: text };
  } 
  // Existing Logic for Plain Text
  else {
    payload.type = "text";
    payload.text = { body: text };
  }

  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!response.ok) {
      console.error("Meta API Error:", await response.json());
    }
  } catch (error) {
    console.error("Failed to send WA message:", error);
  }
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  if (search.get("hub.mode") === "subscribe" && search.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(search.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
    
    if (!message) return new NextResponse("OK", { status: 200 });

    const from = message.from as string;
    const messageId = message.id as string;
    const waName = contact?.profile?.name || "Seeker";

    // 1. PREVENT DUPLICATES (Idempotency check)
    const isDuplicate = await redis.get(`msg_processed:${messageId}`);
    if (isDuplicate) return new NextResponse("OK", { status: 200 });
    await redis.set(`msg_processed:${messageId}`, "1", "EX", 3600); // Store for 1 hour

    // 2. TRACK FOR 24-HOUR FOLLOW UP
    await redis.hset("wa_last_interaction", from, Date.now().toString());
    await redis.hset("wa_names", from, waName);

    let text = message?.type === "interactive" 
      ? (message?.interactive?.list_reply?.title || message?.interactive?.button_reply?.title || "") 
      : (message?.text?.body || "");

    const rawPrevState = await redis.get(`user_state:${from}`);
    const prev = rawPrevState ? JSON.parse(rawPrevState) : { step: "START", userData: { name: waName } };
    
    // Ensure name is always in state
    prev.userData.name = waName;

    // ✅ UPDATED: Extract urlButton from nextMessage response
    const { reply, buttons, list, image, urlButton, newState } = nextMessage(text, prev);

    await redis.set(`user_state:${from}`, JSON.stringify(newState), "EX", 86400);
    
    // ✅ UPDATED: Pass urlButton into sendWhatsAppMessage
    await sendWhatsAppMessage(from, reply, { buttons, list, image, urlButton });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}