// app/api/payment-success/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";

// ==========================================
// 1. INITIALIZE SERVICES
// ==========================================

// Resend (Email)
const resend = new Resend(process.env.RESEND_API_KEY);

// Redis (For WhatsApp Bot State)
const redis = new Redis(process.env.REDIS_URL!);

// MongoDB Connection Helper
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in env");
  await mongoose.connect(process.env.MONGODB_URI);
}

// MongoDB Order Schema
const OrderSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  reportType: { type: String },
  customer: {
    name: String,
    email: String,
    phone: String,
    dob: String,
    tob: String,
    city: String,
    pinCode: String,
    gender: String,
    language: String,
    challenge: String,
  },
  offers: {
    expressDelivery: Boolean,
    consultation: Boolean,
  },
  status: { type: String, default: "Paid" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

// ==========================================
// Helper: Send Meta WhatsApp Message
// ==========================================
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[]) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID!;
  const token = process.env.WHATSAPP_TOKEN!;
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  let payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
  };

  if (buttons && buttons.length > 0) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text: text },
      action: {
        buttons: buttons.slice(0, 3).map((btnTitle, index) => ({
          type: "reply",
          reply: { id: `btn_${index}`, title: btnTitle.substring(0, 20) }
        }))
      }
    };
  } else {
    payload.type = "text";
    payload.text = { body: text };
  }

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// ==========================================
// 2. MAIN POST HANDLER
// ==========================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, form, offers, finalAmount } = body;

    // A. VERIFY SIGNATURE (SECURITY)
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    // B. SAVE TO MONGODB
    await connectDB();
    const newOrder = await Order.create({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: finalAmount,
      reportType: form.reportType,
      customer: form,
      offers: offers,
    });
    console.log("✅ Order saved to DB:", newOrder._id);

    // C. SEND CONFIRMATION EMAIL (RESEND)
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
        to: form.email,
        subject: "Your Fortune Report Order is Confirmed! ✨",
        html: `<h2>Hi ${form.name},</h2><p>We received your payment of ₹${finalAmount}.</p>`,
      });
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);
    }

    // D. TRIGGER WHATSAPP BOT (META API + REDIS)
    try {
      // Meta requires phone numbers to have country code but NO '+' sign
      let formattedPhone = form.phone.replace(/\D/g, ""); 
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`; // Add India code if missing
      }

      // 1. Prepare the Flow 1 Start Message
      const replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${form.name} ji!*\nYour order for the Complete Kundali Report has been confirmed.\n\nBefore Surbhi ji begins, we need one thing from you 👇\n\n*Please share your exact birth details:*\n1️⃣ Full Date of Birth (DD/MM/YYYY)\n2️⃣ Exact Time of Birth\n3️⃣ Place of Birth`;
      const buttons = ["I'll share details now", "I don't know my time"];

      // 2. Send the message via Meta
      await sendWhatsAppMessage(formattedPhone, replyMessage, buttons);
      console.log("✅ WhatsApp confirmation sent to:", formattedPhone);

      // 3. Update the user's Bot State in Redis so it expects their birth details next!
      const newState = { 
        step: "F1_AWAITING_DETAILS", 
        userData: { name: form.name } 
      };
      await redis.set(`user_state:${formattedPhone}`, JSON.stringify(newState), "EX", 86400);

    } catch (waError) {
      console.error("❌ Failed to trigger WhatsApp Bot:", waError);
    }

    // E. RETURN SUCCESS TO FRONTEND
    return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}