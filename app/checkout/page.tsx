"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Reusable Input Label Component
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-bold text-[#4A2E10] mb-1.5 uppercase tracking-wider">
    {children} <span className="text-[#8B1E1E]">*</span>
  </label>
);

function CheckoutContent() {
  const searchParams = useSearchParams();
  
  // 1. Read URL parameters sent from the WhatsApp bot
  const urlService = searchParams.get("service");
  const urlPlan = searchParams.get("plan");
  
  const serviceName = urlService ? decodeURIComponent(urlService) : "Premium Personalized Kundali";
  const planName = urlPlan ? decodeURIComponent(urlPlan) : "10-Year Report (₹999)";

  // 2. Smart Price Extraction: Find the price inside the plan string (e.g., "Report + Call (₹11,000)")
  let basePrice = 999;
  const priceMatch = planName.match(/₹([\d,]+)/);
  if (priceMatch && priceMatch[1]) {
    // Remove commas and parse to integer
    basePrice = parseInt(priceMatch[1].replace(/,/g, ""), 10);
  }

  // Clean the plan name for the database (removes the price tag from the string)
  const cleanPlanName = planName.replace(/\s*\(₹[\d,]+\)/, "");
  // Combine them so the backend API knows exactly what was ordered
  const fullReportType = `${serviceName} - ${cleanPlanName}`;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reportType: fullReportType, 
    dob: "",
    tob: "",
    city: "",
    pinCode: "",
    gender: "",
    language: "",
    challenge: "No Issue",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalAmount = basePrice; 

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the Terms and Conditions to proceed.");
      return;
    }

    // Basic Validation
    if (!form.name || !form.email || !form.phone || !form.dob) {
      alert("Please fill in all required fields.");
      return;
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
          const verify = await fetch("/api/payment-success", {
            method: "POST",
            body: JSON.stringify({
              ...response,
              form,
              finalAmount
            }),
          });

          const data = await verify.json();

          if (data.whatsappLink) {
            localStorage.setItem("wa_link", data.whatsappLink);
          }

          window.location.href = "/success";
        },

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#8B1E1E", // Premium Burgundy
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Shared Input Styles
  const inputClass = "w-full bg-[#FCF7EE] border border-[#E8D8B8] rounded-xl p-3.5 text-sm text-[#2A1400] focus:outline-none focus:ring-2 focus:ring-[#C8A84B]/50 focus:border-[#C8A84B] transition-all placeholder-gray-400";

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start">
      
      {/* ================= LEFT/TOP: PRODUCT SUMMARY ================= */}
      <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50 lg:sticky lg:top-8">
        
        {/* Product Image */}
        <div className="w-full aspect-[4/3] bg-[#FCF7EE] rounded-2xl flex items-center justify-center border border-[#E8D8B8] mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,168,75,0.1)_0%,transparent_70%)]"></div>
          <img
            src="https://reports.adityakundali.com/wp-content/uploads/2025/04/4aa56f11d45-scaled.webp"
            alt={serviceName}
            className="h-full object-cover mix-blend-multiply drop-shadow-2xl z-10 hover:scale-105 transition-transform duration-700"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        <div className="inline-block bg-[#8B1E1E]/10 text-[#8B1E1E] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-md mb-3">
          Order Summary
        </div>
        
        <h2 className="text-2xl lg:text-3xl font-bold text-[#2A1400] font-serif leading-tight mb-2">
          {serviceName}
        </h2>
        <h3 className="text-lg text-[#C8A84B] font-bold mb-4 uppercase tracking-wide">
          Plan: {cleanPlanName}
        </h3>

        {/* Pricing Block */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E8D8B8]">
          <p className="text-[#8B1E1E] text-4xl font-extrabold leading-none">₹{basePrice}</p>
        </div>

        <h3 className="font-bold text-sm text-[#4A2E10] uppercase tracking-wider mb-4">Service Guarantee:</h3>
        <ul className="text-sm text-[#6B4423] space-y-3">
          {[
            "Authentic Vedic Astrological Analysis",
            "100% Confidential & Secure Process",
            "Direct processing by Surbhi Gupta's Team"
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 font-medium">
              <div className="w-5 h-5 rounded-full bg-[#C8A84B]/20 text-[#8B1E1E] flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 bg-[#FFFBF0] border border-[#C8A84B]/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-xs text-[#4A2E10] leading-relaxed font-medium">
            <strong>100% Secure Checkout.</strong> Your personal details are encrypted and kept strictly confidential.
          </p>
        </div>
      </div>

      {/* ================= RIGHT/BOTTOM: CHECKOUT FORM ================= */}
      <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_15px_40px_rgba(61,22,0,0.06)] border border-[#E8D8B8]/50">
        
        <h3 className="text-xl font-bold text-[#2A1400] mb-6 font-serif border-b border-[#E8D8B8] pb-4">
          Birth Details & Delivery Info
        </h3>

        <div className="space-y-6">
          
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label>Full Name</Label>
              <input name="name" placeholder="John Doe" className={inputClass} onChange={handleChange} />
            </div>
            <div>
              <Label>Email Address</Label>
              <input name="email" type="email" placeholder="john@example.com" className={inputClass} onChange={handleChange} />
            </div>
          </div>

          {/* Row 2: WhatsApp & Report Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label>WhatsApp Number</Label>
              <input name="phone" placeholder="+91 98765 43210" className={inputClass} onChange={handleChange} />
            </div>
            <div>
              <Label>Selected Package</Label>
              {/* Using native title attribute to show full text on hover if it gets cut off */}
              <input 
                name="reportType" 
                value={form.reportType} 
                title={form.reportType}
                readOnly 
                className={`${inputClass} bg-[#F4EAD6] text-[#6B4423] cursor-not-allowed border-transparent text-ellipsis overflow-hidden`} 
              />
            </div>
          </div>

          {/* Row 3: Birth Details */}
          <div className="bg-[#FFFBF0] border border-[#E8D8B8]/50 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label>Date of Birth</Label>
              <input name="dob" type="date" className={inputClass} onChange={handleChange} />
            </div>
            <div>
              <Label>Time of Birth</Label>
              <input name="tob" type="time" className={inputClass} onChange={handleChange} />
            </div>
            <div>
              <Label>Birth City</Label>
              <input name="city" placeholder="e.g. New Delhi" className={inputClass} onChange={handleChange} />
            </div>
            <div>
              <Label>Pin Code</Label>
              <input name="pinCode" placeholder="e.g. 110001" className={inputClass} onChange={handleChange} />
            </div>
          </div>

          {/* Row 4: Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <Label>Gender</Label>
              <select name="gender" className={inputClass} onChange={handleChange} defaultValue="">
                <option value="" disabled>Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <Label>Language</Label>
              <select name="language" className={inputClass} onChange={handleChange} defaultValue="">
                <option value="" disabled>Select</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>
            <div>
              <Label>Current Challenge</Label>
              <select name="challenge" className={inputClass} onChange={handleChange} defaultValue="No Issue">
                <option value="No Issue">None</option>
                <option value="Career">Career / Job</option>
                <option value="Marriage">Marriage / Love</option>
                <option value="Health">Health</option>
                <option value="Wealth">Finance / Wealth</option>
              </select>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 mt-8 p-4 bg-[#FCF7EE] rounded-xl border border-[#E8D8B8]/50">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreedToTerms} 
              onChange={(e) => setAgreedToTerms(e.target.checked)} 
              className="w-5 h-5 mt-0.5 accent-[#8B1E1E] cursor-pointer rounded border-[#E8D8B8]" 
            />
            <label htmlFor="terms" className="text-sm text-[#6B4423] cursor-pointer leading-tight">
              I verify that the birth details provided are accurate. I agree to the <a href="#" className="text-[#8B1E1E] font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-[#8B1E1E] font-bold hover:underline">Privacy Policy</a>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8B1E1E] to-[#5C1414] hover:from-[#A32A2A] hover:to-[#6B1717] transition-all text-white py-5 rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(139,30,30,0.2)] hover:shadow-[0_15px_30px_rgba(139,30,30,0.3)] hover:-translate-y-0.5 flex justify-center items-center gap-3 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Processing Securely..." : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Pay ₹{finalAmount} Securely
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FCF7EE] font-sans text-[#2A1400] pb-20">
      
      {/* Simple Elegant Header */}
      <header className="bg-white border-b border-[#E8D8B8] py-5 px-4 mb-8 lg:mb-12 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <Link href="/" className="flex-shrink-0 flex items-center">
          <img 
            src="/logo.svg" 
            alt="Celebrity Astrologer Surbhi Gupta" 
            className="h-14 sm:h-16 lg:h-16 w-auto object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden fraunces text-[1.15rem] sm:text-[1.35rem] font-bold">
            Celebrity Astrologer Surbhi <em style={{ fontStyle: "italic",}}>Gupta</em>
          </div>
        </Link>
          <div className="flex items-center gap-2 text-[#1B4D30] font-bold text-xs uppercase tracking-widest bg-[#E6F5EE] px-3 py-1.5 rounded-full border border-[#1B4D30]/20">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Secure Checkout
          </div>
        </div>
      </header>

      {/* Wrap the content in a Suspense boundary so Next.js App Router 
        doesn't throw build errors when using useSearchParams.
      */}
      <Suspense fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E1E]"></div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>

    </div>
  );
}