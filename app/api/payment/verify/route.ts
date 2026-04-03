import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { sendEmail, sendSMS, sendWhatsApp } from "@/lib/notify";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    planId: z.enum(["basic", "premium"]),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest("hex");

    const isValid = generated === body.razorpay_signature;
    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // TODO: save order to DB here

    const text = `Hi ${body.customer.name}, your Astrologar ${body.customer.planId} report order is confirmed. Payment ID: ${body.razorpay_payment_id}.`;

    await Promise.allSettled([
      sendEmail({
        to: body.customer.email,
        subject: "Astrologar Report Purchase Confirmed",
        html: `<p>Hello ${body.customer.name},</p><p>Your <b>${body.customer.planId}</b> report order is confirmed.</p><p>Payment ID: ${body.razorpay_payment_id}</p>`,
      }),
      sendSMS({
        to: body.customer.phone,
        body: text,
      }),
      sendWhatsApp({
        to: body.customer.phone,
        body: text,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Verification failed" },
      { status: 400 }
    );
  }
}