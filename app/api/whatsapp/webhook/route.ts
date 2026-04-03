// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nextMessage } from "@/lib/waFlow";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

async function sendWhatsAppMessage(to: string, text: string, options?: { buttons?: string[], list?: any, image?: string }) {
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
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "image",
        image: { link: options.image }
      }),
    });
  }

  // Build the main payload
  let payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
  };

  if (options?.list) {
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
    // Safe to embed image in button message headers
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
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Meta API Error:", JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
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
    
    if (!message) return new NextResponse("OK", { status: 200 });

    const from = message.from as string;
    
    let text = "";
    if (message?.type === "interactive") {
      text = message?.interactive?.list_reply?.title || message?.interactive?.button_reply?.title || "";
    } else {
      text = message?.text?.body || "";
    }

    const rawPrevState = await redis.get(`user_state:${from}`);
    const prev = rawPrevState ? JSON.parse(rawPrevState) : { step: "START" };

    const { reply, buttons, list, image, newState } = nextMessage(text, prev);

    await redis.set(`user_state:${from}`, JSON.stringify(newState), "EX", 86400);
    await sendWhatsAppMessage(from, reply, { buttons, list, image });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}