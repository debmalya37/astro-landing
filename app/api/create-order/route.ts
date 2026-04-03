// app/api/create-order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  // ✅ MOVED INSIDE THE FUNCTION
  // Now this only runs when a user actually clicks "Pay", not during the Vercel build!
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });

  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // Razorpay requires the amount in subunits (paise for INR)
    // So ₹499 becomes 49900
    const amountInPaise = amount * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      // payment_capture: 1, // Note: payment_capture is deprecated in newer Razorpay SDKs, but harmless if required by your version
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}