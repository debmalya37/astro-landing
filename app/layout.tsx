import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Serif_Display, Karla } from "next/font/google"; // CHANGED: Replaced existing fonts with Cormorant Garamond and Karla
import Script from "next/script";
import "./globals.css";

// 1. Optimize Font Loading
// Set up both fonts as CSS variables to hook clean local system fallbacks
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
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
    // CHANGED: Linked the HTML tag to inject both variables into the layout tree
    <html lang="en" className={`${cormorantGaramond.variable} ${karla.variable}`}>
      <head>
        {/* GLOBAL GOOGLE TAG MANAGER (GTM) CODES */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N6XWPHSK');
          `}
        </Script>

        {/* OPTIMIZATION: FACEBOOK PIXEL */}
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
      {/* CHANGED: Configured the baseline body stack utilizing your precise font variables and cross-platform fallback priorities */}
      <body 
        className="antialiased" 
        style={{ fontFamily: `var(--font-sans), ui-sans-serif, system-ui, sans-serif` }}
      >
        {/* GTM FALLBACK LAYER FOR BROWSERS WITH RUNTIME JAVASCRIPT DISABLED */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-N6XWPHSK" 
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        {children}

        {/* FACEBOOK PIXEL FALLBACK LAYER */}
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