import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { razorpay } from "@/lib/razorpay";

const schema = z.object({
  amount: z.number().positive(), // rupees
  receipt: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const order = await razorpay.orders.create({
      amount: Math.round(body.amount * 100), // paise
      currency: "INR",
      receipt: body.receipt,
    });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Could not create order" },
      { status: 400 }
    );
  }
}