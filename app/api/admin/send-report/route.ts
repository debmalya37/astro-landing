import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, pdfUrl, fileName, userName } = await req.json();
    
    // 1. Environment Variables Validation
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_TOKEN;
    
    if (!phoneNumberId || !token) {
      throw new Error("Missing WhatsApp Credentials in Environment Variables");
    }

    // Use v25.0 as per your successful Meta Dashboard test
    const url = `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`;

    // 2. Clean Phone Number (Meta requires digits only)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      throw new Error("Invalid phone number format");
    }

    // 3. Construct the Template Payload
    // This matches the 'report_delivery' template you just built
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: "report_delivery",
        language: {
          code: "en" // Ensure this matches the language in Meta (en or en_US)
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: pdfUrl,
                  filename: fileName || "Astrology_Report.pdf"
                }
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: userName || "Customer" // This replaces {{1}} in your body
              }
            ]
          }
        ]
      }
    };

    // 4. Execute Fetch with a Timeout
    // Vercel Free Plan has a short execution window, so we must await carefully
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // 5. Production-Grade Error Handling
    if (!response.ok) {
      console.error("META API ERROR:", JSON.stringify(data, null, 2));
      
      // Handle the specific '24-hour' error with a clear message
      if (data.error?.code === 131047) {
        throw new Error("User outside 24h window. Template message required (Fix: Template is now being used).");
      }
      
      throw new Error(data.error?.message || "Meta API Error");
    }

    console.log(`✅ Report dispatched via template to ${cleanPhone}`);
    return NextResponse.json({ success: true, messageId: data.messages?.[0]?.id });

  } catch (error: any) {
    console.error("SEND-REPORT CRITICAL ERROR:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}