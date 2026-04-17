// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({}, { strict: false }));

export async function GET() {
  try {
    await connectDB();
    // .lean() makes queries 3x faster by returning plain JS objects
    const orders = await Order.find({ status: "Paid" })
      .sort({ createdAt: -1 })
      .limit(200) 
      .lean(); 

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}