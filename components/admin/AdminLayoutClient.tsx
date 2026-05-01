"use client";

import { useState } from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayoutClient({
  children,
  isLoginPage
}: {
  children: React.ReactNode;
  isLoginPage: boolean;
}) {
  // Shared state: Start closed on mobile, open on desktop
  const [isNavOpen, setIsNavOpen] = useState(true);

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* Pass state and setter to Navbar */}
      <AdminNavbar isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
      
      {/* 
          Main content now dynamically adjusts! 
          If Nav is open, add 64rem padding on large screens.
          If Nav is closed, it takes up 100% width.
      */}
      <main className={`flex-grow w-full transition-all duration-300 ease-in-out ${isNavOpen ? "lg:pl-64" : "pl-0"}`}>
        <div className="p-4 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}