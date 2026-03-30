// app/success/page.tsx
"use client";

import { useEffect } from "react";

export default function SuccessPage() {
  useEffect(() => {
    const link = localStorage.getItem("wa_link");
    if (link) {
      window.open(link, "_blank");
    }
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful ✅
      </h1>
      <p className="mt-2 text-gray-600">
        Your report will be delivered soon.
      </p>
    </div>
  );
}