// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nextMessage } from "@/lib/waFlow";
import Redis from "ioredis";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";

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

// Initialize Gemini Client
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
// OPTIMIZED FOR FREE TIER (15 Requests Per Minute)
const MODELS = [
  'gemini-1.5-flash', 
  'gemini-2.5-flash',                   // Fallback 2
  'gemini-2.0-flash',        // Primary: Extremely stable, fast, handles Free Tier perfectly
  'gemini-1.5-flash-8b'     // Fallback: Lighter version in case the main server is overloaded
];

const GEMINI_SYSTEM_PROMPT = `
You are the official, empathetic AI assistant for Celebrity Astrologer Surbhi Gupta.
Your ultimate goal is to convert the user into a client by making them feel heard and understood.

CRITICAL INSTRUCTIONS:
1. EMPATHY FIRST: If the user shares a problem (e.g., career stress, heartbreak, confusion), DO NOT jump straight to selling. 
2. VALIDATE: Start by warmly acknowledging their feelings (e.g., "I completely understand how stressful career uncertainty can be...", "Heartbreak is very painful, but planetary phases do pass...").
3. BRIDGE TO SERVICE: Gently explain that astrology is a tool for clarity, and Surbhi Ji can help them navigate this difficult time.
4. CALL TO ACTION: Always end your response by guiding them to the services menu.

Available Services for your reference:
- Surbhi Consultation: Offline (₹24,000), Priority (₹51,000)
- Numerology Report: Basic (₹1,100), Correction (₹5,100), With Call (₹11,000)
- Couple Match Making: Basic (₹1,100), Match+1Q (₹3,300), Match+Call (₹11,000)
- Baby Name Report: Report (₹1,100), Report+Name (₹5,100)
- Career/Love/Health Problem: PDF Report (₹999), 1-on-1 Call (₹11,000)
- Surbhi Kundli: 10-Yr Report (₹999)

RULES:
- Always greet with "Radhe Radhe 🙏" if it's the first response.
- Keep your response conversational, warm, and under 4 short sentences.
- NEVER offer free readings, free advice, or exact predictions.
- End your response EXACTLY with this sentence: "Please click the 'Main Menu' button below to explore how Surbhi Ji can help you."
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

    // Fast Duplicate Check
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
    
    // ==========================================
    // CRITICAL FIX: ADMIN MANUAL CHAT HANDOFF & BUTTON MAPPING
    // ==========================================
    let lowerInput = incomingText.toLowerCase();

    // Map the new "Main Menu" button back to the "restart" command so waFlow understands it!
    if (lowerInput.includes("main menu")) {
      incomingText = "restart";
      lowerInput = "restart";
    }
    
    // If the admin has paused this chat from the dashboard, block AI and Flow execution
    if (prev.step === "PAUSED_BY_ADMIN" && !["restart", "hi", "hello"].includes(lowerInput)) {
       await connectDB();
       await Chat.create({ phoneNumber: from, waName, message: incomingText, step: "PAUSED_BY_ADMIN", type: msgType, timestamp: new Date() });
       return new NextResponse("OK", { status: 200 }); 
    }

    // ==========================================
    // SMART ROUTING LOGIC (Flow vs AI Fallback)
    // ==========================================
    const isStandardCommand = ["restart", "hi", "hello", "hi surbhi", "paid"].includes(lowerInput);
    const isInteractive = msgType === "list_selection" || msgType === "button_click";
    
    // If user is explicitly asked for their problem (F2_HOOK), let the waFlow handle it
    const isExpectingFreeText = prev.step === "F2_HOOK" || prev.step === "F1_START";

    let finalReply = "";
    let finalButtons: string[] | undefined = undefined;
    let finalList: any = undefined;
    let finalImage: string | undefined = undefined;
    let finalUrlButton: any = undefined;
    let finalNewState = prev;

    if (isInteractive || isStandardCommand || isExpectingFreeText) {
      // 1. ROUTE TO PREDEFINED HARDCODED FLOW
      const result = nextMessage(incomingText, prev);
      finalReply = result.reply;
      finalButtons = result.buttons;
      finalList = result.list;
      finalImage = result.image;
      finalUrlButton = result.urlButton;
      finalNewState = result.newState;
    } else {
      // 2. ROUTE TO GEMINI AI FALLBACK (WITH SMART FREE-TIER RETRY LOGIC)
      let aiSuccess = false;

      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: incomingText,
            config: {
              systemInstruction: GEMINI_SYSTEM_PROMPT,
              temperature: 0.7, // Keeps the AI creative and empathetic
            }
          });
          
          finalReply = response.text || "Radhe Radhe 🙏! How can I help you today?";
          finalButtons = ["Main Menu 📋"]; // Updated to Main Menu!
          finalNewState = { step: "START", userData: prev.userData }; 
          
          aiSuccess = true;
          break; // Exit the loop if the model succeeds

        } catch (geminiError: any) {
          console.warn(`[Gemini Fallback] Model ${modelName} failed:`, geminiError.message);
          
          // CRITICAL FREE TIER CHECK
          if (geminiError.status === 429 || geminiError.message?.includes("429") || geminiError.message?.includes("quota")) {
            console.error("[Gemini Fallback] Free Tier Rate Limit Hit (15 RPM)!");
            break; 
          }
        }
      }

      // 3. FINAL CATCH-ALL IF API IS RATE-LIMITED OR MODELS FAIL
      if (!aiSuccess) {
        finalReply = `Radhe Radhe ${waName} ji 🙏\n\nI understand you are seeking guidance, and I am here to help. To ensure you get the right support, please tap the button below to view our specific consultation services.`;
        finalButtons = ["Main Menu 📋"]; // Updated to Main Menu!
        finalNewState = { step: "START", userData: prev.userData };
      }
    }

    // BACKGROUND TASKS
    const backgroundTasks = async () => {
      await Promise.all([
        redis.set(`user_state:${from}`, JSON.stringify(finalNewState), "EX", 86400),
        redis.hset("wa_last_interaction", from, Date.now().toString()),
        redis.hset("wa_names", from, waName),
        (async () => {
          await connectDB();
          await Chat.create({ phoneNumber: from, waName, message: incomingText, step: finalNewState.step, type: msgType, timestamp: new Date() });
        })()
      ]);
    };

    // Execute sending and background tasks
    await sendWhatsAppMessage(from, finalReply, { buttons: finalButtons, list: finalList, image: finalImage, urlButton: finalUrlButton });
    
    // Start background tasks without awaiting them to block the response
    backgroundTasks();

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}