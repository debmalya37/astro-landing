// lib/waFlow.ts

export type BotStep =
  | "START" | "F2_INTENT" | "F2_HOOK" | "F2_CHECKOUT"
  | "F1_START" | "F1_FREE_QUESTION" | "F1_END";

export type UserData = {
  name?: string;
  intent?: string;
  plan?: string;
  language?: "en" | "hi";
};

export type FlowState = {
  step: BotStep;
  userData: UserData;
};

function isCareerService(intent: string = "") {
  const lowerIntent = intent.toLowerCase();
  return lowerIntent.includes("career") || lowerIntent.includes("business") || lowerIntent.includes("करियर") || lowerIntent.includes("व्यापार");
}

function getCareerQuestions(isHi: boolean) {
  if (isHi) {
    return [
      { id: "c_q1", title: "नौकरी कब मिलेगी?", description: "नई नौकरी या प्रमोशन का समय" },
      { id: "c_q2", title: "नौकरी या व्यापार?", description: "मेरे लिए क्या बेहतर है?" },
      { id: "c_q3", title: "आर्थिक स्थिति", description: "धन लाभ और स्थिर करियर" }
    ];
  } else {
    return [
      { id: "c_q1", title: "When will I get a job?", description: "Timing for job or promotion" },
      { id: "c_q2", title: "Job or Business?", description: "Which path is better for me?" },
      { id: "c_q3", title: "Financial Stability", description: "When will wealth & career improve?" }
    ];
  }
}

function getServicePlans(intent: string = "", isHi: boolean) {
  const lower = intent.toLowerCase();

  // 1. Surbhi Consultation
  if ((lower.includes("consultation") || lower.includes("परामर्श")) && !lower.includes("couple")) {
    return [{
      title: isHi ? "परामर्श योजनाएं" : "Consultation Plans",
      rows: isHi ? [
        { id: "p1", title: "व्यक्तिगत (₹24,000)", description: "60 मिनट | ज्योतिष, हस्तरेखा, अंकशास्त्र" },
        { id: "p2", title: "तत्काल (₹51,000)", description: "इंतजार छोड़ें | तत्काल परामर्श" }
      ] : [
        { id: "p1", title: "Offline (₹24,000)", description: "60 mins | Astrology, Palmistry, Numerology" },
        { id: "p2", title: "Priority (₹51,000)", description: "Skip the wait | Fast-track your destiny" }
      ]
    }];
  }

  // 2. Numerology Report
  if (lower.includes("numerology") || lower.includes("अंकशास्त्र")) {
    return [{
      title: isHi ? "अंकशास्त्र योजनाएं" : "Numerology Plans",
      rows: isHi ? [
        { id: "p1", title: "नाम चेक (₹1,100)", description: "वर्तमान नाम का विस्तृत विश्लेषण" },
        { id: "p2", title: "नाम सुधार (₹5,100)", description: "सुधारे गए नाम सुझावों के साथ रिपोर्ट" },
        { id: "p3", title: "कॉल सहित (₹11,000)", description: "सुरभि जी के साथ 30 मिनट का कॉल" }
      ] : [
        { id: "p1", title: "Basic (₹1,100)", description: "Detailed vibration analysis of current name" },
        { id: "p2", title: "Correction (₹5,100)", description: "Report + Corrected name suggestions" },
        { id: "p3", title: "With Call (₹11,000)", description: "Report + 30-Min Call with Surbhi Gupta" }
      ]
    }];
  }

  // 3. Couple Match Making
  if (lower.includes("couple") || lower.includes("match") || lower.includes("मिलान")) {
    return [{
      title: isHi ? "कुंडली मिलान योजनाएं" : "Match Making Plans",
      rows: isHi ? [
        { id: "p1", title: "कपल रिपोर्ट (₹1,100)", description: "विस्तृत अनुकूलता रिपोर्ट" },
        { id: "p2", title: "रिपोर्ट+Q (₹3,300)", description: "रिपोर्ट + WhatsApp पर 1 व्यक्तिगत प्रश्न" },
        { id: "p3", title: "रिपोर्ट+कॉल (₹11,000)", description: "रिपोर्ट + ऑन-कॉल परामर्श" },
        { id: "p4", title: "कपल कॉल (₹15,000)", description: "सुरभि जी के साथ 45 मिनट की कॉल" }
      ] : [
        { id: "p1", title: "Basic Match (₹1,100)", description: "Detailed compatibility report" },
        { id: "p2", title: "Match + 1Q (₹3,300)", description: "Report + Ask 1 question on WhatsApp" },
        { id: "p3", title: "Match+Call (₹11,000)", description: "Report + On-Call Consultation" },
        { id: "p4", title: "Direct Call (₹15,000)", description: "45-Min direct call with Surbhi Gupta" }
      ]
    }];
  }

  // 4. Baby Name Report
  if (lower.includes("baby") || lower.includes("बच्चों")) {
    return [{
      title: isHi ? "बेबी नाम योजनाएं" : "Baby Name Plans",
      rows: isHi ? [
        { id: "p1", title: "बेबी रिपोर्ट (₹1,100)", description: "ज्योतिष और अंकशास्त्र रिपोर्ट" },
        { id: "p2", title: "रिपोर्ट+नाम (₹5,100)", description: "रिपोर्ट + नाम सुझाव + 1 प्रश्न" },
        { id: "p3", title: "कॉल सहित (₹11,000)", description: "रिपोर्ट + नाम + 30 मिनट का कॉल" }
      ] : [
        { id: "p1", title: "Baby Report (₹1,100)", description: "Astrology & Numerology Report" },
        { id: "p2", title: "Report+Name (₹5,100)", description: "Report + Name Suggestions + 1 Question" },
        { id: "p3", title: "Premium Call (₹11,000)", description: "Report + Names + 30-Min Consultation" }
      ]
    }];
  }

  // 5. Specific Problems (Career, Love, Health, Money, Family)
  if (lower.includes("career") || lower.includes("love") || lower.includes("health") || lower.includes("money") || lower.includes("family") || lower.includes("करियर") || lower.includes("प्रेम") || lower.includes("स्वास्थ्य") || lower.includes("धन") || lower.includes("परिवार")) {
    return [{
      title: isHi ? "समाधान चुनें" : "Choose Solution",
      rows: isHi ? [
        { id: "p1", title: "10-साल रिपोर्ट+1Q(₹999)", description: "रिपोर्ट विस्तृत पीडीएफ रिपोर्ट + 1 निःशुल्क प्रश्न " },
        { id: "p2", title: "व्यक्तिगत कॉल(₹11,000)", description: "सुरभि जी के साथ व्यक्तिगत कॉल" }
      ] : [
        { id: "p1", title: "10-Yr Report+1Q(₹999)", description: "Detailed PDF Report + 1 Free Question on Whatsapp" },
        { id: "p2", title: "1-on-1 Call (₹11,000)", description: "Personal consultation call with Surbhi ji" }
      ]
    }];
  }

  // 6. Default: Surbhi  kundali 
  return [{
    title: isHi ? "कुंडली योजनाएं" : "Kundli Plans",
    rows: isHi ? [
      { id: "p1", title: "10-साल रिपोर्ट+1Q(₹999)", description: "विस्तृत ज्योतिषीय भविष्यवाणी रिपोर्ट + 1 व्यक्तिगत प्रश्न" }, 
      { id: "p2", title: "रिपोर्ट+Q (₹2,999)", description: "रिपोर्ट + WhatsApp पर 1 व्यक्तिगत प्रश्न" }, 
      { id: "p3", title: "कॉल सहित (₹11,000)", description: "रिपोर्ट + 30 मिनट कॉल परामर्श" }
    ] : [
      { id: "p1", title: "10-Yr Report+1Q(₹999)", description: "Detailed astrological prediction report + Ask 1 question via chat" },
      { id: "p2", title: "Report + 1Q (₹2,999)", description: "10-Year Report + Ask 1 question via chat" },
      { id: "p3", title: "With Call (₹11,000)", description: "Report + 1 Q + 30-Min Call Consultation" }
    ]
  }];
}

export function nextMessage(
  input: string,
  state: FlowState
): { reply: string; buttons?: string[]; list?: any; image?: string; urlButton?: { text: string; url: string }; newState: FlowState } {
  const msg = input.trim();
  const lowerMsg = msg.toLowerCase();
  const currentState = state?.step ? state : { step: "START" as BotStep, userData: {} };
  const data = { ...currentState.userData };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const paymentLink = `${baseUrl}/checkout`;
  const imgWelcome = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuTgSGYd_yMRX4jHMgI_Pvfb2bqtVoqZM3eQ&s"; 
  const imgServices = "https://pbs.twimg.com/profile_images/2027040849813721088/X4RajwNP.jpg"; 

  const isHi = data.language === "hi";
  const userName = data.name && data.name !== "Seeker" ? data.name : "";

  const serviceNames = [
    "surbhi consultation", "surbhi  kundali ", "numerology report", 
    "couple match making", "baby name report", "career", "love", "health", "money", "family",
    "सुरभि गुप्ता परामर्श", "सुरभि कुंडली", "अंकशास्त्र रिपोर्ट", "कुंडली मिलान", "बच्चों के नाम की रिपोर्ट"
  ];
  const isSelectingNewService = serviceNames.some(s => lowerMsg.includes(s.toLowerCase()));

  if (isSelectingNewService && (currentState.step === "F2_CHECKOUT" || currentState.step === "F2_HOOK")) {
    currentState.step = "F2_HOOK";
  }

  if (lowerMsg === "restart" || lowerMsg === "hi" || lowerMsg === "hello" || lowerMsg === "hi surbhi") {
    return {
      reply: `🙏 Namaste and welcome🙏\n\nLet us know which language are you more comfortable talking with; our expert will connect with you in the same language 👇\n\n🙏 नमस्ते और स्वागत है   🙏\n\nकृपया बताएं कि आप किस भाषा में बात करना अधिक पसंद करेंगे; हमारे विशेषज्ञ आपसे उसी भाषा में जुड़ेंगे 👇`,
      buttons: ["English 🇬🇧", "हिंदी 🇮🇳"],
      image: imgWelcome,
      newState: { step: "F2_INTENT", userData: { name: userName } },
    };
  }

  if (lowerMsg === "paid") {
    if (isCareerService(data.intent)) {
      return {
        reply: isHi 
          ? "✅ *भुगतान सफल!*\nआपका ऑर्डर कन्फर्म हो गया है। अपना 1 मुफ़्त प्रश्न पूछने के लिए नीचे क्लिक करें 👇"
          : "✅ *Payment Confirmed!*\nYour order has been confirmed. Click below to ask your 1 FREE question 👇",
        buttons: isHi ? ["प्रश्न पूछें"] : ["Ask Question"],
        newState: { step: "F1_START", userData: data },
      };
    } else {
      return {
        reply: isHi 
          ? "✅ *भुगतान सफल!*\nआपका ऑर्डर कन्फर्म हो गया है। आपका मार्गदर्शन जल्द ही यहीं भेजा जाएगा।"
          : "✅ *Payment Confirmed!*\nYour order has been confirmed. Your guidance will be delivered right here shortly.",
        newState: { step: "F1_END", userData: data },
      };
    }
  }

  switch (currentState.step) {
    case "START":
      return {
        reply: `🙏 Namaste and welcome🙏\n\n Please select your language 👇\n\n🙏 नमस्ते और स्वागत है   🙏\n\n कृपया अपनी भाषा चुनें 👇`,
        buttons: ["English 🇬🇧", "हिंदी 🇮🇳"],
        image: imgWelcome,
        newState: { step: "F2_INTENT", userData: data },
      };

    case "F2_INTENT":
      data.language = (lowerMsg.includes("hindi") || lowerMsg.includes("हिंदी")) ? "hi" : "en";
      const isHindi = data.language === "hi";
      return {
        reply: isHindi
          ? `🙏 नमस्ते और स्वागत है ${userName ? userName + " जी" : ""}।\nमैं सेलिब्रिटी ज्योतिषी सुरभि गुप्ता जी का आधिकारिक सहायक हूँ।\n\nकृपया मुझे बताएं, इस समय आपको सबसे ज्यादा क्या परेशान कर रहा है?`
          : `🙏 Namaste and welcome ${userName ? userName : ""}.\nI am the official assistant of Celebrity Astrologer Surbhi Gupta.\n\nPlease tell me, what is troubling you the most right now?`,
        image: imgServices,
        list: {
          button: isHindi ? "यहाँ चुनें" : "Select Here",
          sections: [
            {
              title: isHindi ? "विशिष्ट समस्याएं" : "Specific Problems",
              rows: isHindi ? [
                { id: "career", title: "करियर और व्यापार", description: "नौकरी, पदोन्नति and व्यवसाय" },
                { id: "love", title: "विवाह और रिश्ते", description: "प्रेम समस्याओं का समाधान" },
                { id: "money", title: "धन और वित्त", description: "आर्थिक स्थिति और धन लाभ" },
                { id: "health", title: "स्वास्थ्य समस्याएं", description: "स्वास्थ्य और उपाय" },
                { id: "family", title: "पारिवारिक चिंताएं", description: "पारिवारिक शांति और विवाद" }
              ] : [
                { id: "career", title: "Career & Business", description: "Job, promotion, and business growth" },
                { id: "love", title: "Marriage & Relationships", description: "Navigating love & breakups" },
                { id: "money", title: "Money & Finances", description: "Wealth and financial stability" },
                { id: "health", title: "Health Issues", description: "Health concerns and remedies" },
                { id: "family", title: "Family Concerns", description: "Family peace and disputes" }
              ]
            },
            {
              title: isHindi ? "प्रीमियम सेवाएं" : "Premium Services",
              rows: isHindi ? [
                { id: "surbhi_kundli", title: "सुरभि कुंडली", description: "आपकी व्यक्तिगत कुंडली" },
                { id: "surbhi_consultation", title: "सुरभि गुप्ता परामर्श", description: "व्यक्तिगत मार्गदर्शन" },
                { id: "numerology_report", title: "अंकशास्त्र रिपोर्ट", description: "नाम सुझाव और व्याख्या" },
                { id: "couple_match_making", title: "कुंडली मिलान", description: "सफल विवाह के लिए" },
                { id: "baby_name_report", title: "बच्चों के नाम की रिपोर्ट", description: "सार्थक नामों के सुझाव" }
              ] : [
                { id: "surbhi_kundli", title: "Surbhi  kundali ", description: "Your cosmic blueprint" },
                { id: "surbhi_consultation", title: "Surbhi Consultation", description: "Personalized guidance" },
                { id: "numerology_report", title: "Numerology Report", description: "Name suggestions & meaning" },
                { id: "couple_match_making", title: "Couple Match Making", description: "Kundali Milan for marriage" },
                { id: "baby_name_report", title: "Baby Name Report", description: "Meaningful baby names" }
              ]
            }
          ]
        },
        newState: { step: "F2_HOOK", userData: data },
      };

    case "F2_HOOK":
      data.intent = msg;
      
      let hookReply = "";
      const selectedIntent = msg.toLowerCase();

      if (selectedIntent.includes("career") || selectedIntent.includes("business") || selectedIntent.includes("love") || selectedIntent.includes("marriage") || selectedIntent.includes("money") || selectedIntent.includes("health") || selectedIntent.includes("family") || selectedIntent.includes("करियर") || selectedIntent.includes("व्यापार") || selectedIntent.includes("प्रेम") || selectedIntent.includes("विवाह") || selectedIntent.includes("धन") || selectedIntent.includes("स्वास्थ्य") || selectedIntent.includes("परिवार")) {
        hookReply = isHi 
          ? `मैं *${msg}* को लेकर आपकी चिंता समझता हूँ। 🌟\nसुरभि जी एक विस्तृत 10-वर्षीय भविष्यवाणी रिपोर्ट और एक महत्वपूर्ण प्रश्न पर मार्गदर्शन के साथ स्पष्टता प्राप्त करने में आपकी मदद कर सकती हैं।\n\n🔒 पूरी तरह से निजी और गोपनीय\n📱 24 घंटे के भीतर WhatsApp पर साझा किया जाएगा\n\n👇 कृपया अपना विकल्प चुनें:`
          : `I understand your concern about *${msg}*. 🌟\nSurbhi Ji can help you gain clarity with a detailed 10-Year Prediction Report and guidance on one important question.\n\n🔒 Completely private & confidential\n📱 Shared on WhatsApp within 24 hours\n\n👇 Choose an option:`;
      } else if (selectedIntent.includes("kundli") || selectedIntent.includes("कुंडली")) {
        hookReply = isHi
          ? `🌙 आपने सुरभि कुंडली का चयन किया है।\nकभी-कभी हम जिन उत्तरों की तलाश कर रहे होते हैं वे उन पैटर्नों में छिपे होते हैं जिन्हें हम खुद नहीं देख सकते।\nसुरभि जी व्यक्तिगत रूप से आपके जन्म विवरण का अध्ययन करेंगी और आपके जीवन के महत्वपूर्ण चरणों को कवर करते हुए एक विस्तृत 10-वर्षीय भविष्यवाणी रिपोर्ट तैयार करेंगी।\n✨ एक विशेष पेशकश के रूप में, वह व्यक्तिगत रूप से एक ऐसे प्रश्न का उत्तर भी देंगी जो आपके दिल के सबसे करीब है।\n\n👇 शुरू करने के लिए नीचे एक विकल्प चुनें।`
          : `🌙 You have selected Surbhi  kundali .\nSometimes the answers we're looking for are hidden in patterns we cannot see ourselves.\nSurbhi Ji will personally study your birth details and prepare a detailed 10-Year Prediction Report covering important phases of your life.\n✨ As a special offering, she will also personally answer one question that is closest to your heart.\n\n👇 To begin, choose an option below.`;
      } else {
        hookReply = isHi
          ? `💼 ${msg} को लेकर सही मार्गदर्शन पाने के लिए, हम ये सेवाएँ सुझाते हैं।\n\n 👇 नीचे अपना पसंदीदा विकल्प चुनें। \n\n कोई दूसरी सेवा देखनी है? बस MORE टाइप करें।`
          : `💼 It's about knowing the right direction.\nTo help you gain clarity regarding *${msg}*, we recommend these services:\n\n👇 Choose an option below.\n(Need a different service? Reply MORE.)`;
      }

      return {
        reply: hookReply,
        list: {
          button: isHi ? "समाधान देखें" : "View Solutions",
          sections: getServicePlans(data.intent, isHi)
        },
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    case "F2_CHECKOUT":
      data.plan = msg;
      const encodedService = encodeURIComponent(data.intent || "Service");
      const encodedPlan = encodeURIComponent(data.plan || "Plan");
      const checkoutUrl = `${paymentLink}?service=${encodedService}&plan=${encodedPlan}`;

      const selectedService = (data.intent || "").toLowerCase();
      const isSurbhiKundli = selectedService.includes("surbhi  kundali ") || selectedService.includes("सुरभि कुंडली");
      const checkoutImage = isSurbhiKundli ? `${baseUrl}/surbhi-15.png` : `${baseUrl}/surbhi-16.png`;
      
      let checkoutMsg = isHi
        ? `धन्यवाद! 🌟\n\nअब अपनी कुंडली की शुरुआत करने के लिए, नीचे दिए गए *'Start My Kundli'* बटन पर क्लिक करें।\nआपकी सभी जानकारी पूरी तरह सुरक्षित और गोपनीय रहेगी। 🙏👇`
        : `Thank you! 🌟\n\nTo begin your consultation and secure your privacy, please click the *'Start My  kundali '* button below 👇`;
        
      if (isCareerService(data.intent)) {
        checkoutMsg += isHi 
          ? `\n\n🎁 *बोनस:* भुगतान के बाद आपको 1 मुफ़्त प्रश्न पूछने का अवसर मिलेगा!` 
          : `\n\n🎁 *Bonus:* You get 1 FREE question answered after payment!`;
      }

      return {
        reply: checkoutMsg,
        image: checkoutImage, 
        urlButton: {
          text: isHi ? "Start My  kundali " : "Start My  kundali ",
          url: checkoutUrl
        },
        newState: { step: "F2_CHECKOUT", userData: data },
      };

    case "F1_START":
      return {
        reply: isHi
          ? "✨ *उत्तम।*\n\nवादे के अनुसार, अब आप अपने क्यरियर से संबंधित अपना 1 मुफ़्त प्रश्न पूछ सकते हैं। कृपया नीचे दिए गए विकल्पों में से चुनें 👇"
          : "✨ *Perfect.*\n\nAs promised, you can now ask your 1 FREE question related to your career. Please select an option below 👇",
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
          ? "विश्लेषण जारी है! ⏳ आपका अपडेट जल्द ही यहाँ भेजा जाएगा।"
          : "Analysis in progress! ⏳ Your update will be here shortly.",
        buttons: ["Restart 🔄"],
        newState: { step: "F1_END", userData: data },
      };

    default:
      return {
        reply: `🙏 Radhe Radhe Pranam! Reply *Restart* to begin.`,
        buttons: ["Restart 🔄"],
        newState: { step: "START", userData: data },
      };
  }
}