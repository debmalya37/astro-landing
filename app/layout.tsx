import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1A0A00",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Celebrity Astrologer Surbhi Gupta - Personalized Astrology Reports",
  description: "Unveil the secrets of your future with Surbhi Gupta. Personalized astrology, career guidance, and love compatibility analysis.",
  alternates: {
    canonical: "https://surabhiastrology.com",
  },
};

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <head>
        {/* 1. KEEP PRECONNECT: This is low-cost and helps both mobile/desktop */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        
        {/* 2. REMOVED MANUAL PRELOAD: 
           Manual preloads for Next.js images often cause double-downloads on mobile, 
           dropping the score. We will use 'priority' in the component instead.
        */}

        <Script id="fb-pixel" strategy="lazyOnload">
          {`
            if (window.location.hostname !== 'localhost') {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              (window.requestIdleCallback || window.setTimeout)(function() {
                fbq('init', '1836254097051134'); 
                fbq('track', 'PageView');
              });
            }
          `}
        </Script>
      </head>
      {/* 3. OPTIMIZED BODY: scroll-smooth can stay as it's CSS-only */}
<body className={`${fraunces.variable} ${outfit.variable} antialiased font-outfit scroll-smooth`}>
        {children}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1836254097051134&ev=PageView&noscript=1"
            alt="pixel"
          />
        </noscript>
      </body>
    </html>
  );
}