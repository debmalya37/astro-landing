"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ==========================================
// 1. QUESTION DATABASE
// ==========================================
const QUESTION_DATA = {
  health: {
    label: { hindi: "🔮 Health (स्वास्थ्य)", english: "🔮 Health" },
    questions: [
      { hi: "क्या मेरी कुंडली में कोई hidden health issue दिख रहा है जिस पर मुझे अभी ध्यान देना चाहिए?", en: "Is there any hidden health issue in my birth chart that I should focus on right now?" },
      { hi: "मेरी energy बार-बार low क्यों रहती है — क्या ये ग्रहों का असर है?", en: "Why is my energy frequently low — is it due to planetary influence?" },
      { hi: "क्या आने वाले समय में मेरी health improve होगी या मुझे सावधान रहना चाहिए?", en: "Will my health improve in the future or should I remain cautious?" },
      { hi: "क्या मेरी कुंडली में कोई chronic problem का संकेत है?", en: "Is there an indication of any chronic problem in my birth chart?" }
    ]
  },
  business: {
    label: { hindi: "💼 Business (बिज़नेस)", english: "💼 Business" },
    questions: [
      { hi: "क्या मेरा business सही direction में जा रहा है या मुझे change करना चाहिए?", en: "Is my business heading in the right direction or should I change it?" },
      { hi: "क्या मेरे लिए partnership फायदेमंद है या नुकसान करेगी?", en: "Is a business partnership beneficial for me or will it cause losses?" },
      { hi: "आने वाले 6 महीनों में business growth के chances कैसे हैं?", en: "What are the chances of business growth in the next 6 months?" },
      { hi: "क्या मेरे नाम/brand में numerology के हिसाब से बदलाव जरूरी है?", en: "Is a change in my name/brand necessary according to numerology?" }
    ]
  },
  career: {
    label: { hindi: "🎯 Career (करियर / जॉब)", english: "🎯 Career" },
    questions: [
      { hi: "क्या मुझे job change करना चाहिए या current job में growth मिलेगी?", en: "Should I change my job or will I find growth in my current job?" },
      { hi: "मेरे लिए private job सही है या business ज्यादा successful रहेगा?", en: "Is a private job right for me or will business be more successful?" },
      { hi: "Promotion या salary hike कब तक possible है?", en: "By when is a promotion or salary hike possible for me?" },
      { hi: "क्या मेरा career stable रहेगा या बार-बार बदलाव आएंगे?", en: "Will my career remain stable or will there be frequent changes?" }
    ]
  },
  marriage: {
    label: { hindi: "💑 Marriage (शादी / रिलेशनशिप)", english: "💑 Marriage" },
    questions: [
      { hi: "मेरी शादी कब तक होने के योग हैं?", en: "By when are the chances of my marriage likely?" },
      { hi: "क्या मेरा love marriage होगा या arrange marriage?", en: "Will I have a love marriage or an arranged marriage?" },
      { hi: "क्या मेरे relationship में कोई hidden problem है जो future में issue बन सकती है?", en: "Is there a hidden problem in my relationship that could cause issues later?" },
      { hi: "क्या मेरे life partner supportive होंगे?", en: "Will my life partner be supportive?" }
    ]
  },
  life: {
    label: { hindi: "🌟 Life (जनरल लाइफ / भाग्य)", english: "🌟 Life" },
    questions: [
      { hi: "क्या मेरा आने वाला समय lucky रहने वाला है?", en: "Is my upcoming time going to be lucky?" },
      { hi: "क्या मेरे जीवन में कोई बड़ा turning point आने वाला है?", en: "Is there a major turning point coming in my life?" },
      { hi: "क्या मेरी कुंडली में financial stability के strong योग हैं?", en: "Are there strong indications of financial stability in my chart?" },
      { hi: "मुझे किस चीज़ पर सबसे ज्यादा focus करना चाहिए life में?", en: "What should I focus on most in my life?" }
    ]
  }
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-bold text-[#4A2E10] mb-1.5 uppercase tracking-wider">
    {children} <span className="text-[#8B1E1E]">*</span>
  </label>
);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const urlService = searchParams.get("service");
  const urlPlan = searchParams.get("plan");
  
  const serviceName = urlService ? decodeURIComponent(urlService) : "Premium Personalized Kundali";
  const planName = urlPlan ? decodeURIComponent(urlPlan) : "10-Year Report (₹999)";

  // Tracking flag to prevent multiple "Form Start" events
  const hasStartedForm = useRef(false);

  // Check if matchmaking
  const isMatchmaking = serviceName.toLowerCase().includes("couple match making");
  const showQuestionDropdown = serviceName === "Surbhi Kundli" && planName.includes("Report + 1Q");

  let basePrice = 999;
  const priceMatch = planName.match(/₹([\d,]+)/);
  if (priceMatch && priceMatch[1]) {
    basePrice = parseInt(priceMatch[1].replace(/,/g, ""), 10);
  }

  const cleanPlanName = planName.replace(/\s*\(₹[\d,]+\)/, "");
  const fullReportType = `${serviceName} - ${cleanPlanName}`;

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: serviceName,
        value: basePrice,
        currency: 'INR'
      });
    }
  }, [serviceName, basePrice]);

  const [form, setForm] = useState({
    name: "",      // Partner 1 Name
    email: "",     // Main Email
    phone: "",     // Main WhatsApp
    reportType: fullReportType, 
    dob: "",       // Partner 1 DOB
    tob: "",       // Partner 1 TOB
    city: "",      // Partner 1 City
    pinCode: "",   // Main Pin
    gender: "",    // Partner 1 Gender
    language: "hindi",
    challenge: isMatchmaking ? "Matchmaking Analysis Request" : "No Issue",
    // Partner 2 Details
    partnerName: "",
    partnerDob: "",
    partnerTob: "",
    partnerCity: "",
    partnerGender: ""
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const finalAmount = basePrice; 

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Track user starting to fill the form
  const trackFormStart = () => {
    if (!hasStartedForm.current) {
      if (window.fbq) {
        window.fbq('trackCustom', 'FormFillStarted', {
          service: serviceName,
          plan: planName
        });
      }
      hasStartedForm.current = true;
    }
  };

  const handleChange = (e: any) => {
    trackFormStart(); // Trigger tracking on first input
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    // Analytics: Track the attempt to pay (Submit Button Click)
    if (window.fbq) {
      window.fbq('trackCustom', 'ClickPaySecurely', {
        content_name: form.reportType,
        value: finalAmount,
        currency: 'INR'
      });
    }

    if (!agreedToTerms) {
      alert("Please agree to the Terms and Conditions to proceed.");
      return;
    }

    // Validation
    const commonFields = form.email && form.phone && form.dob && form.name;
    const matchmakingFields = form.partnerName && form.partnerDob;

    if (!commonFields || (isMatchmaking && !matchmakingFields)) {
      alert("Please fill in all birth details for both partners to continue.");
      return;
    }

    // Existing Pixel Event
    if (window.fbq) {
      window.fbq('track', 'AddPaymentInfo', {
        content_name: form.reportType,
        value: finalAmount,
        currency: 'INR'
      });
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: finalAmount }),
      });
      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Astro Surbhi Gupta",
        description: form.reportType, 
        order_id: order.id,
        handler: async function (response: any) {
          // Analytics: Track standard Purchase event on success
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: finalAmount,
              currency: 'INR',
              content_name: form.reportType
            });
          }

          await fetch("/api/payment-success", {
            method: "POST",
            body: JSON.stringify({ ...response, form, finalAmount }),
          });
          window.location.href = "/success";
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#8B1E1E" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#FCF7EE] border border-[#E8D8B8] rounded-xl p-3.5 text-sm text-[#2A1400] focus:outline-none focus:ring-2 focus:ring-[#C8A84B]/50 transition-all placeholder-gray-400";
  const matchmakingInputClass = "w-full bg-transparent border-b border-[#E8D8B8] p-2 text-sm text-[#2A1400] focus:outline-none focus:border-[#8B1E1E] transition-all placeholder-gray-400/50 mb-2";

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start px-4">
      
      {/* ================= LEFT: PRODUCT SUMMARY ================= */}
      <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50 lg:sticky lg:top-8">
        <div className="w-full aspect-[4/3] bg-[#FCF7EE] rounded-2xl flex items-center justify-center border border-[#E8D8B8] mb-8 overflow-hidden relative">
          <Image src="/surbhi-narendra.JPG" alt={serviceName} className="h-full object-cover object-left mix-blend-multiply drop-shadow-2xl" fill priority />
        </div>
        <div className="inline-block bg-[#8B1E1E]/10 text-[#8B1E1E] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-md mb-3">Order Summary</div>
        <h2 className="text-2xl lg:text-3xl font-bold text-[#2A1400] font-serif mb-2">{serviceName}</h2>
        <h3 className="text-lg text-[#C8A84B] font-bold mb-4 uppercase tracking-wide">Plan: {cleanPlanName}</h3>
        <p className="text-[#8B1E1E] text-4xl font-extrabold pb-6 border-b border-[#E8D8B8]">₹{basePrice}</p>
        <ul className="text-sm text-[#6B4423] space-y-3 mt-6">
          <li className="flex items-start gap-3 font-medium">✓ Authentic Vedic Analysis</li>
          <li className="flex items-start gap-3 font-medium">✓ 100% Confidential</li>
          <li className="flex items-start gap-3 font-medium">✓ Personal Guidance by Surbhi's Team</li>
        </ul>
          <div className="mt-8 bg-[#FFFBF0] border border-[#C8A84B]/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-xs text-[#4A2E10] leading-relaxed font-medium">
            <strong>100% Secure Checkout.</strong> Your personal details are encrypted and kept strictly confidential.
          </p>
        </div>
      </div>

      {/* ================= RIGHT: CHECKOUT FORM ================= */}
      <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50">
        <h3 className="text-xl font-bold text-[#2A1400] mb-6 font-serif border-b border-[#E8D8B8] pb-4 text-center">
          {isMatchmaking ? "Matchmaking Calculator" : "Birth Details & Delivery Info"}
        </h3>

        <div className="space-y-6">
          {/* Main Contact Section (Always Visible) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><Label>Main WhatsApp Number</Label><input name="phone" placeholder="+91 98765 43210" className={inputClass} onChange={handleChange} onFocus={trackFormStart} /></div>
            <div><Label>Main Email Address</Label><input name="email" type="email" placeholder="john@example.com" className={inputClass} onChange={handleChange} onFocus={trackFormStart} /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div>
              <Label>Selected Package</Label>
              <input 
                name="reportType" 
                value={form.reportType} 
                title={form.reportType}
                readOnly 
                className={`${inputClass} bg-[#F4EAD6] text-[#6B4423] cursor-not-allowed border-transparent text-ellipsis overflow-hidden`} 
              />
            </div>
            <div>
              <Label>Report Language</Label>
              <select name="language" className={inputClass} value={form.language} onChange={handleChange}>
                <option value="hindi">Hindi (हिंदी)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>

          {/* Partner 1 Section (Standard fields repurposed) */}
          <div className="space-y-5 pt-4">
            <h4 className="font-bold text-[#8B1E1E] text-sm uppercase tracking-widest border-l-4 border-[#8B1E1E] pl-3">
              {isMatchmaking ? "Person 1 Details (You)" : "Birth Details"}
            </h4>
            <div className={isMatchmaking ? "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4" : "space-y-4"}>
              <div><Label>Full Name</Label><input name="name" placeholder="Enter name" className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange} /></div>
              <div>
              <Label>Pin Code</Label>
              <input name="pinCode" placeholder="e.g. 110001" className={inputClass} onChange={handleChange} />
            </div>
              <div className={isMatchmaking ? "block" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
                  <div className="mb-4">
                    <Label>Date of Birth</Label>
                    <input name="dob" type="date" className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange} />
                  </div>
                  
                  <div>
                    <Label>Time of Birth</Label>
                    <input name="tob" type="time" className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange} />
                  </div>
              </div>
              <div className={isMatchmaking ? "block" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
                <div className="mb-4">
                   <Label>Birth City</Label>
                   <input name="city" placeholder="Enter city" className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange} />
                </div>
                <div>
                   <Label>Gender</Label>
                   <select name="gender" className={isMatchmaking ? matchmakingInputClass : inputClass} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                   </select>
                </div>
              </div>
            </div>
          </div>

          {/* Partner 2 Section (Only visible in Matchmaking mode) */}
          {isMatchmaking && (
            <div className="space-y-5 pt-6 border-t border-[#E8D8B8]/30">
              <h4 className="font-bold text-[#8B1E1E] text-sm uppercase tracking-widest border-l-4 border-[#8B1E1E] pl-3">
                Person 2 Details (Partner)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div><Label>Partner's Name</Label><input name="partnerName" placeholder="Enter partner's name" className={matchmakingInputClass} onChange={handleChange} /></div>
                <div><Label>Partner's Date of Birth</Label><input name="partnerDob" type="date" className={matchmakingInputClass} onChange={handleChange} /></div>
                <div><Label>Partner's Time of Birth</Label><input name="partnerTob" type="time" className={matchmakingInputClass} onChange={handleChange} /></div>
                <div><Label>Partner's Birth Place</Label><input name="partnerCity" placeholder="Enter birth place" className={matchmakingInputClass} onChange={handleChange} /></div>
                <div>
                   <Label>Partner's Gender</Label>
                   <select name="partnerGender" className={matchmakingInputClass} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                   </select>
                </div>
              </div>
            </div>
          )}

          {/* Question Dropdown for Standard Services */}
          {!isMatchmaking && showQuestionDropdown && (
            <div>
              <Label>Select Your 1 Primary Question</Label>
              <select name="challenge" className={`${inputClass} border-2 border-[#C8A84B]/30`} onChange={handleChange} value={form.challenge}>
                <option value="">-- Choose your question --</option>
                {Object.entries(QUESTION_DATA).map(([key, group]) => (
                  <optgroup key={key} label={form.language === 'hindi' ? group.label.hindi : group.label.english}>
                    {group.questions.map((q, idx) => (
                      <option key={idx} value={form.language === 'hindi' ? q.hi : q.en}>{form.language === 'hindi' ? q.hi : q.en}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-start gap-3 mt-8 p-4 bg-[#FCF7EE] rounded-xl border border-[#E8D8B8]/50">
            <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-5 h-5 accent-[#8B1E1E]" />
            <label htmlFor="terms" className="text-sm text-[#6B4423]">I verify details are accurate. I agree to <Link href="/terms-and-conditions" className="text-[#8B1E1E] font-bold">Terms</Link>.</label>
          </div>

          <button onClick={handlePayment} disabled={loading} className="w-full bg-gradient-to-r from-[#8B1E1E] to-[#5C1414] text-white py-5 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-70">
            {loading ? "Processing Securely..." : `Pay ₹${finalAmount} Securely`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FCF7EE] font-sans text-[#2A1400] pb-20">
      <header className="bg-white border-b border-[#E8D8B8] py-5 px-4 mb-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-14 w-auto" />
            <div className="hidden sm:block text-[1.15rem] font-bold">Surbhi Gupta</div>
          </Link>
          <div className="text-[#1B4D30] font-bold text-xs uppercase bg-[#E6F5EE] px-3 py-1.5 rounded-full">Secure Checkout</div>
        </div>
      </header>
      <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E1E]"></div></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}