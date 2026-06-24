// app/api/admin/chats/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

// CRITICAL FIX: Added `type: String` so Mongoose stops stripping it out!
const Chat = mongoose.models.Chat || mongoose.model("Chat", new mongoose.Schema({
  phoneNumber: String, 
  waName: String, 
  message: String, 
  step: String, 
  type: String, 
  timestamp: Date
}));

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get pagination params from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "200");
    const skip = (page - 1) * limit;

    const chats = await Chat.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await Chat.countDocuments();
      
    return NextResponse.json({
      chats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}