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
  await mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
  });
}

// Define Schema with tracking fields and NEW Partner details
const OrderSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  reportType: { type: String },
  customer: {
    name: String, email: String, phone: String,
    dob: String, tob: String, city: String,
    pinCode: String, gender: String, language: String, 
    challenge: String, // Stores the value from the form
  },
  partner: {
    name: String,
    dob: String,
    tob: String,
    city: String,
    gender: String
  },
  challenge: { type: String }, // Top-level field for easy dashboard access
  status: { type: String, default: "Paid" },
  reportSent: { type: Boolean, default: false }, 
  answerSent: { type: Boolean, default: false },
},
  { 
  timestamps: true 
}
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

// UPDATED: Added optional templateData parameter while keeping all old logic intact
async function sendWhatsAppMessage(to: string, text: string, buttons?: string[], templateData?: any) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

  let payload: any = { messaging_product: "whatsapp", recipient_type: "individual", to: to };

  // 1. If Template Data is provided, use it (Bypasses 24-hour rule)
  if (templateData) {
    payload.type = "template";
    payload.template = {
      name: templateData.name,
      language: { code: templateData.language },
      components: [
        {
          type: "body",
          parameters: templateData.params.map((param: string) => ({
            type: "text",
            text: param
          }))
        }
      ]
    };
  } 
  // 2. Original Interactive Button Logic
  else if (buttons && buttons.length > 0) {
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
  } 
  // 3. Original Standard Text Logic
  else {
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
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, form, finalAmount } = body;
    
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

    const newOrder = await Order.create({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: finalAmount,
      reportType: form.reportType,
      customer: form,
      partner: {
        name: form?.partnerName,
        dob: form?.partnerDob,
        tob: form?.partnerTob,
        city: form?.partnerCity,
        gender: form?.partnerGender
      },
      // CAPTURING THE DYNAMIC CHALLENGE FROM FORM
      challenge: form.challenge || "No specific challenge provided",
      reportSent: false,
      answerSent: false,
      status: "Paid",
      createdAt: new Date()
    });

    console.log("new order body", newOrder);
    if (!newOrder) {
      console.log("Failed to create order in DB for:", razorpay_order_id);
      throw new Error("Failed to create order in database");
    }

    console.log("Order saved to DB with ID:", newOrder._id);


    // C. PREPARE NOTIFICATION DATA
    const adminEmails = ["developer.thinqit@gmail.com", "surabhiastrology9@gmail.com"]; 
    const senderEmail = process.env.EMAIL_FROM || "Surabhi Astrology <careers@thinqit.in>";
    
    let formattedPhone = form.phone.replace(/\D/g, "");
    if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

    const reportType = form.reportType || "Service";
    const isHi = form.language === "hindi";
    const isCareer = reportType.toLowerCase().includes("career") || reportType.toLowerCase().includes("करियर");
    const isMatchmaking = reportType.toLowerCase().includes("couple match making");

    let replyMessage = `✅ *Payment Confirmed!*\n\n🙏 *Radhe Radhe, ${form.name || "ji"}!*\nYour order for the *${reportType}* has been successfully confirmed.\n\nSurbhi ji and the team will deliver your detailed analysis right here within *72 hours*. ⏳`;
    let waButtons: string[] | undefined = undefined;

    if (isCareer) {
      replyMessage += `\n\n🎁 *Bonus:* As promised, please click below to choose your 1 FREE career question!`;
      waButtons = isHi ? ["प्रश्न पूछें"] : ["Ask Question"];
    }

    // NEW: Prepare Template Data for the 24-hour restriction bypass
    let templateName = "";
    if (isCareer) {
      templateName = isHi ? "payment_career_hi" : "payment_career_en";
    } else {
      templateName = isHi ? "payment_general_hi" : "payment_general_en";
    }

    const waTemplateData = {
      name: templateName,
      language: isHi ? "hi" : "en",
      params: [form.name || "Customer", reportType]
    };

    // D. EXECUTE ALL NOTIFICATIONS
    const results = await Promise.allSettled([
      // 1. Customer Email
      resend.emails.send({
        from: senderEmail,
        to: form.email,
        subject: `Order Confirmed: ${form.reportType} ✨`,
        html: `<h2>Radhe Radhe ${form.name} ji,</h2><p>Your payment of ₹${finalAmount} for the <strong>${form.reportType}</strong> is confirmed. Please check your WhatsApp for next steps!</p>`,
      }),
      
      // 2. Admin Email
      resend.emails.send({
        from: senderEmail,
        to: adminEmails,
        subject: `🚨 NEW PAID ORDER: ${form.name} [₹${finalAmount}] | ${form.language}`,
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
                  <tr><td style="padding: 5px 0; color: #666;">Language:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.language}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Amount Paid:</td><td style="padding: 5px 0; font-weight: bold; text-align: right; color: #1B4D30;">₹${finalAmount}</td></tr>
                </table>
              </div>

              <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
                <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">👤 Person 1 Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0; color: #666;">Name:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.name}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Birth Info:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.dob} | ${form.tob}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Location:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.city} (${form.pinCode})</td></tr>
                </table>
              </div>

              ${isMatchmaking ? `
              <div style="margin-bottom: 25px; border-bottom: 2px solid #f8f8f8; padding-bottom: 15px;">
                <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">💑 Person 2 Details (Partner)</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0; color: #666;">Name:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.partnerName}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Birth Info:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.partnerDob} | ${form.partnerTob}</td></tr>
                  <tr><td style="padding: 5px 0; color: #666;">Location:</td><td style="padding: 5px 0; font-weight: bold; text-align: right;">${form.partnerCity}</td></tr>
                </table>
              </div>
              ` : ''}

              <div style="margin-bottom: 10px;">
                <h3 style="color: #8B1E1E; margin-bottom: 10px; font-size: 18px;">🎯 Current Challenge / Question</h3>
                <p style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; color: #333; line-height: 1.5; font-style: italic;">
                  "${form.challenge || "No specific challenge provided."}"
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/${formattedPhone}" style="background-color: #1B4D30; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">Open User WhatsApp</a>
              </div>
            </div>
          </div>
        `,
      }),
      
      // 3. WhatsApp Message (Passes the newly injected Template Data to bypass 24h rule)
      sendWhatsAppMessage(formattedPhone, replyMessage, waButtons, waTemplateData),
      
      // 4. Redis Update
      redis.set(
        `user_state:${formattedPhone}`, 
        JSON.stringify({ 
          step: isCareer ? "F1_START" : "F1_END", 
          userData: { 
            name: form.name, 
            intent: reportType, 
            language: isHi ? "hi" : "en",
            challenge: form.challenge // Sync challenge to Bot state
          } 
        }), 
        "EX", 86400
      )
    ]);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Critical verification error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}