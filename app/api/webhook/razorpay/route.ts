import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";
import { connectDB } from "@/lib/mongodb";

// --- 1. Singleton Service Initialization ---
const resend = new Resend(process.env.RESEND_API_KEY);

let redis: Redis;
const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
  }
  return redis;
};

// Define Schema to match payment-success exactly
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
  partner: {
    name: String,
    dob: String,
    tob: String,
    city: String,
    gender: String
  },
  challenge: { type: String },
  status: { type: String, default: "Paid" },
  reportSent: { type: Boolean, default: false }, 
  answerSent: { type: Boolean, default: false },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

// --- 2. Helper: Send Meta WhatsApp Message ---
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[]) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`; 

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

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const { id: paymentId, order_id: razorpayOrderId, notes } = event.payload.payment.entity;

      await connectDB();
      
      const order = await Order.findOne({ orderId: razorpayOrderId })
       .select("+customer +reportType +status +amount")
        .lean();
      
      // Prevent double processing if success API already finished
      if (order && order.status === "Paid") {
        return NextResponse.json({ status: "already_processed" }, { status: 200 }); 
      }

      /**
       * NOTE: Webhooks usually only have 'notes' if you passed them to Razorpay.
       * If your frontend 'form' data isn't in notes, we check if the order exists.
       * If it doesn't exist yet, we create it using the data available.
       */
      
      if (!order) {
        // Fallback creation logic if webhook hits before Success API
        // This assumes you sent the form data as 'notes' in create-order
        const formData = notes?.formData ? JSON.parse(notes.formData) : {};
        
        await Order.create({
          paymentId,
          orderId: razorpayOrderId,
          amount: event.payload.payment.entity.amount / 100, // Razorpay is in paise
          reportType: formData.reportType || "Vedic Report",
          customer: formData,
          partner: {
            name: formData.partnerName,
            dob: formData.partnerDob,
            tob: formData.partnerTob,
            city: formData.partnerCity,
            gender: formData.partnerGender
          },
          challenge: formData.challenge,
          status: "Paid",
          createdAt: new Date()
        });
      } else {
        await Order.updateOne(
          { _id: order._id },
          { $set: { status: "Paid", paymentId: paymentId } }
        );
      }

      // Re-fetch clean lean order for notifications
      const finalOrder = await Order.findOne({ orderId: razorpayOrderId }).lean();
      await triggerNotifications(finalOrder, paymentId);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error: any) {
    console.error("Critical Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}

// --- 4. Notification Logic (Synced with payment-success) ---
async function triggerNotifications(order: any, paymentId: string) {
  const adminEmails = ["developer.thinqit@gmail.com", "surabhiastrology9@gmail.com"]; 
  const senderEmail = process.env.EMAIL_FROM || "Surabhi Astrology <info@surabhiastrology.com>";
  
  let formattedPhone = order.customer.phone.replace(/\D/g, "");
  if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

  const reportType = order.reportType || "Service";
  const isHi = order.customer.language === "hindi";
  const isCareer = reportType.toLowerCase().includes("career") || reportType.toLowerCase().includes("करियर");
  const isMatchmaking = reportType.toLowerCase().includes("couple match making");

  let replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${order.customer.name || "ji"}!*\nYour order for the *${reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳`;
  let waButtons: string[] | undefined = undefined;

  if (isCareer) {
    replyMessage += `\n\n🎁 *Bonus:* As promised, please click below to choose your 1 FREE career question!`;
    waButtons = isHi ? ["प्रश्न पूछें"] : ["Ask Question"];
  }

  await Promise.allSettled([
    // 1. Customer Email
    resend.emails.send({
      from: senderEmail,
      to: order.customer.email,
      subject: `Order Confirmed: ${order.reportType} ✨`,
      html: `<h2>Radhe Radhe ${order.customer.name} ji,</h2><p>Your payment of ₹${order.amount} for the <strong>${order.reportType}</strong> is confirmed. Please check WhatsApp for next steps!</p>`,
    }),

    // 2. Admin Email (Matchmaking Aware)
    resend.emails.send({
      from: senderEmail,
      to: adminEmails,
      subject: `🚨 WEBHOOK ORDER: ${order.customer.name} [₹${order.amount}]`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #3D1600; padding: 20px; text-align: center;">
            <h2 style="color: #F5D98A; margin: 0;">Webhook Order Captured! 🚀</h2>
            <p style="color: #fff; font-size: 12px; margin-top: 5px;">Transaction ID: ${paymentId}</p>
          </div>
          
          <div style="padding: 25px;">
            <h3 style="color: #8B1E1E; border-bottom: 1px solid #eee; padding-bottom: 10px;">🛒 Details</h3>
            <p><strong>Package:</strong> ${order.reportType} - ₹${order.amount}</p>

            <h3 style="color: #8B1E1E;">👤 Person 1 (Customer)</h3>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/${formattedPhone}">+${formattedPhone}</a></p>
            <div style="background-color: #FFFBF0; padding: 15px; border-radius: 8px;">
              <p><strong>Birth Info:</strong> ${order.customer.dob} | ${order.customer.tob} | ${order.customer.city}</p>
            </div>

            ${isMatchmaking && order.partner ? `
            <h3 style="color: #8B1E1E; margin-top: 20px;">💑 Person 2 (Partner)</h3>
            <p><strong>Name:</strong> ${order.partner.name}</p>
            <div style="background-color: #F0F7FF; padding: 15px; border-radius: 8px;">
              <p><strong>Birth Info:</strong> ${order.partner.dob} | ${order.partner.tob} | ${order.partner.city}</p>
            </div>
            ` : ''}

            <div style="margin-top: 20px; padding: 15px; background-color: #f4f4f4; border-radius: 8px;">
               <p style="margin: 0; font-style: italic; color: #666;">"${order.challenge || "No specific challenge"}"</p>
            </div>
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
}