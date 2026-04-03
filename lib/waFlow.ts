// lib/waFlow.ts

export type BotStep =
  | "START" | "F2_INTENT" | "F2_HOOK" | "F2_AUTHORITY" | "F2_OFFER" | "F2_CHECKOUT"
  | "F1_START" | "F1_AWAITING_DETAILS" | "F1_CONFIRM_DETAILS" | "F1_FOCUS_AREA" | "F1_END";

export type UserData = {
  name?: string;
  intent?: string;
  birthDetails?: string;
  language?: "en" | "hi";
};

export type FlowState = {
  step: BotStep;
  userData: UserData;
};

export function nextMessage(
  input: string,
  state: FlowState
): { reply: string; buttons?: string[]; list?: any; image?: string; newState: FlowState } {
  const msg = input.trim();
  const lowerMsg = msg.toLowerCase();

  const currentState = state?.step ? state : { step: "START" as BotStep, userData: {} };
  const data = { ...currentState.userData };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const paymentLink = `${baseUrl}/checkout`;
  
  // ==========================================
  // BYPASS NGROK: Using live public images for testing
  // (Change these back to your local files when you deploy to production!)
  // ==========================================
  const imgWelcome = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuTgSGYd_yMRX4jHMgI_Pvfb2bqtVoqZM3eQ&s"; 
  const imgServices = "https://pbs.twimg.com/profile_images/2027040849813721088/X4RajwNP.jpg"; 
  const imgReport = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuOgvfQs_8khHNveOkNJ59hPKLNmtIA930Kw&s";

  const isHi = data.language === "hi";

  // GLOBAL COMMANDS: Added "hi surbhi" to the reset list!
  if (lowerMsg === "restart" || lowerMsg === "hi" || lowerMsg === "hello" || lowerMsg === "hi surbhi") {
    return {
      reply: "🙏 *Radhe Radhe Pranam!*\n\nWelcome to *Surbhi Gupta Astrology* — India's most trusted Vedic Jyotish practice.\n\nPlease select your preferred language / कृपया अपनी भाषा चुनें 👇",
      buttons: ["English 🇬🇧", "हिंदी 🇮🇳"],
      image: imgWelcome,
      newState: { step: "F2_INTENT", userData: {} },
    };
  }

  if (lowerMsg === "paid") {
    return {
      reply: isHi 
        ? "✅ *भुगतान सफल!*\n\nआपकी रिपोर्ट का ऑर्डर कन्फर्म हो गया है। कृपया अपना जन्म विवरण साझा करें: जन्म तिथि, समय और स्थान।"
        : "✅ *Payment Confirmed!*\n\nYour order has been confirmed. Please share your birth details: Date, Time, and Place of Birth.",
      buttons: isHi ? ["अभी साझा करूँगा", "समय नहीं पता"] : ["I'll share now", "Don't know my time"],
      image: imgReport,
      newState: { step: "F1_AWAITING_DETAILS", userData: data },
    };
  }

  switch (currentState.step) {
    case "START":
      return {
        reply: "🙏 *Radhe Radhe Pranam!*\n\nWelcome to *Surbhi Gupta Astrology* — India's most trusted Vedic Jyotish practice.\n\nPlease select your preferred language / कृपया अपनी भाषा चुनें 👇",
        buttons: ["English 🇬🇧", "हिंदी 🇮🇳"],
        image: imgWelcome,
        newState: { step: "F2_INTENT", userData: data },
      };

    case "F2_INTENT":
      if (lowerMsg.includes("hindi") || lowerMsg.includes("हिंदी")) {
        data.language = "hi";
      } else {
        data.language = "en";
      }

      const isHindi = data.language === "hi";

      return {
        reply: isHindi
          ? "🙏 राधे राधे प्रणाम जी!\n\nमैं सुरभि गुप्ता जी का आधिकारिक सहायक हूँ। आप किस विषय में मार्गदर्शन चाहते हैं? 👇"
          : "🙏 Radhe Radhe Pranam ji!\n\nI'm the official assistant of *Surbhi Gupta ji*. What brings you here today? 👇",
        image: imgServices,
        list: {
          button: isHindi ? "यहाँ चुनें" : "Select Here",
          sections: [{
            title: isHindi ? "एक क्षेत्र चुनें" : "Choose an area",
            rows: isHindi ? [
              { id: "career", title: "करियर और वृद्धि", description: "पेशेवर जीवन के लिए" },
              { id: "love", title: "प्रेम और रिश्ते", description: "प्रेम समस्याओं का समाधान" },
              { id: "marriage", title: "विवाह में देरी", description: "आपके और परिवार के लिए" },
              { id: "health", title: "स्वास्थ्य समस्याएं", description: "उपाय सहित" },
              { id: "all", title: "सभी सेवाएं देखें", description: "संपूर्ण जीवन रिपोर्ट" }
            ] : [
              { id: "career", title: "Overall Career Growth", description: "Insights for your profession" },
              { id: "love", title: "Relationship Problems", description: "Navigating love & breakups" },
              { id: "marriage", title: "Marriage Delays", description: "For you and your family" },
              { id: "health", title: "Health Issues", description: "Including remedies" },
              { id: "all", title: "Explore All Services", description: "Complete Life Reading" }
            ]
          }]
        },
        newState: { step: "F2_HOOK", userData: data },
      };

    case "F2_HOOK":
      data.intent = msg;
      return {
        reply: isHi
          ? `आपने चुना है: *${msg}*.\n\nकई लोग फंसा हुआ महसूस करते हैं। ज्यादातर मामलों में, उपाय सिर्फ मेहनत नहीं बल्कि *सही समय और दिशा* है। क्या आप चाहते हैं कि सुरभि जी आपकी संपूर्ण रिपोर्ट तैयार करें?`
          : `You selected *${msg}*.\n\nMany people feel stuck. In most cases, the answer isn't just more effort — it's *timing and direction*. Would you like Surbhi ji to prepare your complete reading?`,
        buttons: isHi ? ["हाँ, और बताएं", "फीस क्या है?"] : ["Yes, tell me more", "What does it cost?"],
        newState: { step: "F2_AUTHORITY", userData: data },
      };

    case "F2_AUTHORITY":
      return {
        reply: isHi
          ? "बिल्कुल जी। सुरभि जी भारत की प्रमुख वैदिक ज्योतिषियों में से एक हैं:\n🏛️ *पीएम नरेंद्र मोदी* जी की कुंडली बनाई\n🎬 बॉलीवुड हस्तियों का भरोसा\n⭐ Google पर 4.9/5 रेटिंग\n\nक्या मैं रिपोर्ट की पूरी जानकारी साझा करूँ? 🙏"
          : "Of course. Surbhi ji is a foremost Vedic Jyotish practitioner:\n🏛️ Prepared Kundali for *PM Narendra Modi*\n🎬 Trusted by Bollywood celebrities\n⭐ 4.9/5 on Google\n\nShall I share the full details? 🙏",
        buttons: isHi ? ["हाँ, दिखाएं", "यह अलग कैसे है?"] : ["Yes, show me", "How is it different?"],
        newState: { step: "F2_OFFER", userData: data },
      };

    case "F2_OFFER":
      return {
        reply: isHi
          ? "🔮 *सम्पूर्ण कुंडली रिपोर्ट*\n\n📖 100+ पेज व्यक्तिगत रिपोर्ट\n✨ करियर, प्रेम, धन और स्वास्थ्य\n📅 10-वर्षीय भविष्यवाणियां\n🎁 *मुफ्त WhatsApp कंसल्टेशन*\n\n*फीस:*\n~₹2,999~ ➡️ *केवल ₹999* (लॉन्च ऑफर)\n\nडिलिवरी: 72 घंटे में 🙏"
          : "🔮 *Complete Kundali Report*\n\n📖 100+ page personalised report\n✨ Career, Love, Finance & Health\n📅 10-Year Predictions\n🎁 *FREE 1:1 WhatsApp Consultation*\n\n*Investment:*\n~₹2,999~ ➡️ *₹999 only* (Launch Offer)\n\nDelivery: PDF within 72 hours 🙏",
        image: imgReport,
        list: {
          button: isHi ? "समाधान देखें" : "View Solutions",
          sections: [{
            title: isHi ? "अगले कदम" : "Next Steps",
            rows: isHi ? [
              { id: "buy", title: "रिपोर्ट प्राप्त करें", description: "₹999 लॉन्च ऑफर" },
              { id: "consult", title: "ज्योतिषी से बात करें", description: "व्यक्तिगत रणनीति प्राप्त करें" }
            ] : [
              { id: "buy", title: "Get Kundali Report", description: "₹999 Launch Offer" },
              { id: "consult", title: "Speak to Astrologer", description: "Get a personal strategy roadmap" }
            ]
          }]
        },
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    case "F2_CHECKOUT":
      if (lowerMsg.includes("speak") || lowerMsg.includes("expensive") || lowerMsg.includes("cost") || lowerMsg.includes("बात") || lowerMsg.includes("फीस")) {
        return {
          reply: isHi
            ? "बिल्कुल जी 🙏\nएक 1-घंटे के व्यक्तिगत सत्र की फीस ₹3,000–₹10,000 होती है। सुरभि जी ने यह रिपोर्ट ₹999 में उपलब्ध कराई है ताकि सभी वैदिक ज्योतिष का अनुभव कर सकें। क्या मैं भुगतान लिंक भेजूं? 🙏"
            : "Completely fair, ji 🙏\nA 1-hour session costs ₹3,000–₹10,000. Surbhi ji made this reading available for ₹999 to experience authentic Jyotish first.\n\nShall I send the payment link? 🙏",
          buttons: isHi ? ["हाँ, लिंक भेजें"] : ["Yes, send the link"],
          newState: { step: "F2_CHECKOUT", userData: data },
        };
      }
      return {
        reply: isHi
          ? `🙏 बहुत बढ़िया जी!\n\n💳 *सुरक्षित भुगतान लिंक:*\n${paymentLink}\n\n*राशि: केवल ₹999*\n\nवेबसाइट पर भुगतान पूरा होने पर, सिस्टम अपने आप यहां ऑर्डर कन्फर्म कर देगा! ⏳`
          : `🙏 Wonderful, ji!\n\n💳 *Secure Payment Link:*\n${paymentLink}\n\n*Amount: ₹999 only*\n\nOnce paid on the website, our system will automatically confirm your order right here! ⏳`,
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    case "F1_START":
      return {
        reply: isHi
          ? "🙏 *राधे राधे!*\nआपका ऑर्डर कन्फर्म हो गया है। ✅\n\nकृपया अपना सटीक जन्म विवरण साझा करें:\n1️⃣ जन्म तिथि (DD/MM/YYYY)\n2️⃣ जन्म का समय\n3️⃣ जन्म स्थान"
          : "🙏 *Radhe Radhe!*\nYour order has been confirmed. ✅\n\n*Please share your exact birth details:*\n1️⃣ Date of Birth (DD/MM/YYYY)\n2️⃣ Exact Time of Birth\n3️⃣ Place of Birth",
        buttons: isHi ? ["अभी साझा करूँगा", "समय नहीं पता"] : ["I'll share now", "Don't know my time"],
        image: imgReport,
        newState: { step: "F1_AWAITING_DETAILS", userData: data },
      };

    case "F1_AWAITING_DETAILS":
      if (lowerMsg.includes("don't") || lowerMsg.includes("now") || lowerMsg.includes("नहीं") || lowerMsg.includes("साझा")) {
        return {
          reply: isHi
            ? "कृपया अपना विवरण एक संदेश में टाइप करें (दिनांक, समय, स्थान)। यदि सही समय नहीं पता, तो अनुमानित समय बताएं (जैसे, 'सुबह जल्दी')! ⏳"
            : "Please type your details in a single message (Date, Time, Place). If you don't know the exact time, give an approximate! ⏳",
          newState: { step: "F1_AWAITING_DETAILS", userData: data },
        };
      }
      data.birthDetails = msg;
      return {
        reply: isHi
          ? `🙏 धन्यवाद! प्राप्त हुआ।\n\n*विवरण की पुष्टि:*\n${msg}\n\nक्या यह सही है?`
          : `🙏 Thank you! Received.\n\n*Confirming your details:*\n${msg}\n\nIs this correct?`,
        buttons: isHi ? ["✅ हाँ, सही है", "✏️ सुधार करना है"] : ["✅ Yes, correct", "✏️ Let me correct"],
        newState: { step: "F1_CONFIRM_DETAILS", userData: data },
      };

    case "F1_CONFIRM_DETAILS":
      if ((lowerMsg.includes("correct") || lowerMsg.includes("सुधार")) && !lowerMsg.includes("yes") && !lowerMsg.includes("हाँ")) {
        return {
          reply: isHi
            ? "कोई बात नहीं! कृपया अपना सही जन्म विवरण फिर से टाइप करें।"
            : "No problem! Please type your correct birth details again.",
          newState: { step: "F1_AWAITING_DETAILS", userData: data },
        };
      }
      return {
        reply: isHi
          ? "✨ *उत्तम। सुरभि जी को सूचित कर दिया गया है।*\n\nआपकी 100+ पेज की रिपोर्ट 72 घंटे में तैयार हो जाएगी। आप जीवन के किस क्षेत्र के बारे में सबसे अधिक जानना चाहते हैं?"
          : "✨ *Perfect. Surbhi ji has been notified.*\n\nYour 100+ page report will be ready within 72 hours.\n\n*Which area of life are you most curious about?*",
        buttons: isHi ? ["💼 करियर", "❤️ प्रेम व विवाह", "💰 धन व संपत्ति"] : ["💼 Career", "❤️ Love & Marriage", "💰 Finance"],
        newState: { step: "F1_FOCUS_AREA", userData: data },
      };

    case "F1_FOCUS_AREA":
      return {
        reply: isHi
          ? "🙏 नोट कर लिया गया है। रिपोर्ट तैयार होते ही हम आपको यहीं भेजेंगे। 72 घंटे में मिलते हैं! ✨"
          : "🙏 Noted. We will message you right here the moment your PDF is ready. See you in 72 hours! ✨",
        newState: { step: "F1_END", userData: data },
      };

    case "F1_END":
      return {
        reply: isHi
          ? "सुरभि जी अभी आपकी कुंडली का विश्लेषण कर रही हैं! ⏳ आपकी रिपोर्ट जल्द ही यहाँ भेजी जाएगी।"
          : "Surbhi ji is analyzing your chart! ⏳ Your report will be delivered here shortly.",
        buttons: ["Restart 🔄"],
        newState: { step: "F1_END", userData: data },
      };

    default:
      return {
        reply: "🙏 Radhe Radhe Pranam! Reply *Restart* to begin.",
        buttons: ["Restart 🔄"],
        newState: { step: "START", userData: {} },
      };
  }
}