import { NextResponse } from "next/server";
import mongoose from "mongoose";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

const Chat = mongoose.models.Chat || mongoose.model("Chat", new mongoose.Schema({
  phoneNumber: String, waName: String, message: String, step: String, timestamp: Date
}));

export async function GET() {
  try {
    await connectDB();
    // Get latest chats, sorted by newest first
    const chats = await Chat.find().sort({ timestamp: -1 }).limit(100);
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}