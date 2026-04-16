import { NextResponse } from "next/server";
import mongoose from "mongoose";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({}, { strict: false }));

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({ status: "Paid" }).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}