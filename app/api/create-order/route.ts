// app/api/create-order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });

  try {
    const body = await req.json();
    const { amount, form } = body; // <--- 1. Catch the form data here

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      // 2. Staple the form data to the order using 'notes'
      notes: {
        formData: JSON.stringify(form) 
      }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}