// app/api/admin/chats/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const Chat = mongoose.models.Chat || mongoose.model("Chat", new mongoose.Schema({
  phoneNumber: String, waName: String, message: String, step: String, timestamp: Date
}));

export async function GET() {
  try {
    await connectDB();
    // Limit is crucial for speed as chat logs grow
    const chats = await Chat.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
      
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}