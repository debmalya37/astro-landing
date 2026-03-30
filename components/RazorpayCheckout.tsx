"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Props = {
  name: string;
  email: string;
  phone: string;
  planId: "basic" | "premium";
  amount: number;
};

export default function RazorpayCheckout(props: Props) {
  const [loading, setLoading] = useState(false);

  async function loadScript() {
    return new Promise<boolean>((resolve) => {
      if (document.getElementById("rzp-script")) return resolve(true);
      const s = document.createElement("script");
      s.id = "rzp-script";
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function pay() {
    setLoading(true);
    try {
      const ok = await loadScript();
      if (!ok) throw new Error("Razorpay SDK failed to load");

      const receipt = `rcpt_${Date.now()}`;
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: props.amount, receipt }),
      });
      const order = await orderRes.json();
      if (!order?.id) throw new Error(order?.error || "Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Astrologar",
        description: `${props.planId} report`,
        order_id: order.id,
        prefill: {
          name: props.name,
          email: props.email,
          contact: props.phone,
        },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              customer: {
                name: props.name,
                email: props.email,
                phone: props.phone,
                planId: props.planId,
              },
            }),
          });
          const verify = await verifyRes.json();
          if (verify.ok) {
            window.location.href = "/success";
          } else {
            alert(verify.message || verify.error || "Payment verification failed");
          }
        },
        theme: { color: "#111827" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e?.message || "Payment init failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={pay}
      disabled={loading}
      className="px-4 py-2 rounded bg-indigo-600 text-white"
    >
      {loading ? "Processing..." : `Pay ₹${props.amount}`}
    </button>
  );
}