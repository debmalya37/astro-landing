// app/api/webhook/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";

const resend = new Resend(process.env.RESEND_API_KEY);
const redis = new Redis(process.env.REDIS_URL!);

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
}

const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({
  paymentId: String, orderId: String, amount: Number, reportType: String, customer: Object, offers: Object, status: String,
}));

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
    const rawBody = await req.text(); 
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;
      const paymentId = paymentData.id;

      await connectDB();
      
      const order = await Order.findOne({ orderId: razorpayOrderId });
      
      // Prevent duplicates: If payment-success already did this, skip it!
      if (!order || order.status === "Paid") {
        return NextResponse.json({ status: "ok" }); 
      }

      // Mark as Paid
      order.status = "Paid";
      order.paymentId = paymentId;
      await order.save();

      // Send Emails
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
        to: order.customer.email,
        subject: `Your ${order.reportType} Order is Confirmed! ✨`,
        html: `<h2>Radhe Radhe ${order.customer.name} ji,</h2><p>Payment of ₹${order.amount} for the ${order.reportType} is confirmed.</p>`,
      });

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
        to: process.env.ADMIN_EMAIL || "your-email@example.com",
        subject: `🚨 NEW ORDER via Webhook: ${order.reportType}`,
        html: `<h2>New Order! 🚀</h2><p>${order.customer.name} paid ₹${order.amount} for ${order.reportType}.</p><p>Phone: ${order.customer.phone}</p>`,
      });

      // Send WhatsApp Message
      let formattedPhone = order.customer.phone.replace(/\D/g, ""); 
      if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

      const replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${order.customer.name} ji!*\nYour order for the *${order.reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳\n\nBefore we begin, we need your birth details 👇\n\n*1️⃣ Full Date of Birth (DD/MM/YYYY)*\n*2️⃣ Exact Time of Birth*\n*3️⃣ Place of Birth*`;
      const buttons = ["Share Details Now", "Don't know time"];

      await sendWhatsAppMessage(formattedPhone, replyMessage, buttons);

      await redis.set(`user_state:${formattedPhone}`, JSON.stringify({ step: "F1_AWAITING_DETAILS", userData: { name: order.customer.name } }), "EX", 86400);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}