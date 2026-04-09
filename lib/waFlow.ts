// lib/waFlow.ts

export type BotStep =
  | "START" | "F2_INTENT" | "F2_HOOK" | "F2_CHECKOUT"
  | "F1_START" | "F1_AWAITING_DETAILS" | "F1_CONFIRM_DETAILS" | "F1_FREE_QUESTION" | "F1_END";

export type UserData = {
  name?: string;
  intent?: string;
  plan?: string;
  birthDetails?: string;
  language?: "en" | "hi";
};

export type FlowState = {
  step: BotStep;
  userData: UserData;
};

// Helper: Check if the selected service is Career related
function isCareerService(intent: string = "") {
  const lowerIntent = intent.toLowerCase();
  return lowerIntent.includes("career") || lowerIntent.includes("करियर");
}

// Helper: Dynamic Career Questions for the 1 Free Question Bonus
function getCareerQuestions(isHi: boolean) {
  if (isHi) {
    return [
      { id: "c_q1", title: "नौकरी कब मिलेगी?", description: "नई नौकरी या प्रमोशन का समय" },
      { id: "c_q2", title: "नौकरी या व्यापार?", description: "मेरे लिए क्या बेहतर है?" },
      { id: "c_q3", title: "आर्थिक स्थिति", description: "धन लाभ और करियर स्थिरता" }
    ];
  } else {
    return [
      { id: "c_q1", title: "When will I get a job?", description: "Timing for job or promotion" },
      { id: "c_q2", title: "Job or Business?", description: "Which path is better for me?" },
      { id: "c_q3", title: "Financial Stability", description: "When will wealth & career improve?" }
    ];
  }
}

// Helper: Generate Dynamic Plans (Solutions) based on the selected service
// Note: Meta limits Titles to 24 chars and Descriptions to 72 chars.
function getServicePlans(intent: string = "", isHi: boolean) {
  const lower = intent.toLowerCase();

  // 1. Surbhi Consultation
  if (lower.includes("consultation") || lower.includes("परामर्श") && !lower.includes("couple")) {
    return [{
      title: isHi ? "परामर्श योजनाएं" : "Consultation Plans",
      rows: isHi ? [
        { id: "p1", title: "आमने-सामने (₹24,000)", description: "60 मिनट | ज्योतिष, हस्तरेखा, अंकशास्त्र" },
        { id: "p2", title: "प्राथमिकता कॉल (₹51,000)", description: "इंतजार छोड़ें | तत्काल परामर्श" }
      ] : [
        { id: "p1", title: "Face-to-Face (₹24,000)", description: "60 mins | Astrology, Palmistry, Numerology" },
        { id: "p2", title: "Priority Consult(₹51,000)", description: "Skip the wait | Fast-track your destiny" }
      ]
    }];
  }

  // 2. Numerology Report
  if (lower.includes("numerology") || lower.includes("अंकशास्त्र")) {
    return [{
      title: isHi ? "अंकशास्त्र योजनाएं" : "Numerology Plans",
      rows: isHi ? [
        { id: "p1", title: "नाम विश्लेषण (₹1,100)", description: "वर्तमान नाम का विस्तृत विश्लेषण" },
        { id: "p2", title: "विश्लेषण+सुधार (₹5,100)", description: "सुधारे गए नाम सुझावों के साथ रिपोर्ट" },
        { id: "p3", title: "रिपोर्ट + कॉल (₹11,000)", description: "सुरभि जी के साथ 30 मिनट का कॉल" }
      ] : [
        { id: "p1", title: "Name Analysis (₹1,100)", description: "Detailed vibration analysis of current name" },
        { id: "p2", title: "Analys+Correct (₹5,100)", description: "Report + Corrected name suggestions" },
        { id: "p3", title: "Complete+Call (₹11,000)", description: "Report + 30-Min Call with Surbhi Gupta" }
      ]
    }];
  }

  // 3. Couple Match Making
  if (lower.includes("couple") || lower.includes("match") || lower.includes("मिलान")) {
    return [{
      title: isHi ? "कुंडली मिलान योजनाएं" : "Match Making Plans",
      rows: isHi ? [
        { id: "p1", title: "कपल रिपोर्ट (₹1,100)", description: "विस्तृत अनुकूलता रिपोर्ट" },
        { id: "p2", title: "रिपोर्ट + 1 प्रश्न (₹3,300)", description: "रिपोर्ट + WhatsApp पर 1 व्यक्तिगत प्रश्न" },
        { id: "p3", title: "रिपोर्ट + कॉल (₹11,000)", description: "रिपोर्ट + ऑन-कॉल परामर्श" },
        { id: "p4", title: "कपल कॉल (₹15,000)", description: "सुरभि जी के साथ 45 मिनट की कॉल" }
      ] : [
        { id: "p1", title: "Couple Report (₹1,100)", description: "Detailed compatibility report" },
        { id: "p2", title: "Report + 1 Q (₹3,300)", description: "Report + Ask 1 question on WhatsApp" },
        { id: "p3", title: "Report + Call (₹11,000)", description: "Report + On-Call Consultation" },
        { id: "p4", title: "Consult Call (₹15,000)", description: "45-Min direct call with Surbhi Gupta" }
      ]
    }];
  }

  // 4. Baby Name Report
  if (lower.includes("baby") || lower.includes("बच्चों")) {
    return [{
      title: isHi ? "बेबी नाम योजनाएं" : "Baby Name Plans",
      rows: isHi ? [
        { id: "p1", title: "बेबी रिपोर्ट (₹1,100)", description: "ज्योतिष और अंकशास्त्र रिपोर्ट" },
        { id: "p2", title: "रिपोर्ट+नाम+चैट (₹5,100)", description: "रिपोर्ट + नाम सुझाव + 1 प्रश्न" },
        { id: "p3", title: "प्रीमियम कॉल (₹11,000)", description: "रिपोर्ट + नाम + 30 मिनट का कॉल" }
      ] : [
        { id: "p1", title: "Baby Report (₹1,100)", description: "Astrology & Numerology Report" },
        { id: "p2", title: "Report+Name+Q (₹5,100)", description: "Report + Name Suggestions + 1 Question" },
        { id: "p3", title: "Premium Call (₹11,000)", description: "Report + Names + 30-Min Consultation" }
      ]
    }];
  }

  // 5. Specific Problems (Career, Love, Health)
  if (lower.includes("career") || lower.includes("love") || lower.includes("health") || lower.includes("करियर") || lower.includes("प्रेम") || lower.includes("स्वास्थ्य")) {
    return [{
      title: isHi ? "समाधान चुनें" : "Choose Solution",
      rows: isHi ? [
        { id: "p1", title: "प्रीमियम रिपोर्ट (₹999)", description: "आपकी समस्या पर विस्तृत पीडीएफ रिपोर्ट" },
        { id: "p2", title: "1-ऑन-1 कॉल (₹11,000)", description: "सुरभि जी के साथ व्यक्तिगत कॉल" }
      ] : [
        { id: "p1", title: "Premium Report (₹999)", description: "Detailed PDF report on your specific issue" },
        { id: "p2", title: "1-on-1 Call (₹11,000)", description: "Personal consultation call with Surbhi ji" }
      ]
    }];
  }

  // 6. Default: Surbhi Kundli
  return [{
    title: isHi ? "कुंडली योजनाएं" : "Kundli Plans",
    rows: isHi ? [
      { id: "p1", title: "10-वर्षीय रिपोर्ट (₹999)", description: "विस्तृत ज्योतिषीय भविष्यवाणी रिपोर्ट" },
      { id: "p2", title: "रिपोर्ट+1 प्रश्न (₹2,999)", description: "रिपोर्ट + WhatsApp पर 1 व्यक्तिगत प्रश्न" },
      { id: "p3", title: "संपूर्ण मार्गदर्शन(₹11,000)", description: "रिपोर्ट + 30 मिनट कॉल परामर्श" }
    ] : [
      { id: "p1", title: "10-Year Report (₹999)", description: "Detailed astrological prediction report" },
      { id: "p2", title: "Report + 1 Q (₹2,999)", description: "10-Year Report + Ask 1 question via chat" },
      { id: "p3", title: "Complete Guide (₹11,000)", description: "Report + 1 Q + 30-Min Call Consultation" }
    ]
  }];
}

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
  
  const imgWelcome = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuTgSGYd_yMRX4jHMgI_Pvfb2bqtVoqZM3eQ&s"; 
  const imgServices = "https://pbs.twimg.com/profile_images/2027040849813721088/X4RajwNP.jpg"; 
  const imgReport = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuOgvfQs_8khHNveOkNJ59hPKLNmtIA930Kw&s";

  const isHi = data.language === "hi";
  const userName = data.name && data.name !== "Seeker" ? data.name : "";

  // GLOBAL COMMANDS
  if (lowerMsg === "restart" || lowerMsg === "hi" || lowerMsg === "hello" || lowerMsg === "hi surbhi") {
    return {
      reply: `Radhe Radhe ${userName} ji 🙏 🙏\n\nPlease select your language / कृपया अपनी भाषा चुनें |`,
      buttons: ["English 🇬🇧", "हिंदी 🇮🇳"],
      image: imgWelcome,
      newState: { step: "F2_INTENT", userData: data },
    };
  }

  if (lowerMsg === "paid") {
    return {
      reply: isHi 
        ? "✅ *भुगतान सफल!*\n\nआपका ऑर्डर कन्फर्म हो गया है। कृपया अपना जन्म विवरण साझा करें: जन्म तिथि, समय और स्थान।"
        : "✅ *Payment Confirmed!*\n\nYour order has been confirmed. Please share your birth details: Date, Time, and Place of Birth.",
      buttons: isHi ? ["अभी साझा करूँगा", "समय नहीं पता"] : ["I'll share now", "Don't know my time"],
      image: imgReport,
      newState: { step: "F1_AWAITING_DETAILS", userData: data },
    };
  }

  switch (currentState.step) {
    case "START":
      return {
        reply: `Radhe Radhe ${userName} ji 🙏 🙏\n\nPlease select your language / कृपया अपनी भाषा चुनें |`,
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
          ? `राधे राधे ${userName} जी 🙏\n\nमैं ज्योतिषी सुरभि गुप्ता जी का आधिकारिक सहायक हूँ।\n\nकृपया मुझे बताएं - आज आप किस विषय में मार्गदर्शन चाहते हैं?`
          : `Radhe Radhe ${userName} ji 🙏\n\nI’m the official assistant of Astrologer Surabhi Gupta Ji.\n\nPlease tell me - what would you like guidance about today?`,
        image: imgServices,
        list: {
          button: isHindi ? "यहाँ चुनें" : "Select Here",
          sections: [
            {
              title: isHindi ? "प्रीमियम सेवाएं" : "Premium Services",
              rows: isHindi ? [
                { id: "surbhi_consultation", title: "सुरभि गुप्ता परामर्श", description: "व्यक्तिगत मार्गदर्शन" },
                { id: "surbhi_kundli", title: "सुरभि कुंडली", description: "आपकी व्यक्तिगत कुंडली" },
                { id: "numerology_report", title: "अंकशास्त्र रिपोर्ट", description: "नाम सुझाव और व्याख्या" },
                { id: "couple_match_making", title: "कुंडली मिलान", description: "सफल विवाह के लिए" },
                { id: "baby_name_report", title: "बच्चों के नाम की रिपोर्ट", description: "सार्थक नामों के सुझाव" }
              ] : [
                { id: "surbhi_consultation", title: "Surbhi Consultation", description: "Personalized guidance" },
                { id: "surbhi_kundli", title: "Surbhi Kundli", description: "Your cosmic blueprint" },
                { id: "numerology_report", title: "Numerology Report", description: "Name suggestions & meaning" },
                { id: "couple_match_making", title: "Couple Match Making", description: "Kundali Milan for marriage" },
                { id: "baby_name_report", title: "Baby Name Report", description: "Meaningful baby names" }
              ]
            },
            {
              title: isHindi ? "विशिष्ट समस्याएं" : "Specific Problems",
              rows: isHindi ? [
                { id: "career", title: "करियर और वृद्धि", description: "पेशेवर जीवन के लिए" },
                { id: "love", title: "प्रेम और रिश्ते", description: "प्रेम समस्याओं का समाधान" },
                { id: "health", title: "स्वास्थ्य समस्याएं", description: "उपाय सहित" }
              ] : [
                { id: "career", title: "Overall Career Growth", description: "Insights for your profession" },
                { id: "love", title: "Relationship Problems", description: "Navigating love & breakups" },
                { id: "health", title: "Health Issues", description: "Including remedies" }
              ]
            }
          ]
        },
        newState: { step: "F2_HOOK", userData: data },
      };

    case "F2_HOOK":
      data.intent = msg; // Save the selected service
      return {
        reply: isHi
          ? `अपने *${msg}* पर विस्तृत स्पष्टीकरण प्राप्त करें।\n\nयहाँ आपके लिए कुछ समाधान हैं 👇`
          : `Get a detailed clarity on your *${msg}*.\n\nHere are a few solutions for you 👇`,
        list: {
          button: isHi ? "समाधान देखें" : "View Solutions",
          sections: getServicePlans(data.intent, isHi)
        },
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    case "F2_CHECKOUT":
      data.plan = msg; // Save the selected plan
      const encodedService = encodeURIComponent(data.intent || "Surbhi Kundli");
      const encodedPlan = encodeURIComponent(data.plan || "");
      
      // Pass both Service and Plan to your checkout page
      const checkoutUrl = `${paymentLink}?service=${encodedService}&plan=${encodedPlan}`;
      const isCareer = isCareerService(data.intent);
      
      let checkoutMsg = isHi
        ? `कृपया अपने चयन के साथ आगे बढ़ने के लिए नीचे क्लिक करें 👇\n\n🔗 ${checkoutUrl}`
        : `Please click below to proceed with your selection 👇\n\n🔗 ${checkoutUrl}`;
        
      // Append the bonus ONLY if it's the career service
      if (isCareer) {
        checkoutMsg += isHi 
          ? `\n\n🎁 *बोनस:* भुगतान के बाद आपको करियर से जुड़ा 1 मुफ़्त प्रश्न पूछने का अवसर मिलेगा!` 
          : `\n\n🎁 *Bonus:* You will also get 1 FREE career question answered by Surbhi ji after payment!`;
      }

      return {
        reply: checkoutMsg,
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    // ==========================================
    // POST-PAYMENT FLOW
    // ==========================================
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
      
      // If it's a Career Service, offer the free question via a List
      if (isCareerService(data.intent)) {
        return {
          reply: isHi
            ? "✨ *उत्तम। आपकी रिपोर्ट/परामर्श निर्धारित कर दिया गया है।*\n\nवादे के अनुसार, अब आप अपने करियर से संबंधित अपना 1 मुफ़्त प्रश्न पूछ सकते हैं। कृपया नीचे दिए गए विकल्पों में से चुनें 👇"
            : "✨ *Perfect. Your order is being processed.*\n\nAs promised, you can now ask your 1 FREE question related to your career. Please select an option below 👇",
          list: {
            button: isHi ? "प्रश्न चुनें" : "Select Question",
            sections: [
              {
                title: isHi ? "मुफ़्त प्रश्न" : "Free Question",
                rows: getCareerQuestions(isHi)
              }
            ]
          },
          newState: { step: "F1_FREE_QUESTION", userData: data },
        };
      } 
      
      // If it's NOT a Career Service, skip the question
      return {
        reply: isHi
          ? "✨ *उत्तम। सुरभि जी को सूचित कर दिया गया है।*\n\nआपका मार्गदर्शन जल्द ही यहीं भेजा जाएगा। 🙏"
          : "✨ *Perfect. Surbhi ji has been notified.*\n\nYour guidance will be delivered right here shortly. 🙏",
        newState: { step: "F1_END", userData: data },
      };

    case "F1_FREE_QUESTION":
      return {
        reply: isHi
          ? `🙏 धन्यवाद। सुरभि जी आपके चार्ट की समीक्षा करेंगी और जल्द ही इस प्रश्न का उत्तर देंगी!`
          : `🙏 Thank you. Surbhi ji will review your chart and answer this question shortly!`,
        newState: { step: "F1_END", userData: data },
      };

    case "F1_END":
      return {
        reply: isHi
          ? "सुरभि जी अभी आपके विवरण का विश्लेषण कर रही हैं! ⏳ आपका अपडेट जल्द ही यहाँ भेजा जाएगा।"
          : "Surbhi ji is analyzing your details! ⏳ Your update will be delivered here shortly.",
        buttons: ["Restart 🔄"],
        newState: { step: "F1_END", userData: data },
      };

    default:
      return {
        reply: `🙏 Radhe Radhe Pranam ${userName} ji! Reply *Restart* to begin.`,
        buttons: ["Restart 🔄"],
        newState: { step: "START", userData: data },
      };
  }
}