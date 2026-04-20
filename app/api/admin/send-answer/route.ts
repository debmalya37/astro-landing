import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

// Ensure the model is available
const Order = mongoose.models.Order || mongoose.model("Order", new mongoose.Schema({}, { strict: false }));

export async function POST(req: Request) {
  try {
    // 1. Get orderId from the request so we can update the database
    const { phone, pdfUrl, fileName, userName, orderId } = await req.json();
    
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_TOKEN;
    
    if (!phoneNumberId || !token) {
      throw new Error("Missing WhatsApp Credentials");
    }

    const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;
    const cleanPhone = phone.replace(/\D/g, "");

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: "question_answer_delivery", 
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: pdfUrl,
                  filename: fileName || "Answer_Report.pdf"
                }
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: userName || "Customer" 
              }
            ]
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Meta API Error");
    }

    // ==========================================
    // CRITICAL CHANGE: Update Database Status
    // ==========================================
    await connectDB();
    if (orderId) {
      await Order.findOneAndUpdate(
        { orderId: orderId },
        { $set: { answerSent: true } }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("SEND-ANSWER ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}