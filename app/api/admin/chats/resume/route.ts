// app/api/admin/chats/resume/route.ts
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
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Fetch current state to keep their name/language data
    // 1. Fetch current state to keep their name/language data
    const rawPrevState = await redis.get(`user_state:${phoneNumber}`);
    const prev = rawPrevState ? JSON.parse(rawPrevState) : { userData: {} };
    
    // Extract the user's real name (fallback to "Seeker" if missing)
    const realUserName = prev.userData.name || "Seeker";
    
    // 2. Reactivate the bot by setting the step back to START
    await redis.set(`user_state:${phoneNumber}`, JSON.stringify({
      step: "START", 
      userData: prev.userData
    }), "EX", 86400);

    // 3. Save a system event to MongoDB
    await connectDB();
    const newChat = await Chat.create({
      phoneNumber,
      waName: realUserName, // <--- CHANGED THIS HERE
      message: "AI Bot Reactivated by Admin",
      step: "START",
      type: "system_event", 
      timestamp: new Date()
    });
    return NextResponse.json({ success: true, chat: newChat });
  } catch (error) {
    console.error("Resume Bot Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}