// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reportType: "Fortune Report",
    dob: "",
    tob: "",
    city: "",
    pinCode: "",
    gender: "",
    language: "",
    challenge: "No Issue",
  });

  // State for the exclusive offers
  const [offers, setOffers] = useState({
    expressDelivery: false,
    consultation: false,
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate dynamic pricing
  const basePrice = 499;
  const expressPrice = 149;
  const consultationPrice = 1100;
  
  const finalAmount = 
    basePrice + 
    (offers.expressDelivery ? expressPrice : 0) + 
    (offers.consultation ? consultationPrice : 0);

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

  const handleOfferChange = (e: any) => {
    setOffers({ ...offers, [e.target.name]: e.target.checked });
  };

  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the Terms and Conditions.");
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
        description: "Fortune Report Order",
        order_id: order.id,

        handler: async function (response: any) {
          const verify = await fetch("/api/payment-success", {
            method: "POST",
            body: JSON.stringify({
              ...response,
              form,
              offers,
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
          color: "#882333", // Matched to the maroon theme
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reusable Input Label Component
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 font-sans text-gray-800">
      {/* Header */}
      <div className="text-center mb-10">
        {/* Replace with your actual logo path */}
        <img 
          src="/logo.png" 
          alt="Astro Arun Pandit" 
          className="h-16 mx-auto mb-4 object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none' }} // Hides broken image if logo doesn't exist yet
        />
        <h1 className="text-2xl font-bold text-[#882333]">Order Your Fortune Report</h1>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.3fr] gap-8">
        
        {/* ================= LEFT PRODUCT COLUMN ================= */}
        <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] h-fit">
          <img
            src="/book.png" // Ensure you have the 2 books image here
            alt="Fortune Report Book"
            className="w-56 mx-auto mb-8"
          />

          <h2 className="text-[22px] font-bold text-gray-900">Fortune Report</h2>
          <p className="text-[#882333] text-[22px] font-bold mt-1">₹499</p>

          <p className="text-[15px] text-gray-600 mt-4 leading-relaxed">
            Your Personalized Roadmap to Life's Big Questions
          </p>

          <h3 className="font-bold text-[15px] text-gray-900 mt-6 mb-3">What's Included:</h3>
          <ul className="text-[14px] text-gray-600 space-y-3">
            {[
              "Insights on career, love, health & wealth",
              "Easy remedies like gemstones, mantras & yantras",
              "Written in clear, simple language by expert numerologists"
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {/* Custom Maroon Check Icon */}
                <svg className="w-5 h-5 text-[#882333] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[13px] text-gray-500 leading-relaxed border-t pt-6">
            Perfect for anyone who wants clear answers & direction for the next chapter of life.
          </p>
        </div>

        {/* ================= RIGHT FORM COLUMN ================= */}
        <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="space-y-5">
            
            {/* Name */}
            <div>
              <Label>Name</Label>
              <input name="name" placeholder="Enter your name" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333]" onChange={handleChange} />
            </div>

            {/* Email */}
            <div>
              <Label>Email</Label>
              <input name="email" type="email" placeholder="Enter your email" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333]" onChange={handleChange} />
            </div>

            {/* WhatsApp */}
            <div>
              <Label>WhatsApp Number</Label>
              <input name="phone" placeholder="Enter your WhatsApp number" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333]" onChange={handleChange} />
            </div>

            {/* Report Type */}
            <div>
              <Label>Select Report Type</Label>
              <input name="reportType" value={form.reportType} readOnly className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] bg-gray-50 text-gray-500 outline-none" />
              <p className="text-[11px] text-gray-400 mt-1">Report type pre-selected based on your selection</p>
            </div>

            {/* Grid for 2-column inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label>Date of Birth</Label>
                <input name="dob" type="date" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333] text-gray-600" onChange={handleChange} />
              </div>
              <div>
                <Label>Time of Birth</Label>
                <input name="tob" type="time" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333] text-gray-600" onChange={handleChange} />
              </div>

              <div>
                <Label>Birth City</Label>
                <input name="city" placeholder="Enter a location" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333]" onChange={handleChange} />
              </div>
              <div>
                <Label>Birth Place Pin Code</Label>
                <input name="pinCode" placeholder="Your Pin Code" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333]" onChange={handleChange} />
              </div>

              <div>
                <Label>Gender</Label>
                <select name="gender" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333] bg-white" onChange={handleChange} defaultValue="">
                  <option value="" disabled>-- Select Gender --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <Label>Report Language</Label>
                <select name="language" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333] bg-white" onChange={handleChange} defaultValue="">
                  <option value="" disabled>--Select--</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
            </div>

            {/* Current Challenge */}
            <div>
              <Label>Current Challenge</Label>
              <select name="challenge" className="w-full border border-gray-200 rounded-md p-2.5 text-[14px] focus:outline-none focus:border-[#882333] bg-white" onChange={handleChange} defaultValue="No Issue">
                <option value="No Issue">No Issue</option>
                <option value="Career">Career</option>
                <option value="Marriage">Marriage</option>
                <option value="Health">Health</option>
              </select>
            </div>

            {/* Exclusive Offer Section */}
            <div className="mt-8 border border-[#e4e4e4] rounded-lg bg-[#f6f5f3] p-5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-medium text-gray-800">Exclusive Offer for You</h3>
                {/* CSS Badge for Limited Time Offer */}
                <div className="absolute top-0 right-0 bg-[#d9232d] text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  LIMITED TIME OFFER
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="expressDelivery" checked={offers.expressDelivery} onChange={handleOfferChange} className="mt-1 w-4 h-4 accent-[#882333] cursor-pointer" />
                  <div>
                    <p className="text-[14px] text-gray-800">Express Delivery (+₹{expressPrice})</p>
                    <p className="text-[11px] text-gray-500">Get priority delivery of report within 24 hours</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="consultation" checked={offers.consultation} onChange={handleOfferChange} className="mt-1 w-4 h-4 accent-[#882333] cursor-pointer" />
                  <div>
                    <p className="text-[14px] text-gray-800">Astrology Consultation (+₹{consultationPrice})</p>
                    <p className="text-[11px] text-gray-500">Need more clarity? Talk to an astrologer one-on-one.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-4 h-4 accent-[#882333] cursor-pointer" />
              <label htmlFor="terms" className="text-[13px] text-gray-600 cursor-pointer">
                I agree to the <span className="text-blue-600 hover:underline">Terms and Conditions</span>.
              </label>
            </div>

            {/* Final Amount */}
            <div className="bg-[#f8f9fa] border border-gray-200 p-4 rounded-lg flex justify-between items-center mt-6">
              <span className="font-bold text-gray-800 text-[16px]">Final Amount:</span>
              <span className="font-bold text-[#882333] text-[20px]">₹{finalAmount}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-[#659bf5] hover:bg-[#5289e6] transition-colors text-white py-3.5 rounded-md font-semibold text-[15px] flex justify-center items-center gap-2 mt-4"
            >
              {loading ? "Processing..." : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Pay with Razorpay
                </>
              )}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}