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
    // ✅ Updated with multiple Admin Emails
    const adminEmails = ["developer.thinqit@gmail.com", "surabhiastrology9@gmail.com"]; 
    const senderEmail = process.env.EMAIL_FROM || "Surabhi Astrology <careers@thinqit.in>";
    
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
    const results = await Promise.allSettled([
      // 1. Customer Email
      resend.emails.send({
        from: senderEmail,
        to: form.email,
        subject: `Order Confirmed: ${form.reportType} ✨`,
        html: `<h2>Radhe Radhe ${form.name} ji,</h2><p>Your payment of ₹${finalAmount} for the <strong>${form.reportType}</strong> is confirmed. Please check your WhatsApp for next steps!</p>`,
      }),
      
      // 2. Professional Admin Email (Sent to multiple admins)
      resend.emails.send({
        from: senderEmail,
        to: adminEmails,
        subject: `🚨 NEW PAID ORDER: ${form.name} [₹${finalAmount}]`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #8B1E1E; padding: 25px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Premium Order! 🚀</h1>
              <p style="color: #F5D98A; margin: 5px 0 0 0; font-weight: bold; letter-spacing: 1px;">SURABHI ASTROLOGY</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
                <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">🛒 Transaction Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0; color: #666;">Report Type:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.reportType}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Amount Paid:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #1B4D30;">₹${finalAmount}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Payment ID:</td><td style="padding: 5px 0; font-family: monospace; font-size: 12px; text-align: right;">${razorpay_payment_id}</td></tr>
                </table>
              </div>

              <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
                <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">👤 Customer Profile</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0; color: #666;">Name:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.name}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Phone:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;"><a href="https://wa.me/${formattedPhone}" style="color: #25D366; text-decoration: none;">+${formattedPhone}</a></td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Email:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.email}</td></tr>
                </table>
              </div>

              <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
                <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">✨ Birth Information</h3>
                <div style="background-color: #FFFBF0; padding: 15px; border-radius: 8px; border: 1px solid #F5D98A;">
                  <p style="margin: 5px 0;"><strong>DOB:</strong> ${form.dob}</p>
                  <p style="margin: 5px 0;"><strong>Time:</strong> ${form.tob}</p>
                  <p style="margin: 5px 0;"><strong>Location:</strong> ${form.city} (${form.pinCode})</p>
                  <p style="margin: 5px 0;"><strong>Gender:</strong> ${form.gender}</p>
                </div>
              </div>

              <div style="margin-bottom: 10px;">
                <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">🎯 The Challenge</h3>
                <p style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; color: #333; line-height: 1.5; font-style: italic;">
                  "${form.challenge || "No specific challenge mentioned."}"
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/${formattedPhone}" style="background-color: #1B4D30; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Open User WhatsApp</a>
              </div>
            </div>
            
            <div style="background-color: #f8f8f8; padding: 15px; text-align: center; color: #999; font-size: 11px;">
              System generated notification for Surabhi Astrology CRM.
            </div>
          </div>
        `,
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

    // Log failures for debugging
    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.error(`Production Task ${idx} failed:`, result.reason);
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Critical verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}