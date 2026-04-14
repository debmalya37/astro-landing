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
  await mongoose.connect(process.env.MONGODB_URI!);
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
// Helper: Send Meta WhatsApp Message (Awaited)
// ==========================================
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[]) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
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

// ==========================================
// 2. MAIN POST HANDLER
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, form, offers, finalAmount } = body;

    // A. VERIFY SIGNATURE
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    // B. SAVE TO MONGODB
    await connectDB();
    const existingOrder = await Order.findOne({ orderId: razorpay_order_id });
    if (existingOrder && existingOrder.status === "Paid") {
       return NextResponse.json({ success: true, message: "Duplicate" }, { status: 200 });
    }

    await Order.create({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: finalAmount,
      reportType: form.reportType,
      customer: form,
      offers: offers,
    });

    // C. PREPARE NOTIFICATION DATA
    const adminEmail = process.env.ADMIN_EMAIL || "developer.thinqit@gmail.com"; 
    const senderEmail = process.env.EMAIL_FROM || "surabhiastrology <careers@thinqit.in>";
    
    let formattedPhone = form.phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

    const reportType = form.reportType || "Service";
    const isHi = form.language === "hindi";
    const isCareer = reportType.toLowerCase().includes("career") || reportType.toLowerCase().includes("करियर");

    let replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${form.name || "ji"}!*\nYour order for the *${reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳`;
    let waButtons: string[] | undefined = undefined;

    if (isCareer) {
      replyMessage += `\n\n🎁 *Bonus:* As promised, please click below to choose your 1 FREE career question!`;
      waButtons = isHi ? ["प्रश्न पूछें"] : ["Ask Question"];
    }

    // D. CRITICAL: EXECUTE ALL EXTERNAL CALLS SIMULTANEOUSLY & WAIT
    // Promise.allSettled ensures that one failure doesn't stop the others, 
    // and the server waits for all of them to resolve before terminating.
    const results = await Promise.allSettled([
      // 1. Customer Email
      resend.emails.send({
        from: senderEmail,
        to: form.email,
        subject: `Your ${form.reportType} Order is Confirmed! ✨`,
        html: `<h2>Radhe Radhe ${form.name} ji,</h2><p>Your payment of ₹${finalAmount} for the <strong>${form.reportType}</strong> is confirmed. Please check your WhatsApp for next steps!</p>`,
      }),
      // 2. Admin Email
      resend.emails.send({
        from: senderEmail,
        to: adminEmail,
        subject: `🚨 NEW ORDER: ${form.reportType}`,
        html: `<div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #8B1E1E;">New Order Received! 🚀</h2>
                <p><strong>Customer:</strong> ${form.name} (${form.phone})</p>
                <p><strong>Package:</strong> ${form.reportType} - ₹${finalAmount}</p>
                <p><strong>Birth Details:</strong> ${form.dob} | ${form.tob} | ${form.city}</p>
                <p><strong>Challenge:</strong> ${form.challenge || "None"}</p>
              </div>`,
      }),
      // 3. WhatsApp Message
      sendWhatsAppMessage(formattedPhone, replyMessage, waButtons),
      // 4. Redis Bot State
      redis.set(
        `user_state:${formattedPhone}`, 
        JSON.stringify({ 
          step: isCareer ? "F1_START" : "F1_END", 
          userData: { name: form.name, intent: reportType, language: isHi ? "hi" : "en" } 
        }), 
        "EX", 86400
      )
    ]);

    // Optional: Log failures in Vercel console for debugging
    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.error(`Task ${idx} failed:`, result.reason);
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Critical verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}