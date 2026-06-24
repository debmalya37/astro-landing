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
// 3. SYSTEM INSTRUCTION & MODELS FOR GEMINI
// ==========================================
const MODELS = [
  'gemini-1.5-flash', 
  'gemini-2.5-flash',                   
  'gemini-2.0-flash',        
  'gemini-1.5-flash-8b'     
];

const GEMINI_SYSTEM_PROMPT = `
You are the official, deeply empathetic AI assistant for Celebrity Astrologer Surbhi Gupta.
Your ultimate goal is to convert the user into a client by making them feel heard, validated, and understood.

CRITICAL INSTRUCTIONS:
1. MATCH THE USER'S LANGUAGE & TONE: 
   - If they speak in English, reply in English.
   - If they speak in Hindi, reply in Hindi.
   - If they speak in HINGLISH (Hindi written with English alphabet, e.g., "mai bohot pareshaan hoon", "kuch samajh nahi aa raha"), you MUST reply in natural, warm HINGLISH (e.g., "Radhe Radhe 🙏 Main samajh sakti hoon ki aap kitne pareshan hain...").
2. EMPATHY FIRST: If the user shares a problem (e.g., emotional pain, career stress), DO NOT jump straight to selling. Validate their feelings first (e.g., "I am so sorry you are going through this pain," or "Bohot dukh hota hai jab..."). 
3. BRIDGE TO SERVICE: Gently explain that astrology is a tool for clarity, and Surbhi Ji can help them navigate this difficult time to find solutions.
4. CALL TO ACTION: Always end your response by guiding them to the main menu.

Available Services for your reference:
- Surbhi Consultation: Offline (₹24,000), Priority (₹51,000)
- Numerology Report: Basic (₹1,100), Correction (₹5,100), With Call (₹11,000)
- Couple Match Making: Basic (₹1,100), Match+1Q (₹3,300), Match+Call (₹11,000)
- Baby Name Report: Report (₹1,100), Report+Name (₹5,100)
- Career/Love/Health Problem: PDF Report (₹999), 1-on-1 Call (₹11,000)
- Surbhi Kundli: 10-Yr Report (₹999)

RULES:
- Always greet with "Radhe Radhe 🙏" at the start.
- Keep your response conversational, warm, and under 4 short sentences.
- NEVER offer free readings, free advice, or exact predictions.
- End your response EXACTLY with this meaning (translate to Hinglish/Hindi to match the user, but keep the exact quote 'Main Menu 📋'): "Please click the 'Main Menu 📋' button below to explore how Surbhi Ji can help you."
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
    let isAiResponse = false; // Flag to identify if Gemini answered

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

    // NEW: Log both the User's incoming message AND the Bot's exact outgoing reply!
    const backgroundTasks = async () => {
      await Promise.all([
        redis.set(`user_state:${from}`, JSON.stringify(finalNewState), "EX", 86400),
        redis.hset("wa_last_interaction", from, Date.now().toString()),
        redis.hset("wa_names", from, waName),
        (async () => {
          await connectDB();
          
          // 1. Log the User's incoming message
          await Chat.create({ 
            phoneNumber: from, 
            waName, 
            message: incomingText, 
            step: finalNewState.step, 
            type: msgType, 
            timestamp: new Date() 
          });

          // 2. Log the Bot's exact outgoing reply
          // Wait 1 second to ensure the bot message appears AFTER the user message chronologically
          await new Promise(resolve => setTimeout(resolve, 1000));
          await Chat.create({ 
            phoneNumber: from, 
            waName: "Bot", 
            message: finalReply, 
            step: finalNewState.step, 
            type: isAiResponse ? "bot_ai_response" : "bot_flow_response", 
            timestamp: new Date() 
          });

        })()
      ]);
    };

    await sendWhatsAppMessage(from, finalReply, { buttons: finalButtons, list: finalList, image: finalImage, urlButton: finalUrlButton });
    
    backgroundTasks();

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}