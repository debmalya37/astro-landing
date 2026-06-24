// app/api/admin/chats/send/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

const Chat = mongoose.models.Chat || mongoose.model("Chat", new mongoose.Schema({
  phoneNumber: String, waName: String, message: String, step: String, type: String, timestamp: Date
}));

export async function POST(req: Request) {
  try {
    const { phoneNumber, message } = await req.json();

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Send via Meta API
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID!;
    const token = process.env.WHATSAPP_TOKEN!;
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

    const metaRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: { body: message }
      }),
    });

    if (!metaRes.ok) {
      const errorData = await metaRes.json();
      console.error("Meta API Error:", errorData);
      return NextResponse.json({ error: "Failed to send to Meta API" }, { status: 400 });
    }

    // 2. Pause the Bot in Redis so it doesn't reply to the user's next message
    const rawPrevState = await redis.get(`user_state:${phoneNumber}`);
    const prev = rawPrevState ? JSON.parse(rawPrevState) : { userData: {} };
    
    await redis.set(`user_state:${phoneNumber}`, JSON.stringify({
      step: "PAUSED_BY_ADMIN", // This stops the webhook from triggering the flow/AI
      userData: prev.userData
    }), "EX", 86400);

    // 3. Save Admin Message to MongoDB
    await connectDB();
    const newChat = await Chat.create({
      phoneNumber,
      waName: "Admin",
      message: message,
      step: "ADMIN_MANUAL",
      type: "admin_manual", // Unique type to identify admin messages in UI
      timestamp: new Date()
    });

    return NextResponse.json({ success: true, chat: newChat });
  } catch (error) {
    console.error("Admin Send Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}