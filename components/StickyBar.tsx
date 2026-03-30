"use client";

import { useEffect, useState } from "react";

export default function StickyBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setShow(window.scrollY > 300);
    });
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-ivory border-t p-4 flex justify-between transition ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div>
        <p className="font-bold">Kundali Report</p>
        <p className="text-sm text-red-600">273 spots left</p>
      </div>

      <a className="bg-dk text-white px-4 py-2 rounded-full">
        Get Now ₹999
      </a>
    </div>
  );
}