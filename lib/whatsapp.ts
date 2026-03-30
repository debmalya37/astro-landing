const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

export async function sendWhatsAppMessage(to: string, messageData: any) {
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        ...messageData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("WhatsApp API Error:", error);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
  }
}

// Pre-built message types for the funnel
export const templates = {
  text: (text: string) => ({
    type: "text",
    text: { body: text },
  }),

  interactiveButtons: (bodyText: string, buttons: { id: string; title: string }[]) => ({
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((btn) => ({
          type: "reply",
          reply: { id: btn.id, title: btn.title },
        })),
      },
    },
  }),
};