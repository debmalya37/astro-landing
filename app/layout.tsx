import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



export const metadata: Metadata = {
  title: "Celebrity Astrologer Surbhi Gupta - Personalized Astrology Reports & Consultations",
  description: "Discover your destiny with Surbhi Gupta, a renowned celebrity astrologer. Get personalized astrology reports, career guidance, love compatibility analysis, and more. Unveil the secrets of your future today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
