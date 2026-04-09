// app/api/webhook/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";

const resend = new Resend(process.env.RESEND_API_KEY);
const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 3
});

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

      // ==========================================
      // SEND EMAILS (CUSTOMER & ADMIN)
      // ==========================================
      const adminEmail = process.env.ADMIN_EMAIL || "developer.thinqit@gmail.com"; 
      const senderEmail = process.env.EMAIL_FROM || "surabhiastrology <careers@thinqit.in>";

      // 1. Email to Customer
      const { error: customerError } = await resend.emails.send({
        from: senderEmail,
        to: order.customer.email,
        subject: `Your ${order.reportType} Order is Confirmed! ✨`,
        html: `<h2>Radhe Radhe ${order.customer.name} ji,</h2><p>Your payment of ₹${order.amount} for the <strong>${order.reportType}</strong> is confirmed. Please check your WhatsApp for the next steps!</p>`,
      });

      if (customerError) console.error("❌ Webhook Failed to send Customer Email:", customerError);

      // 2. Email to Admin
      const { error: adminError } = await resend.emails.send({
        from: senderEmail,
        to: adminEmail,
        subject: `🚨 NEW ORDER via Webhook: ${order.reportType}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
            <h2 style="color: #8B1E1E; border-bottom: 2px solid #8B1E1E; padding-bottom: 10px;">New Order Received! (Webhook) 🚀</h2>
            
            <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">🛒 Order Details</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin-bottom: 8px;"><strong>Package:</strong> ${order.reportType}</li>
              <li style="margin-bottom: 8px;"><strong>Amount Paid:</strong> ₹${order.amount}</li>
              <li style="margin-bottom: 8px;"><strong>Payment ID:</strong> ${paymentId}</li>
            </ul>

            <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">👤 Contact Info</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin-bottom: 8px;"><strong>Name:</strong> ${order.customer.name}</li>
              <li style="margin-bottom: 8px;"><strong>WhatsApp:</strong> ${order.customer.phone}</li>
              <li style="margin-bottom: 8px;"><strong>Email:</strong> ${order.customer.email}</li>
            </ul>

            <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">✨ Birth & Astrological Details</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin-bottom: 8px;"><strong>Date of Birth:</strong> ${order.customer.dob}</li>
              <li style="margin-bottom: 8px;"><strong>Time of Birth:</strong> ${order.customer.tob}</li>
              <li style="margin-bottom: 8px;"><strong>City of Birth:</strong> ${order.customer.city}</li>
              <li style="margin-bottom: 8px;"><strong>Pin Code:</strong> ${order.customer.pinCode}</li>
              <li style="margin-bottom: 8px;"><strong>Gender:</strong> <span style="text-transform: capitalize;">${order.customer.gender || "Not specified"}</span></li>
            </ul>

            <h3 style="background-color: #f9f9f9; padding: 8px; margin-top: 20px;">🎯 Preferences</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin-bottom: 8px;"><strong>Language:</strong> <span style="text-transform: capitalize;">${order.customer.language || "Not specified"}</span></li>
              <li style="margin-bottom: 8px;"><strong>Current Challenge:</strong> ${order.customer.challenge || "None"}</li>
            </ul>
          </div>
        `,
      });

      if (adminError) console.error("❌ Webhook Failed to send Admin Email:", adminError);

      // ==========================================
      // TRIGGER WHATSAPP BOT
      // ==========================================
      let formattedPhone = order.customer.phone.replace(/\D/g, ""); 
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`; 
      }

      const reportType = order.reportType || "Service"; 
      const isHi = order.customer.language === "hindi"; 
      const isCareer = reportType.toLowerCase().includes("career") || reportType.toLowerCase().includes("करियर");

      let replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${order.customer.name || "ji"}!*\nYour order for the *${reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳`;
      
      if (!isCareer) {
        // Normal Flow (No Free Question)
        await sendWhatsAppMessage(formattedPhone, replyMessage);
        const newState = { step: "F1_END", userData: { name: order.customer.name } };
        await redis.set(`user_state:${formattedPhone}`, JSON.stringify(newState), "EX", 86400);
      } else {
        // Career Flow (Ask Free Question)
        replyMessage += `\n\n🎁 *Bonus:* As promised, please click below to choose your 1 FREE career question!`;
        const buttons = isHi ? ["प्रश्न पूछें"] : ["Ask Question"]; 
        
        await sendWhatsAppMessage(formattedPhone, replyMessage, buttons);
        
        // Set state to F1_START so when they click the button, waFlow.ts sends the List of questions
        const newState = { step: "F1_START", userData: { name: order.customer.name, intent: reportType, language: isHi ? "hi" : "en" } };
        await redis.set(`user_state:${formattedPhone}`, JSON.stringify(newState), "EX", 86400);
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}