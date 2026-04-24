// app/api/webhook/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { Resend } from "resend";
import Redis from "ioredis";
import { connectDB } from "@/lib/mongodb";

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
    name: String, dob: String, tob: String, city: String, gender: String
  },
  challenge: { type: String },
  status: { type: String, default: "Paid" },
  reportSent: { type: Boolean, default: false }, 
  answerSent: { type: Boolean, default: false },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

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
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`WA API Error: ${JSON.stringify(err)}`);
  }
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
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const { id: paymentId, order_id: razorpayOrderId, notes, amount: amountPaise } = event.payload.payment.entity;

      await connectDB();
      
      const order = await Order.findOne({ orderId: razorpayOrderId });
      
      if (order && order.status === "Paid") {
        return NextResponse.json({ status: "already_processed" }, { status: 200 }); 
      }

      // 1. EXTRACT DATA FROM NOTES (This is crucial)
      // We assume your create-order API passes: notes: { formData: JSON.stringify(form) }
      const formData = notes?.formData ? JSON.parse(notes.formData) : {};

      if (!order) {
        // Fallback: Create Order if success API hasn't run yet
        await Order.create({
          paymentId,
          orderId: razorpayOrderId,
          amount: amountPaise / 100,
          reportType: formData.reportType || "Vedic Report",
          customer: formData,
          partner: {
            name: formData?.partnerName,
            dob: formData?.partnerDob,
            tob: formData?.partnerTob,
            city: formData?.partnerCity,
            gender: formData?.partnerGender
          },
          challenge: formData.challenge || "No specific challenge provided",
          status: "Paid",
          createdAt: new Date()
        });
      } else {
        // Update existing pending order
        await Order.updateOne(
          { _id: order._id },
          { $set: { status: "Paid", paymentId: paymentId, challenge: formData.challenge } }
        );
      }

      // 2. TRIGGER NOTIFICATIONS (Same as payment-success)
      const finalOrder = await Order.findOne({ orderId: razorpayOrderId }).lean();
      await triggerNotifications(finalOrder, paymentId);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error: any) {
    console.error("Critical Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}

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
    // Customer Email
    resend.emails.send({
      from: senderEmail,
      to: order.customer.email,
      subject: `Order Confirmed: ${order.reportType} ✨`,
      html: `<h2>Radhe Radhe ${order.customer.name} ji,</h2><p>Your payment for <strong>${order.reportType}</strong> is confirmed. Check WhatsApp for updates!</p>`,
    }),

    // Admin Email (Full details)
    resend.emails.send({
      from: senderEmail,
      to: adminEmails,
      subject: `🚨 NEW ORDER RECEIVED VIA WEBHOOK ORDER: ${order.customer.name} [₹${order.amount}]`,
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

           <div style="background: #f9f9f9; padding: 10px; margin-top: 10px;">
            <strong>Current Challenge:</strong> ${order.challenge}
          </div>
          </div>
        </div>
      `,
    }),

    sendWhatsAppMessage(formattedPhone, replyMessage, waButtons),

    getRedis().set(
      `user_state:${formattedPhone}`, 
      JSON.stringify({ 
        step: isCareer ? "F1_START" : "F1_END", 
        userData: { name: order.customer.name, intent: reportType, language: isHi ? "hi" : "en", challenge: order.challenge } 
      }), 
      "EX", 86400
    )
  ]);
}