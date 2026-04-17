import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";
import { connectDB } from "@/lib/mongodb";

// --- 1. Singleton Service Initialization ---
const resend = new Resend(process.env.RESEND_API_KEY);

// Cache Redis connection outside the handler for reuse
let redis: Redis;
const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: 3, // Fail fast in webhook context
    });
  }
  return redis;
};

const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({
  paymentId: String, 
  orderId: String, 
  amount: Number, 
  reportType: String, 
  customer: Object, 
  offers: Object, 
  status: String,
  createdAt: { type: Date, default: Date.now }
}));

// --- 2. Helper: Send Meta WhatsApp Message ---
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[]) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`; // Updated to v25.0

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  if (buttons?.length) {
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

  const response = await fetch(url, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`WA API Error: ${JSON.stringify(err)}`);
  }
}

// --- 3. Main Webhook Handler ---
export async function POST(req: Request) {
  try {
    const rawBody = await req.text(); 
    const signature = req.headers.get("x-razorpay-signature");

    // A. VERIFY WEBHOOK SIGNATURE
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // B. PROCESS ONLY CAPTURED PAYMENTS
    if (event.event === "payment.captured") {
      const { id: paymentId, order_id: razorpayOrderId } = event.payload.payment.entity;

      await connectDB();
      
      // OPTIMIZATION: Use lean() and select() for raw speed
      const order = await Order.findOne({ orderId: razorpayOrderId })
        .select("+customer +reportType +status +amount")
        .lean();
      
      if (!order || order.status === "Paid") {
        return NextResponse.json({ status: "skipped_or_duplicate" }, { status: 200 }); 
      }

      // Mark as Paid in DB immediately
      await Order.updateOne(
        { _id: order._id },
        { $set: { status: "Paid", paymentId: paymentId } }
      );

      // C. EXECUTE NOTIFICATIONS (Awaited for stability, or fire-and-forget for max speed)
      // We pass the order data to a separate function to keep the logic clean
      await triggerNotifications(order, paymentId);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error: any) {
    console.error("Critical Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}

// --- 4. Notification Logic (Preserving all your HTML/Layouts) ---
async function triggerNotifications(order: any, paymentId: string) {
  const adminEmails = ["developer.thinqit@gmail.com", "surabhiastrology9@gmail.com"]; 
  const senderEmail = process.env.EMAIL_FROM || "Surabhi Astrology <info@surabhiastrology.com>";
  
  let formattedPhone = order.customer.phone.replace(/\D/g, "");
  if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

  const reportType = order.reportType || "Service";
  const isHi = order.customer.language === "hindi";
  const isCareer = reportType.toLowerCase().includes("career") || reportType.toLowerCase().includes("करियर");

  let replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${order.customer.name || "ji"}!*\nYour order for the *${reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳`;
  let waButtons: string[] | undefined = undefined;

  if (isCareer) {
    replyMessage += `\n\n🎁 *Bonus:* As promised, please click below to choose your 1 FREE career question!`;
    waButtons = isHi ? ["प्रश्न पूछें"] : ["Ask Question"];
  }

  const results = await Promise.allSettled([
    // 1. Customer Email
    resend.emails.send({
      from: senderEmail,
      to: order.customer.email,
      subject: `Order Confirmed: ${order.reportType} ✨`,
      html: `<h2>Radhe Radhe ${order.customer.name} ji,</h2><p>Your payment of ₹${order.amount} for the <strong>${order.reportType}</strong> is confirmed. Please check WhatsApp for next steps!</p>`,
    }),

    // 2. Admin Email (Your exact layout preserved)
    resend.emails.send({
      from: senderEmail,
      to: adminEmails,
      subject: `🚨 NEW ORDER (Webhook): ${order.customer.name} [₹${order.amount}]`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #3D1600; padding: 20px; text-align: center;">
            <h2 style="color: #F5D98A; margin: 0;">Webhook Order Received! 🚀</h2>
          </div>
          <div style="padding: 25px;">
            <h3 style="color: #8B1E1E; border-bottom: 1px solid #eee; padding-bottom: 10px;">🛒 Details</h3>
            <p><strong>Customer:</strong> ${order.customer.name}</p>
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/${formattedPhone}">+${formattedPhone}</a></p>
            <p><strong>Package:</strong> ${order.reportType} - ₹${order.amount}</p>
            <div style="background-color: #FFFBF0; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p><strong>Birth Info:</strong> ${order.customer.dob} | ${order.customer.tob} | ${order.customer.city}</p>
            </div>
            <p style="margin-top: 15px; font-style: italic; color: #666;">"${order.customer.challenge || "No challenge specified"}"</p>
          </div>
        </div>
      `,
    }),

    // 3. WhatsApp Message
    sendWhatsAppMessage(formattedPhone, replyMessage, waButtons),

    // 4. Redis Bot State
    getRedis().set(
      `user_state:${formattedPhone}`, 
      JSON.stringify({ 
        step: isCareer ? "F1_START" : "F1_END", 
        userData: { name: order.customer.name, intent: reportType, language: isHi ? "hi" : "en" } 
      }), 
      "EX", 86400
    )
  ]);

  results.forEach((res, i) => {
    if (res.status === 'rejected') console.error(`Task ${i} failed:`, res.reason);
  });
}