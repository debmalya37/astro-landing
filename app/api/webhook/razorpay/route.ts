// app/api/webhook/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";

const resend = new Resend(process.env.RESEND_API_KEY);
const redis = new Redis(process.env.REDIS_URL!);

// Helper: Connect DB
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

// Order Schema
const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({
  paymentId: String,
  orderId: String,
  amount: Number,
  reportType: String,
  customer: Object,
  offers: Object,
  status: String,
}));

// Helper: Send Meta WhatsApp Message
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[]) {
  const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  let payload: any = { messaging_product: "whatsapp", to };

  if (buttons && buttons.length > 0) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text },
      action: { buttons: buttons.slice(0, 3).map((btnTitle, index) => ({ type: "reply", reply: { id: `btn_${index}`, title: btnTitle.substring(0, 20) } })) }
    };
  } else {
    payload.type = "text"; payload.text = { body: text };
  }

  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text(); // Razorpay webhooks require raw text for verification
    const signature = req.headers.get("x-razorpay-signature");

    // 1. Verify Webhook Signature
    // NOTE: You must generate a Webhook Secret in Razorpay Dashboard and add it to your .env
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // 2. Only process successful payments
    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;
      const paymentId = paymentData.id;

      await connectDB();
      
      // 3. Find the pending order we saved earlier
      const order = await Order.findOne({ orderId: razorpayOrderId });
      
      if (!order || order.status === "Paid") {
        return NextResponse.json({ status: "ok" }); // Already processed
      }

      // 4. Mark as Paid!
      order.status = "Paid";
      order.paymentId = paymentId;
      await order.save();

      // 5. Send Email
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
        to: order.customer.email,
        subject: "Your Kundali Report Order is Confirmed! ✨",
        html: `<h2>Hi ${order.customer.name},</h2><p>Payment of ₹${order.amount} confirmed.</p>`,
      });

      // 6. Send WhatsApp Flow 1 Message
      let formattedPhone = order.customer.phone.replace(/\D/g, ""); 
      if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

      const replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${order.customer.name} ji!*\nYour order for the Complete Kundali Report has been confirmed.\n\nBefore Surbhi ji begins, we need one thing from you 👇\n\n*Please share your exact birth details:*\n1️⃣ Full Date of Birth (DD/MM/YYYY)\n2️⃣ Exact Time of Birth\n3️⃣ Place of Birth`;
      const buttons = ["I'll share details now", "I don't know my time"];

      await sendWhatsAppMessage(formattedPhone, replyMessage, buttons);

      // Update Redis State
      await redis.set(`user_state:${formattedPhone}`, JSON.stringify({ step: "F1_AWAITING_DETAILS", userData: { name: order.customer.name } }), "EX", 86400);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}