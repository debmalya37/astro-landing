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
    const adminEmail = process.env.ADMIN_EMAIL || "developer.thinqit@gmail.com"; 
    const senderEmail = process.env.EMAIL_FROM || "surabhiastrology <careers@thinqit.in>";

    // 1. Email to Customer
    const { error: customerError } = await resend.emails.send({
      from: senderEmail,
      to: form.email,
      subject: `Your ${form.reportType} Order is Confirmed! ✨`,
      html: `<h2>Radhe Radhe ${form.name} ji,</h2><p>Your payment of ₹${finalAmount} for the <strong>${form.reportType}</strong> is confirmed. Please check your WhatsApp for the next steps!</p>`,
    });

    if (customerError) {
      console.error("❌ Failed to send Customer Email:", customerError);
    } else {
      console.log("✅ Customer Email sent successfully to:", form.email);
    }

    // 2. Email to Admin (YOU) - UPDATED WITH FULL DETAILS
    const { error: adminError } = await resend.emails.send({
      from: senderEmail,
      to: adminEmail,
      subject: `🚨 NEW ORDER: ${form.reportType}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #8B1E1E; border-bottom: 2px solid #8B1E1E; padding-bottom: 10px;">New Order Received! 🚀</h2>
          
          <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">🛒 Order Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li style="margin-bottom: 8px;"><strong>Package:</strong> ${form.reportType}</li>
            <li style="margin-bottom: 8px;"><strong>Amount Paid:</strong> ₹${finalAmount}</li>
            <li style="margin-bottom: 8px;"><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
          </ul>

          <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">👤 Contact Info</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li style="margin-bottom: 8px;"><strong>Name:</strong> ${form.name}</li>
            <li style="margin-bottom: 8px;"><strong>WhatsApp:</strong> ${form.phone}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${form.email}</li>
          </ul>

          <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">✨ Birth & Astrological Details</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li style="margin-bottom: 8px;"><strong>Date of Birth:</strong> ${form.dob}</li>
            <li style="margin-bottom: 8px;"><strong>Time of Birth:</strong> ${form.tob}</li>
            <li style="margin-bottom: 8px;"><strong>City of Birth:</strong> ${form.city}</li>
            <li style="margin-bottom: 8px;"><strong>Pin Code:</strong> ${form.pinCode}</li>
            <li style="margin-bottom: 8px;"><strong>Gender:</strong> <span style="text-transform: capitalize;">${form.gender || "Not specified"}</span></li>
          </ul>

          <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">🎯 Preferences</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li style="margin-bottom: 8px;"><strong>Language:</strong> <span style="text-transform: capitalize;">${form.language || "Not specified"}</span></li>
            <li style="margin-bottom: 8px;"><strong>Current Challenge:</strong> ${form.challenge || "None"}</li>
          </ul>
        </div>
      `,
    });

    if (adminError) {
      console.error("❌ Failed to send Admin Email:", adminError);
    } else {
      console.log("✅ Admin Email sent successfully to:", adminEmail);
    }

    // D. TRIGGER WHATSAPP BOT
    // D. TRIGGER WHATSAPP BOT
    try {
      let formattedPhone = form.phone.replace(/\D/g, ""); // In webhook file use: order.customer.phone.replace(...)
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`; 
      }

      const reportType = form.reportType || "Service"; // In webhook file use: order.reportType
      const isHi = form.language === "hindi"; // In webhook file use: order.customer.language === "hindi"
      const isCareer = reportType.toLowerCase().includes("career") || reportType.toLowerCase().includes("करियर");

      let replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${form.name || "ji"}!*\nYour order for the *${reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳`;
      
      if (!isCareer) {
        // Normal Flow (No Free Question)
        await sendWhatsAppMessage(formattedPhone, replyMessage);
        
        // Mark as F1_END since we don't need any more info
        const newState = { step: "F1_END", userData: { name: form.name } };
        await redis.set(`user_state:${formattedPhone}`, JSON.stringify(newState), "EX", 86400);
      } else {
        // Career Flow (Ask Free Question)
        replyMessage += `\n\n🎁 *Bonus:* As promised, please click below to choose your 1 FREE career question!`;
        const buttons = isHi ? ["प्रश्न पूछें"] : ["Ask Question"]; // Meta max 20 chars
        
        await sendWhatsAppMessage(formattedPhone, replyMessage, buttons);
        
        // Set state to F1_START so when they click the button, waFlow.ts sends the List of questions
        const newState = { step: "F1_START", userData: { name: form.name, intent: reportType, language: isHi ? "hi" : "en" } };
        await redis.set(`user_state:${formattedPhone}`, JSON.stringify(newState), "EX", 86400);
      }

    } catch (waError) {
      console.error("❌ Failed to trigger WhatsApp Bot:", waError);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}