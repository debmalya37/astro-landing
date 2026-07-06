// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nextMessage } from "@/lib/waFlow";
import Redis from "ioredis";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. SINGLETON / GLOBAL SETUP
// ==========================================
const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 1 
});

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
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// 2. WHATSAPP SENDER HELPER (FIXED TO RETURN STATUS)
// ==========================================
export async function sendWhatsAppMessage(
  to: string, 
  text: string, 
  options?: { buttons?: string[], list?: any, image?: string, urlButton?: { text: string; url: string } }
): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  const commonHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchOptions = {
    method: "POST",
    headers: commonHeaders,
    keepalive: true, 
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
    // SAFEGUARD: Auto-truncate row titles to 24 characters right before sending to prevent API 131009 Crashes
    const sanitizedSections = options.list.sections?.map((section: any) => ({
      ...section,
      rows: section.rows?.map((row: any) => ({
        ...row,
        title: row.title.substring(0, 24)
      }))
    }));

    payload.type = "interactive";
    payload.interactive = { 
      type: "list", 
      body: { text: text }, 
      action: { ...options.list, sections: sanitizedSections } 
    };
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
    if (!response.ok) {
      console.error("Meta API Error:", await response.json());
      return false; // Return false so background tasks aren't processed
    }
    return true; // Successfully delivered
  } catch (error) { 
    console.error("Failed to send WA message:", error); 
    return false;
  }
}

// ==========================================
// 3. SYSTEM INSTRUCTION & MODELS FOR GEMINI
// ==========================================
const MODELS = [
  'gemini-1.5-flash', 
  'gemini-2.5-flash',                    
  'gemini-2.0-flash',        
  'gemini-1.5-flash-8b'     
];

const GEMINI_SYSTEM_PROMPT =  `
Surbhi Gupta WhatsApp AI Assistant

You are the official WhatsApp assistant for Celebrity Astrologer Surbhi Gupta.

Your job is to chat like a real human assistant, not an AI or customer support bot. Your goal is to understand the user’s concern, build trust, and naturally recommend the most suitable service.

Communication Style

* Always begin with “Radhe Radhe 🙏”.
* Match the user’s language (English, Hindi, or Hinglish).
* If they speak in Hindi (Devanagari script), reply in SIMPLE, EVERYDAY SPOKEN HINDI (Bol-chal ki bhasha). DO NOT use formal, pure, or difficult Hindi words (Shuddh Hindi). Use very common, casual words that everyone understands.
* Keep replies warm, natural, and conversational.
* Use simple everyday language.
* Keep replies under 4 short sentences.
* Never write long paragraphs or sound salesy.

Conversation Flow

1. Acknowledge the user’s concern.
2. Show empathy before recommending any service.
3. Ask one simple follow-up question if needed.
4. Recommend the most suitable service.
5. End by guiding them to the service menu list or ask them to choose from services menu list 📋.


Available Services for your reference:
- Surbhi Consultation: Offline (₹24,000), Priority (₹51,000)
- Numerology Report: Basic (₹1,100), Correction (₹5,100), With Call (₹11,000)
- Couple Match Making: Basic (₹1,100), Match+1Q (₹3,300), Match+Call (₹11,000)
- Baby Name Report: Report (₹1,100), Report+Name (₹5,100)
- Career/Love/Health Problem: PDF Report (₹999), 1-on-1 Call (₹11,000)
- Surbhi Kundli: 10-Yr Report (₹999)

Service Recommendations

* Premium Surbhi Kundli (₹999) – Your primary recommendation. It includes a detailed 10-Year Prediction Report and, for a limited time, Surbhi Ji personally answers one important question.
* 1-on-1 face Consultation (in this dont suggest offline thing)
* Recommend Numerology, Premium kundali report, Match Making, Baby Name, or other reports only when they match the user’s concern.

Important Rules

* Never say you’re an AI or chatbot.
* Never provide free predictions or guaranteed results.
* Never create fear or pressure users to buy.
* Sound like Surbhi Ji’s real assistant on WhatsApp—kind, reassuring, and helpful.
`;
// ==========================================
// 4. HANDLERS
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

    const isDuplicate = await redis.get(`msg_processed:${messageId}`);
    if (isDuplicate) return new NextResponse("OK", { status: 200 });
    
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
    
    let lowerInput = incomingText.toLowerCase();

    if (lowerInput.includes("main menu")) {
      incomingText = "restart";
      lowerInput = "restart";
    }
    
    if (prev.step === "PAUSED_BY_ADMIN" && !["restart", "hi", "hello"].includes(lowerInput)) {
       await connectDB();
       await Chat.create({ phoneNumber: from, waName, message: incomingText, step: "PAUSED_BY_ADMIN", type: msgType, timestamp: new Date() });
       return new NextResponse("OK", { status: 200 }); 
    }

    const isStandardCommand = ["restart", "hi", "hello", "hi surbhi", "paid"].includes(lowerInput);
    const isInteractive = msgType === "list_selection" || msgType === "button_click";
    
    const isExpectingFreeQuestion = prev.step === "F1_START";
    const isShortIntentKeyword = prev.step === "F2_HOOK" && incomingText.trim().length <= 25;

    let finalReply = "";
    let finalButtons: string[] | undefined = undefined;
    let finalList: any = undefined;
    let finalImage: string | undefined = undefined;
    let finalUrlButton: any = undefined;
    let finalNewState = prev;
    let isAiResponse = false; 

    if (isInteractive || isStandardCommand || isExpectingFreeQuestion || isShortIntentKeyword) {
      const result = nextMessage(incomingText, prev);
      finalReply = result.reply;
      finalButtons = result.buttons;
      finalList = result.list;
      finalImage = result.image;
      finalUrlButton = result.urlButton;
      finalNewState = result.newState;
    } else {
      let aiSuccess = false;
      isAiResponse = true;

      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: incomingText,
            config: {
              systemInstruction: GEMINI_SYSTEM_PROMPT,
              temperature: 0.7, 
            }
          });
          
          finalReply = response.text || "Radhe Radhe 🙏! How can I help you today?";
          finalButtons = ["Main Menu 📋"]; 
          finalNewState = { step: "START", userData: prev.userData }; 
          
          aiSuccess = true;
          break; 

        } catch (geminiError: any) {
          console.warn(`[Gemini Fallback] Model ${modelName} failed:`, geminiError.message);
          if (geminiError.status === 429 || geminiError.message?.includes("429") || geminiError.message?.includes("quota")) {
            console.error("[Gemini Fallback] Free Tier Rate Limit Hit (15 RPM)!");
            break; 
          }
        }
      }

      if (!aiSuccess) {
        finalReply = `Radhe Radhe ${waName} ji 🙏\n\nI understand you are seeking guidance, and I am here to help. To ensure you get the right support, please tap the button below to view our specific consultation services.`;
        finalButtons = ["Main Menu 📋"]; 
        finalNewState = { step: "START", userData: prev.userData };
      }
    }

    const userTimestamp = new Date();
    const botTimestamp = new Date(userTimestamp.getTime() + 1000); 

    const backgroundTasks = async () => {
      await connectDB();
      await Promise.all([
        redis.set(`user_state:${from}`, JSON.stringify(finalNewState), "EX", 86400),
        redis.hset("wa_last_interaction", from, Date.now().toString()),
        redis.hset("wa_names", from, waName),
        
        // 1. Log the User's incoming message
        Chat.create({ 
          phoneNumber: from, waName, message: incomingText, step: finalNewState.step, type: msgType, timestamp: userTimestamp 
        }),

        // 2. Log the Bot's outgoing message
        Chat.create({ 
          phoneNumber: from, waName: "Bot", message: finalReply, step: finalNewState.step, type: isAiResponse ? "bot_ai_response" : "bot_flow_response", timestamp: botTimestamp 
        })
      ]);
    };

    // CRITICAL CONTROL: Execute sending first and inspect response status
    const messageDelivered = await sendWhatsAppMessage(from, finalReply, { buttons: finalButtons, list: finalList, image: finalImage, urlButton: finalUrlButton });
    
    // ONLY update state and log history if message delivery was successful
    if (messageDelivered) {
      await backgroundTasks();
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}