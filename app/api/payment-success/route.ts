// app/api/payment-success/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";

// ==========================================
// 1. INITIALIZE SERVICES
// ==========================================
const resend = new Resend(process.env.RESEND_API_KEY);
const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 3
});

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in env");
  await mongoose.connect(process.env.MONGODB_URI);
}

const OrderSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  reportType: { type: String },
  customer: {
    name: String, email: String, phone: String,
    dob: String, tob: String, city: String,
    pinCode: String, gender: String, language: String, challenge: String,
  },
  offers: { expressDelivery: Boolean, consultation: Boolean },
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

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  if (buttons && buttons.length > 0) {
    payload.type = "interactive";
    payload.interactive = {
      type: "button",
      body: { text: text },
      action: {
        buttons: buttons.slice(0, 3).map((btnTitle, index) => ({
          type: "reply",
          // Meta limits button titles to 20 characters!
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
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

    // A. VERIFY SIGNATURE
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
    
    // Check if webhook already processed this to prevent duplicate messages
    const existingOrder = await Order.findOne({ orderId: razorpay_order_id });
    if (existingOrder && existingOrder.status === "Paid") {
       return NextResponse.json({ success: true, message: "Already processed by webhook" }, { status: 200 });
    }

    const newOrder = await Order.create({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: finalAmount,
      reportType: form.reportType,
      customer: form,
      offers: offers,
    });

    // C. SEND EMAILS (CUSTOMER & ADMIN)
    try {
      // 1. Email to Customer
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
        to: form.email,
        subject: `Your ${form.reportType} Order is Confirmed! ✨`,
        html: `<h2>Radhe Radhe ${form.name} ji,</h2><p>Your payment of ₹${finalAmount} for the <strong>${form.reportType}</strong> is confirmed. Please check your WhatsApp for the next steps!</p>`,
      });

      // 2. Email to Admin (YOU)
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
        to: process.env.ADMIN_EMAIL || "your-email@example.com", // Add your email here or in .env
        subject: `🚨 NEW ORDER: ${form.reportType}`,
        html: `
          <h2>New Order Received! 🚀</h2>
          <p><strong>Customer:</strong> ${form.name}</p>
          <p><strong>Phone:</strong> ${form.phone}</p>
          <p><strong>Email:</strong> ${form.email}</p>
          <p><strong>Service Ordered:</strong> ${form.reportType}</p>
          <p><strong>Amount Paid:</strong> ₹${finalAmount}</p>
        `,
      });
    } catch (emailError) {
      console.error("❌ Failed to send emails:", emailError);
    }

    // D. TRIGGER WHATSAPP BOT
    try {
      let formattedPhone = form.phone.replace(/\D/g, ""); 
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`; 
      }

      // Dynamic Message with Service Name and 72 hours
      const replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${form.name} ji!*\nYour order for the *${form.reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳\n\nBefore we begin, we need your birth details 👇\n\n*1️⃣ Full Date of Birth (DD/MM/YYYY)*\n*2️⃣ Exact Time of Birth*\n*3️⃣ Place of Birth*`;
      
      // Kept under 20 characters!
      const buttons = ["Share Details Now", "Don't know time"];

      await sendWhatsAppMessage(formattedPhone, replyMessage, buttons);

      // Update the user's Bot State in Redis
      const newState = { 
        step: "F1_AWAITING_DETAILS", 
        userData: { name: form.name } 
      };
      await redis.set(`user_state:${formattedPhone}`, JSON.stringify(newState), "EX", 86400);

    } catch (waError) {
      console.error("❌ Failed to trigger WhatsApp Bot:", waError);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
