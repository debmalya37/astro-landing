"use client";
import dynamic from 'next/dynamic';

// Lazy load the heavy interactive components
const ComparisonSlider2 = dynamic(() => import("@/components/Comparisonslider2"), {
  ssr: false, // Prevents server-side bloat
  loading: () => <div className="h-[500px] bg-ivory animate-pulse" /> // Placeholder
});
import HowItWorksSection from "@/components/Simplesteps";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FaWhatsapp } from 'react-icons/fa6'
import Image from 'next/image';
// import TestimonialsSection from "@/components/Testimonials";


// Load sections that are further down the page lazily
const TestimonialsSection = dynamic(() => import('@/components/Testimonials'), {
  loading: () => <div className="h-96 animate-pulse bg-ivory" />
});

/* ─── PREMIUM COLOUR TOKENS ─── */
const C = {
  dk:  "#1A0A00",     // Deepest cosmic brown/black
  dk2: "#2A0E00",     // Dark brown base
  dk3: "#3D1600",
  g:   "#C8A84B",     // Primary Gold
  g2:  "#E2C06A",     // Bright Gold
  g3:  "#F5D98A", 
  g4:  "#FFF0C0",
  gg:  "rgba(200,168,75,0.22)",    // Highlight Gold
  heroBg: "#EFCF7A",  // Warm golden yellow from inspiration
  heroBg2: "#DEB85D", // Deeper gold for gradient
  iv:  "#FCF7EE",     // Ivory/Cream background
  iv2: "#F4EAD6",
  iv3: "#E8D8B8",
  iv4: "#D8C49A",
  t1:  "#2A1400",     // Dark text
  t2:  "#4A2E10",     // Medium text
  red: "#8B1E1E",     // Premium deep red
  grn: "#1B4D30",     // Premium deep green
  td1: "#FCF7EE",
  td2: "rgba(252,247,238,0.80)",
  td3: "rgba(252,247,238,0.52)",
  td4: "rgba(252,247,238,0.30)",
};

/* ─── GLOBAL KEYFRAME STYLES ─── */
const GlobalStyles = () => (
  <style>{`
    
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { 
      font-family: var(--font-outfit), sans-serif; 
      background: ${C.iv}; 
      color: ${C.t1}; 
      overflow-x: hidden; 
      -webkit-font-smoothing: antialiased; 
    }

    .Georgia { font-family: 'Georgia', serif; }
    
    /* Paper noise overlay for premium texture */
    body::before {
      content: ''; position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03; pointer-events: none; z-index: 9000;
    }

    /* Animations */
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
    @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spin-slow-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    @keyframes auto-shine { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }

    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
    .animate-spin-slow { animation: spin-slow 40s linear infinite; }
    .animate-spin-reverse { animation: spin-slow-reverse 60s linear infinite; }

    /* Premium Button Shine */
    .btn-auto-shine { position: relative; overflow: hidden; }
    .btn-auto-shine::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.4) 50%, transparent 80%);
      animation: auto-shine 3s infinite linear;
    }

    /* Scroll Reveal Classes */
    .reveal { opacity: 0; transform: translateY(40px); transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .d1 { transition-delay: 0.1s; } .d2 { transition-delay: 0.2s; } .d3 { transition-delay: 0.3s; } .d4 { transition-delay: 0.4s; }

    /* Glassmorphism Cards */
    .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    
    /* Stepper Line */
    .timeline-line::before {
      content: ''; position: absolute; left: 24px; top: 0; bottom: 0; width: 2px;
      background: linear-gradient(to bottom, ${C.g}, transparent); z-index: 0;
    }
    @media (max-width: 768px) { .timeline-line::before { left: 16px; } }
    
    /* Comparison Slider */
    .slider-handle { cursor: ew-resize; touch-action: pan-y; }
    .clip-before { clip-path: polygon(0 0, var(--pos) 0, var(--pos) 100%, 0 100%); }
    .clip-after { clip-path: polygon(var(--pos) 0, 100% 0, 100% 100%, var(--pos) 100%); }

    
  `}</style>
);


/* ─── STAR CANVAS ─── */
function StarCanvas({ id, style }: { id: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const parent = c.parentElement!;
    const ctx = c.getContext("2d")!;
    type Star = { x: number; y: number; r: number; o: number; s: number };
    let stars: Star[] = [], W = 0, H = 0, frame = 0, raf = 0;
    const resize = () => {
      W = c.width = parent.offsetWidth;
      H = c.height = parent.offsetHeight;
      stars = Array.from({ length: Math.floor((W * H) / 5500) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.2 + 0.25,
        o: Math.random() * 0.5 + 0.15,
        s: Math.random() * 0.4 + 0.08,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      stars.forEach((s, i) => {
        const fl = 0.5 + 0.5 * Math.sin(frame * s.s + i * 1.4);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,168,75,${s.o * fl})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={ref}
      id={id}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.55, ...style }}
    />
  );
}

/* ─── COUNTDOWN ─── */
function useCountdown() {
  const [time, setTime] = useState({ h: 11, m: 47, s: 22 });
  useEffect(() => {
    const KEY = "sg_v5_next";
    let end = Number(localStorage.getItem(KEY));
    if (!end || end < Date.now()) {
      end = Date.now() + (11 * 3600 + 47 * 60 + 22) * 1000;
      localStorage.setItem(KEY, String(end));
    }
    const tick = () => {
      const d = Math.max(0, end - Date.now());
      setTime({ h: Math.floor(d / 3600000), m: Math.floor((d % 3600000) / 60000), s: Math.floor((d % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ─── LIVE COUNTER ─── */
function useLiveCounter() {
  const [spots, setSpots] = useState(273);
  useEffect(() => {
    let s = 273;
    const dec = () => {
      if (s > 8) { s -= Math.ceil(Math.random() * 2); setSpots(s); }
      setTimeout(dec, 52000 + Math.random() * 88000);
    };
    const id = setTimeout(dec, 65000);
    return () => clearTimeout(id);
  }, []);
  return spots;
}

/* ─── FAQ ITEM ─── */
function FaqItem({ q, a, delay = "" }: { q: string; a: string; delay?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`reveal ${delay}`}
      style={{
        background: "#fff", border: `1px solid ${open ? "rgba(200,168,75,.35)" : C.iv3}`,
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 2px 14px rgba(42,14,0,.09)",
        transition: "border-color .2s", marginBottom: 9,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "none", border: "none", padding: "19px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
          cursor: "pointer", fontFamily: "'Nunito Sans',sans-serif",
          fontSize: ".89rem", fontWeight: 700, color: C.t1, textAlign: "left",
        }}
      >
        {q}
        <span style={{
          width: 27, height: 27, borderRadius: "50%",
          background: open ? C.g : C.iv2,
          border: `1px solid ${open ? C.g : C.iv3}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#fff" : C.g, flexShrink: 0,
          transform: open ? "rotate(45deg)" : "none",
          transition: "all .25s", fontSize: "1rem",
        }}>+</span>
      </button>
      <div className={`faq-answer ${open ? "open" : ""}`}
        style={{ padding: open ? "0 22px 20px" : "0 22px", fontSize: ".82rem", color: C.t2, lineHeight: 1.8 }}>
        {a}
      </div>
    </div>
  );
}



/* ─── 3D COSMIC EARTH BACKGROUND ─── */


// Make sure to add the 'Georgia' font family in your tailwind config or global CSS.


// export default CelebrityEndorsementSection;


/* ─── REVEAL HOOK ─── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── COMPARISON SLIDER COMPONENT ─── */



export default function NewLandingPage() {
  useReveal();
  const [stickyVisible, setStickyVisible] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
const [reportImgError, setReportImgError] = useState(false);
const countdown = useCountdown();
const time = useCountdown();
  const spots = useLiveCounter();
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <GlobalStyles />

      
{/* ── WA FLOAT ── */}
      <a 
  href="https://wa.me/919251151330?text=Hi" 
  target="_blank" 
  rel="noopener noreferrer"
  className="wa-float"
  style={{
    position: "fixed", 
    right: 22, 
    bottom: 88, 
    zIndex: 199,
    width: 54, 
    height: 54, 
    borderRadius: "50%", 
    background: "#25D366",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    fontSize: "1.4rem", 
    textDecoration: "none",
  }}
>
  <FaWhatsapp className="text-white w-8 h-8" />
</a>

    {/* ════════════════════════════════
          ANNOUNCEMENT BAR — PREMIUM RED
      ════════════════════════════════ */}
      <div 
        className="ann-bar-shimmer relative z-[100] flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 px-4 py-2.5 text-[0.65rem] sm:text-[0.75rem] font-semibold text-center border-b"
        style={{ 
          background: C.red, // Premium red base
          borderColor: "rgba(255,255,255,.15)", // Subtle white border
          color: C.iv, // White/Cream text
          boxShadow: "0 2px 12px rgba(168,32,32,.3)",
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Use the new ann-dot-gold class for gold pulse */}
          <div className="ann-dot-gold" />
          <span>🔥 Launch:&nbsp;<strong style={{ color: C.g3 }}>Don't Miss Out! Only 56 Spots Left </strong></span>
        </div>
        
        <span className="hidden sm:inline">&nbsp;— Get Your Premium  Surbhi Kundali  for  ₹999 <del className='text-white/65'>₹2999</del>&nbsp; </span>
         
        {/* Switched to gold accent for '1 FREE Question' for better premium feel against red */}
        <span style={{ color: C.g3, fontWeight: 700 }}>
          <span className="sm:hidden">+ </span>+ 1 FREE <span className="hidden sm:inline">WhatsApp Question →</span>
        </span>
        
        <a 
          href="#offer" 
          // Reusing the btn-auto-shine class for a continuous gold gleam on the CTA button
          className="btn-auto-shine ml-1 sm:ml-0 px-3 py-1 sm:px-[13px] sm:py-[4px] rounded-full font-medium no-underline whitespace-nowrap tracking-[0.04em] text-[0.6rem] sm:text-[0.68rem]"
          style={{ background: C.g, color: C.dk }} // Gold button, dark text
        >
          Claim Yours →
        </a>
      </div>
      {/* ════════════════════════════════
          NAVBAR
      ════════════════════════════════ */}
      <nav className="sticky top-0 z-[99] flex items-center justify-between px-4 lg:px-8 h-[70px] border-b backdrop-blur-xl" style={{ background: "rgba(252,247,238,0.9)", borderColor: C.iv2 }}>
        <Link href="/" className="flex-shrink-0 flex items-center">
  <Image 
    src="https://www.surabhiastrology.com/assets/surbhi-logo-7E9_g-Rh.png" 
    alt="Celebrity Astrologer Surbhi Gupta" 
    // 1. Provide the maximum desktop dimensions here
    width={250} 
    height={64}
    // 2. Add 'sizes' to tell Next.js to serve a smaller physical file for mobile
    sizes="(max-width: 768px) 150px, 250px"
    // 3. Use Tailwind to control the visible height on different screens
    className="h-10 sm:h-14 lg:h-16 w-auto object-contain"
    // 4. Critical for LCP and mobile score
    priority
    quality={50}
    fetchPriority="high"
  />
  {/* Fallback text */}
  <div className="hidden Georgia text-[1.15rem] sm:text-[1.35rem] font-bold" style={{ color: C.t1 }}>
    Celebrity Astrologer Surbhi <em style={{ fontStyle: "italic", color: C.g }}>Gupta</em>
  </div>
</Link>
        
        <div className="hidden md:flex items-center gap-2 text-sm font-medium" style={{ color: C.t2 }}>
          <span className="text-[#C8A000] tracking-widest text-lg">★★★★★</span> 4.9/5 • 1,50,000+ Reports
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#offer" className="btn-auto-shine rounded-full font-medium px-6 py-2.5 text-sm shadow-md transition-transform hover:scale-105"
             style={{ background: C.dk2, color: C.g3 }}>
            Get Premium Surbhi Kundali <span className="hidden sm:inline">— ₹999</span>
          </a>
        </div>
      </nav>

      
      
        {/* ════════════════════════════════
          HERO SECTION (Warm Gold Aesthetic)
      ════════════════════════════════ */}
      <section 
  className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-6 sm:py-10 lg:py-14" 
  style={{ background: `linear-gradient(160deg, #FFFFFF 0%, #FDF7EC 55%, #F3E8D6 100%)` }}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-5 w-full relative z-10 grid lg:grid-cols-2 gap-2 sm:gap-8 lg:gap-12 items-center">
    
    {/* ========================================================
        LEFT TEXT 
        ======================================================== */}
    <div className="text-center lg:text-left">
      <div className="inline-flex items-center gap-2 text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-3 lg:mb-6 shadow-sm border border-[#C5A880]/40 bg-white/60 text-[#84623F] backdrop-blur-sm">
        ✦ India's Most Trusted Vedic Astrologer
      </div>
      
      <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.15] font-semibold text-[#2D1B11] mb-4 lg:mb-6 tracking-tight">
        Accurate <em className="italic font-medium text-[#e78523]">Predictions</em> For<br />
        <em className="font-semibold italic text-[#ab6015] lg:text-5xl drop-shadow-sm">Love, Career & Wealth!</em>
      </h1>
      
      <p className="text-sm sm:text-lg text-[#5A4538] font-medium max-w-lg mx-auto lg:mx-0 mb-6 lg:mb-8 leading-relaxed px-2 lg:px-0">
        Feeling stuck in life or lost about your future? Celebrity Astrologer Surbhi Gupta's Accurate Vedic Surbhi Kundali Report reveals the answers hidden in your birth chart and exact timing for success.
      </p>

      <div className="hidden lg:block">
        <div className="flex flex-col sm:flex-row items-center justify-start gap-5">
          <a 
            href="#offer" 
            className="btn-auto-shine w-auto px-8 py-4 rounded-full font-semibold text-lg text-[#FDF7EC] shadow-[0_15px_30px_rgba(89,28,28,0.3)] hover:shadow-[0_20px_40px_rgba(89,28,28,0.5)] hover:scale-105 transition-all duration-300 border border-[#7A2A2A]"
            style={{ background: 'linear-gradient(135deg, #7A1F1F 0%, #4A0D0D 100%)' }}
          >
            Get Premium Surbhi Kundali
          </a>
          <div className="flex items-center gap-3 text-[#2D1B11] font-bold text-sm bg-white/40 px-4 py-2 rounded-xl border border-white/50 shadow-sm">
            <span className="text-2xl drop-shadow-md">🎁</span> 
            <span className="text-left leading-tight">Includes 1 Free<br/><span className="text-[#128C7E]">WhatsApp</span> Question</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12 border-t border-[#C5A880]/30 pt-8 max-w-lg mx-0">
          {[
            ["1,50,000+", "Reports Delivered"],
            ["4.9/5 ★", "Average Rating"],
            ["100% Custom", "Deep Analysis"]
          ].map(([top, bot], i) => (
            <div key={i} className="text-left">
              <div className="font-georia text-xl lg:text-xl font-bold text-[#2D1B11]">{top}</div>
              <div className="text-[10px] lg:text-xs text-[#8B6B52] font-semibold uppercase tracking-widest mt-1">{bot}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

   {/* ========================================================
    RIGHT VISUAL: YouTube Video Facade + Bottom-Left Floating Book
    ======================================================== */}
    <div className="relative flex justify-center lg:justify-end items-center h-[460px] sm:h-[540px] lg:h-[720px] mt-6 lg:mt-0 w-full z-10">
      
      {/* 1. MAIN CONTAINER WRAPPER */}
      <div className="relative w-[320px] sm:w-[420px] lg:w-[520px] aspect-[4/5]">
        
        {/* MAIN BIG YOUTUBE SHORT (Optimized Facade Pattern for PageSpeed) */}
        <div 
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_rgba(45,27,17,0.45),0_10px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 ease-out group cursor-pointer bg-[#2A0E00]"
          onClick={() => setShowVideo(true)}
        >
          {!showVideo ? (
            <>
              {/* High-Res YouTube Thumbnail (Loaded unoptimized to bypass next.config.js restrictions) */}
              <Image
                src="/thumbnail.png" 
                alt="Surbhi Gupta Astrological Insights"
                width={1280}
                height={720}
                className="object-contain object-bottom scale-[1.01] opacity-90 group-hover:opacity-100 transition-opacity"
                priority
              />
              
              {/* Premium Play Button Overlay */}
              <div className="absolute top-40 inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] group-hover:bg-white/30 group-hover:scale-110 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-300 border-2 border-white/50">
  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white translate-x-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
</div>
              </div>
            </>
          ) : (
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/OgVIfcZQ8CM?autoplay=1&rel=0&modestbranding=1&playsinline=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-[2.5rem]"
            ></iframe>
          )}

          {/* Soft internal edge lighting overlay (Remains active even over the iframe) */}
          <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-black/10 pointer-events-none mix-blend-overlay shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />
        </div>

        {/* Floating Badge (Trusted By) */}
        <div className="absolute top-4 -right-6 sm:top-8 sm:-right-8 lg:-top-5 lg:-right-6 bg-white rounded-lg lg:rounded-xl py-1.5 px-3 lg:py-2 lg:px-5 shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-1.5 lg:gap-2 border border-[#E8D8B8] z-30 animate-[float_5s_ease-in-out_infinite_0.5s] pointer-events-none">
          <div className="text-sm lg:text-xl drop-shadow-sm">⭐</div>
          <div className="text-left">
            <div className="text-[#4A2E10] text-[7px] lg:text-[10px] font-bold uppercase tracking-widest leading-none">Trusted by</div>
            <div className="text-[#2A1400] text-[10px] sm:text-xs lg:text-sm font-extrabold mt-0.5">1.5 Lakh+</div>
          </div>
        </div>

        {/* 2. FLOATING SMALL BOOK (report-book.png) - Anchored perfectly to the Bottom-Left */}
        <div className="absolute top-96 -left-12 sm:-bottom-8 sm:-left-16 lg:-bottom-12 lg:-left-24 z-20 animate-float transition-all duration-700 w-[140px] sm:w-[180px] lg:w-[200px] aspect-[1/1.4] drop-shadow-[25px_30px_50px_rgba(26,15,10,0.5)] pointer-events-none">
          <Image
            src="/report-book.png"
            alt="Floating Premium Kundali Report"
            width={280}
            height={300}
            className="w-full object-cover"
          />
        </div>

        {/* Floating "Spots Left" Notification */}
        <div className="absolute -top-6 -left-4 sm:-top-8 sm:-left-4 lg:-top-10 lg:-left-12 z-30 animate-[float_4s_ease-in-out_infinite_1s] pointer-events-none">
          <div className="bg-gradient-to-r from-[#A82020] to-[#8B1E1E] text-white text-[8px] sm:text-[10px] lg:text-xs font-bold tracking-widest px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-full shadow-[0_10px_20px_rgba(168,32,32,0.4)] border border-[#FF8080]/30 flex items-center gap-1.5 lg:gap-2 whitespace-nowrap">
            <span className="animate-pulse">🔥</span> ONLY 56 SPOTS LEFT
          </div>
        </div>
      </div>
    </div>

    {/* Mobile CTA */}
    <div className="block lg:hidden w-full pt-6 sm:pt-8 relative z-20">
      <div className="flex flex-col items-center justify-center gap-4">
        <a href="#offer" className="btn-auto-shine w-full sm:w-auto px-6 sm:px-8 py-4 rounded-full font-semibold text-base sm:text-lg text-[#FDF7EC] shadow-[0_12px_24px_rgba(89,28,28,0.4)] active:scale-95 transition-transform text-center border border-[#7A2A2A]" style={{ background: 'linear-gradient(135deg, #7A1F1F 0%, #4A0D0D 100%)' }}>
          Get Your Premium Surbhi Kundali
        </a>
      </div>
    </div>
  </div>
</section>


{/* CELEBRITY TESTIMONIALS section to the second part after hero changes after client discussions */}

<section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-[#b8560f] to-[#e8871e]">
  <StarCanvas id="proofC" style={{ opacity: .5 }} />
  {/* Hide large floating symbols on mobile to prevent overflow/distraction */}
  <div className="hidden lg:block absolute right-[-30px] top-[20%] text-[24rem] opacity-[0.025] pointer-events-none leading-none font-serif" style={{ color: C.g }}>♀</div>
  <div className="hidden lg:block absolute left-[-20px] bottom-[25%] text-[18rem] opacity-[0.025] pointer-events-none leading-none font-serif" style={{ color: C.g }}>♂</div>

  {/* Global style injection for marquee sliding tracks */}
  <style dangerouslySetInnerHTML={{ __html: `
    .hide-scroll::-webkit-scrollbar { display: none; } 
    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes infinite-slide {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-infinite-slide {
      animation: infinite-slide 35s linear infinite;
    }
    .animate-infinite-slide:hover {
      animation-play-state: paused;
    }
  ` }} />

  {/* MAIN TEXT CONTAINER */}
 <div className="reveal text-center mb-12 lg:mb-16">
  <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-medium tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-6" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>
    ✦ Real People. Real Shifts.
  </div>
  
  {/* CHANGED: leading-relaxed to leading-[1.9] for extra vertical spacing between lines */}
  <h2 className="Georgia text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-[1.9] tracking-[-0.02em]" style={{ color: C.td1 }}>
    Trusted by <em className="font-sans" >1,50,000+</em> Individuals for <br/> 
    <em className="block mt-4" style={{ fontStyle: "italic", color: C.g2 }}>Accurate Premium  Surbhi Kundali  Reports</em>
  </h2>
</div>

  {/* CELEBRITY CAROUSEL (NOW AUTO-SCROLLING MARQUEE) */}
  <div className="reveal d1 mb-16 lg:mb-[90px] relative w-full overflow-hidden">
    <div className="flex items-center gap-3 lg:gap-4 mb-10 max-w-[800px] mx-auto px-5">
      <div className="h-[1px] flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(200,168,75,0.3))" }} />
      <div className="text-[0.65rem] lg:text-[0.8rem] font-medium tracking-[0.2em] uppercase text-center whitespace-nowrap" style={{ color: C.g2 }}>Celebrity Consultations</div>
      <div className="h-[1px] flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(200,168,75,0.3))" }} />
    </div>

    {/* Side Mask Fades for the Celebrity Marquee */}
    <div className="absolute inset-y-0 left-0 w-12 sm:w-24 lg:w-40 z-30 pointer-events-none" style={{ background: `linear-gradient(90deg, #ab500f, #E85D1F), transparent)` }} />
    <div className="absolute inset-y-0 right-0 w-12 sm:w-24 lg:w-40 z-30 pointer-events-none" style={{ background: `linear-gradient(90deg, #ab500f, #E85D1F), transparent)` }} />

    {/* Continuous Sliding Track */}
    <div className="flex w-max animate-infinite-slide gap-4 lg:gap-6 px-4">
      {[
        { name: "Leading Politician", img: "/celebs/4.jpeg" },
        { name: "Leading Politician", img: "/celebs/7.jpeg" },
        { name: "Top Industrialist", img: "/celebs/6.jpeg" },
        { name: "Cricket Icon", img: "/celebs/11.png" },
        { name: "Global CEO", img: "/celebs/8.jpg" },
        { name: "Global CEO", img: "/celebs/8.png" },
        { name: "Global CEO", img: "/celebs/9.jpeg" },
        { name: "Global CEO", img: "/celebs/9.png" },
        { name: "Global CEO", img: "/celebs/10.jpg" },
        { name: "Global CEO", img: "/celebs/13.jpeg" },
        { name: "Global CEO", img: "/celebs/14.jpeg" },
        { name: "Global CEO", img: "/celebs/1.jpeg" },
        { name: "Global CEO", img: "/celebs/2.jpeg" },
        { name: "Global CEO", img: "/celebs/3.jpeg" },
        // Duplicated items array for seamless looping matching layout execution
        { name: "Leading Politician", img: "/celebs/4.jpeg" },
        { name: "Leading Politician", img: "/celebs/7.jpeg" },
        { name: "Top Industrialist", img: "/celebs/6.jpeg" },
        { name: "Cricket Icon", img: "/celebs/11.png" },
        { name: "Global CEO", img: "/celebs/8.jpg" },
        { name: "Global CEO", img: "/celebs/8.png" },
        { name: "Global CEO", img: "/celebs/9.jpeg" },
        { name: "Global CEO", img: "/celebs/9.png" },
        { name: "Global CEO", img: "/celebs/10.jpg" },
        { name: "Global CEO", img: "/celebs/13.jpeg" },
        { name: "Global CEO", img: "/celebs/14.jpeg" },
        { name: "Global CEO", img: "/celebs/1.jpeg" },
        { name: "Global CEO", img: "/celebs/2.jpeg" },
        { name: "Global CEO", img: "/celebs/3.jpeg" },
      ].map((celeb, i) => (
        <div key={i} className="relative shrink-0 w-[140px] sm:w-[180px] lg:w-[220px] aspect-[3/4] rounded-2xl lg:rounded-[24px] overflow-hidden group transition-transform duration-300 hover:-translate-y-2" style={{ border: "1px solid rgba(200,168,75,.3)", background: C.dk2, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <div className="absolute inset-0 bg-[#3D1600] flex items-center justify-center text-4xl opacity-20 z-0">👤</div>
          <Image 
            src={celeb.img} 
            alt={celeb.name} 
            quality={50}
            width={220} 
            height={293} 
            sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 220px"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 z-0"
            priority={false}
          />
          <div className="absolute inset-x-0 bottom-0 p-3 lg:p-5 z-20" style={{ background: "linear-gradient(to top, rgba(20,5,0,0.95) 0%, rgba(20,5,0,0.6) 60%, transparent 100%)" }} />
        </div>
      ))}
    </div>
  </div>
  
  {/* PRESS HEADER */}
  <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10 text-center mb-12 lg:mb-16">
  <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-medium tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-6" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>
    ✦ As Featured In
  </div>
  
  <h2 className="Georgia text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-[1.9] tracking-[-0.02em]" style={{ color: C.td1 }}>
    Making Headlines.<br />
    <em className="block mt-4" style={{ fontStyle: "italic", color: C.g2 }}>Trusted by the Press.</em>
  </h2>
</div> 

 
   <div className="relative w-full overflow-hidden pb-6 pt-2">
    <div className="absolute inset-y-0 left-0 w-8 sm:w-16 lg:w-32 z-40 pointer-events-none" style={{ background: `linear-gradient(90deg, #ab500f, #E85D1F), transparent)` }} />
    <div className="absolute inset-y-0 right-0 w-8 sm:w-16 lg:w-32 z-40 pointer-events-none" style={{ background: `linear-gradient(90deg, #ab500f, #E85D1F), transparent)` }} />

    <div className="flex w-max animate-infinite-slide gap-4 lg:gap-6 px-4">
      {[
        { id: 2, publisher: "Hindustan Times", date: "Sep 2024", img: "/news/002.jpg" },
        { id: 3, publisher: "Mid-Day", date: "Aug 2024", img: "/news/003.jpg" },
        { id: 4, publisher: "Zee News", date: "Jul 2024", img: "/news/004.jpg" },
        { id: 6, publisher: "India Today", date: "May 2024", img: "/narendra-modi.jpg" },
        { id: 9, publisher: "Firstpost", date: "Feb 2024", img: "/news/009.png" },
        { id: 22, publisher: "Hindustan Times", date: "Sep 2024", img: "/news/002.jpg" },
        { id: 23, publisher: "Mid-Day", date: "Aug 2024", img: "/news/003.jpg" },
        { id: 24, publisher: "Zee News", date: "Jul 2024", img: "/news/004.jpg" },
        { id: 26, publisher: "India Today", date: "May 2024", img: "/narendra-modi.jpg" },
        { id: 29, publisher: "Firstpost", date: "Feb 2024", img: "/news/009.png" },
      ].map((news, i) => (
        <div 
          key={news.id} 
          className="group relative shrink-0 w-[260px] sm:w-[320px] lg:w-[380px] rounded-[18px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5" 
          style={{ background: C.dk, border: "1px solid rgba(200,168,75,.15)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
        >
          <div className="relative w-full aspect-[4/3] bg-[#2A0E00] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10">📰</div>
            <Image 
              src={news.img} 
              alt={`News snippet from ${news.publisher}`} 
              width={400} 
              height={300}
              quality={50}
              sizes="(max-width: 768px) 260px, (max-width: 1200px) 320px, 380px"
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 z-10"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 z-20" style={{ background: "linear-gradient(to top, rgba(20,5,0,0.95) 0%, transparent 100%)" }} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-30 flex items-end justify-between">
            <div>
              <div className="text-[0.6rem] lg:text-[0.65rem] font-medium tracking-wider uppercase mb-1" style={{ color: C.g }}>Media Coverage</div>
              <div className="Georgia text-[1.05rem] lg:text-[1.15rem] font-medium text-white leading-tight">{news.publisher}</div>
            </div>
            <div className="text-[0.6rem] lg:text-[0.65rem] px-2 py-1 rounded border whitespace-nowrap" style={{ color: C.td4, borderColor: "rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.4)" }}>
              {news.date}
            </div>
          </div>
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C8A84B]/40 rounded-[18px] transition-colors duration-300 z-40 pointer-events-none" />
        </div>
      ))}
    </div>
  </div>
</section>
     {/* ════════════════════════════════
          WHAT CAN IT SOLVE? (Interactive 3D Hover Cards)
      ════════════════════════════════ */}
      <section className=" py-8 md:py-14  bg-[#FCF7EE]">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16 reveal">
            <h2 className="Georgia text-4xl lg:text-5xl font-medium text-[#2A1400] mb-4">What Can Premium Surbhi Kundali Solve for You?</h2>
            <p className="text-lg text-[#4A2E10] max-w-2xl mx-auto">Discover what your birth chart reveals and receive personalized guidance to make confident decisions in every area of life.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: "Struggling in Business?", desc: "Manifest Success – Amplify remedies that actually WORK for success.", img: "https://i.pinimg.com/736x/c4/cf/2b/c4cf2b4327960aa0b380fbbe43719da1.jpg" },
              { title: "Relationship Conflicts?", desc: "Peace & Harmony – Align your life with cosmic energies for stronger bonds.", img: "https://i.pinimg.com/1200x/af/be/eb/afbeebf69dd7f2c87ce1f4b34e34443f.jpg" },
              { title: "Financial Struggle?", desc: "Obstacle Removal – Align your energies for prosperity & stability.", img: "https://i.pinimg.com/736x/f2/40/ca/f240ca19fad2cf25c39ea3ca5fff74f7.jpg" },
              { title: "Health Issues?", desc: "Fix dosh – Identify planetary imbalances & remedies for well-being.", img: "https://i.pinimg.com/1200x/01/0b/31/010b3193289bf097bba2062c943734a5.jpg" },
              { title: "Kundali Matchmaking?", desc: "Beyond Compatibility – We don't just match; we provide solutions to any mismatch!", img: "https://i.pinimg.com/736x/1f/00/89/1f00892745e611a85baecaa72ae3a895.jpg" },
              { title: "Enlighten Baby Future?", desc: "Give Direction – Align your child's life towards ultimate success.", img: "https://i.pinimg.com/736x/65/90/d7/6590d77c14d037afde320222419247b6.jpg" },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`reveal d${(i % 3) + 1} group relative w-full aspect-[2/1] md:aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer bg-[#2A0E00] shadow-xl hover:shadow-[0_30px_60px_rgba(200,168,75,0.25)] transition-all duration-500 hover:-translate-y-3`}
              >
                {/* 1. Background Image with 3D Zoom Effect */}
                <Image 
  src={item.img} 
  alt={item.title} 
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  // ADD THIS:
  quality={50} 
  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" 
/>

                {/* 2. Premium Dark Gradient Overlay (Protects Text Legibility) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A00] via-[#1A0A00]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                {/* 3. Text Content Container (Positioned at Bottom) */}
                <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10 flex flex-col justify-end">
                  
                  {/* Title */}
                  <h3 className="Georgia text-2xl lg:text-3xl font-medium text-[#F5D98A] transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    {item.title}
                  </h3>
                  
                  {/* Decorative Line that expands on hover */}
                  <div className="w-10 h-1 bg-[#C8A84B] mt-4 mb-2 transition-all duration-500 ease-out group-hover:w-full opacity-50 group-hover:opacity-100 rounded-full"></div>

                  {/* Hidden Description (Slides up using CSS Grid hack for smooth auto-height animation) */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <p className="text-white/90 leading-relaxed text-sm lg:text-base pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                </div>
                
                {/* 4. Optional Top-Right Icon (Adds to the 3D interactive feel) */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 transform translate-x-4 -translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
                  ↗
                </div>

              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center reveal">
            <a href="#offer" className="btn-auto-shine inline-block bg-gradient-to-r from-[#DEB85D] to-[#EFCF7A] text-[#2A0E00] px-12 py-5 rounded-2xl font-medium text-xl shadow-[0_15px_30px_rgba(200,168,75,0.3)] hover:-translate-y-2 transition-transform duration-300">
              Fix Your Problems with Premium  Surbhi Kundali NOW!
            </a>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* ════════════════════════════════
          BEFORE VS AFTER (Interactive Image Slider)
      ════════════════════════════════ */}

    <section className=" py-8 md:py-14 bg-gradient-to-b from-[#fae8dc] to-[#e4c0c0]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5">
        <div className="text-center mb-12 reveal">
          <div className="inline-block bg-white/40 text-[#cc831c] text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6 border border-[#E2C06A]/30">
            The Transformation
          </div>
          <h2 className="Georgia text-4xl lg:text-5xl font-medium text-black/80 mb-6">
            Life Before vs  After Your <span className="italic text-[#e89b1f]">Surbhi Kundali Report</span>
          </h2>
          <p className="text-black/80 max-w-2xl mx-auto text-base sm:text-lg">
            Drag the slider to see the difference cosmic alignment makes. Don't let confusion hold you back from the life you were destined to live.
          </p>
        </div>

        <div className="reveal d2">
          <ComparisonSlider2 />
        </div>
      </div>
    </section>
  

{/* ════════════════════════════════
          FEATURED PREDICTION (Modi Section)
      ════════════════════════════════ */}
      <section className="py-8 sm:py-12 md:py-20 bg-[#FCF7EE] px-4 sm:px-5">
        <div className="max-w-[1200px] mx-auto reveal">
          
          {/* Main Container - Dark Cinematic Wrapper */}
          {/* CRITICAL CHANGE: Reduced mobile min-height drastically (from 650px to 460px) */}
          <div className="relative rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(61,22,0,0.2)] bg-[#2A0E00] border border-[#C8A84B]/20 flex flex-col md:flex-row items-center justify-center min-h-[460px] sm:min-h-[520px] md:min-h-[450px] lg:min-h-[500px]">
            
            {/* ================= BACKGROUND IMAGES & GRADIENT MASKS ================= */}
            
            {/* LEFT / TOP: PM Modi Image */}
            {/* CRITICAL CHANGE: Reduced mobile image height (h-[180px]) */}
            <div className="absolute top-0 left-0 w-full md:w-1/2 h-[180px] sm:h-[220px] md:h-full opacity-90 md:opacity-80">
              <Image 
  src="https://archive.siasat.com/wp-content/uploads/2023/07/2023_7img15_Jul_2023_PTI07_15_2023_000054B-scaled-1.jpg" 
  alt="PM Narendra Modi" 
  // 1. Using 'fill' because the parent container defines the size
  fill
  // 2. 'priority' ensures it loads immediately to improve LCP
  priority
  // 3. 'sizes' tells the browser not to download the 2000px version for mobile
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={40}
  
  // 4. Keeping your custom positioning styles
  className="object-cover object-[center_top] md:object-[right_top]"
/>
              {/* Fade to transparent on bottom (Mobile) and right (Desktop) */}
              <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-transparent to-[#2A0E00]"></div>
            </div>

            {/* RIGHT / BOTTOM: Celebrity Astrologer Surbhi Gupta Image */}
            {/* CRITICAL CHANGE: Reduced mobile image height (h-[200px]) */}
            <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-[200px] sm:h-[240px] md:h-full opacity-90 md:opacity-80">
              <Image 
  src="/surbhi-narendra.JPG" 
  alt="Celebrity Astrologer Surbhi Gupta" 
  width={400} // Based on the maximum width this image will be (on desktop)
  height={500} // Based on the standard 4/5 aspect ratio in your CSS
  priority // Crucial for faster LCP since this is a featured image
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={50}
  className="w-full h-full object-cover md:object-left object-[center_top]"
/>
              {/* Fade to transparent on top (Mobile) and left (Desktop) */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-transparent to-[#2A0E00]"></div>
            </div>

            {/* ================= CENTER: TEXT CONTENT ================= */}
            {/* CRITICAL CHANGE: Tightened padding and text sizes for mobile */}
            <div className="relative z-20 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 md:py-20 flex flex-col items-center text-center my-auto md:my-0">
              
              {/* Central Glowing Aura - Tighter spread on mobile */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[100%] md:w-[100%] md:h-[150%] bg-[#2A0E00] blur-lg md:blur-2xl rounded-full opacity-100 -z-10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] md:w-[100%] md:h-full bg-[#C8A84B] blur-[40px] md:blur-[100px] rounded-full opacity-20 md:opacity-10 -z-10"></div>

              {/* Tag / Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F5D98A]/10 border border-[#F5D98A]/30 text-[#F5D98A] text-[8px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-2 sm:mb-3 md:mb-4 shadow-[0_0_15px_rgba(245,217,138,0.1)]">
                <span>★</span> Featured Prediction
              </div>
              
              {/* Title */}
              <h2 className="Georgia text-[28px] leading-none sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#E2C06A] mb-1 sm:mb-2 drop-shadow-md uppercase tracking-wide">
                Narendra Modi
              </h2>
              
              {/* Subtitle */}
              <h3 className="text-[#E8D8B8] font-serif text-xs sm:text-sm md:text-lg lg:text-xl italic mb-3 sm:mb-4 md:mb-6 px-2">
                Prime Minister of India
              </h3>
              
              {/* Description Line */}
              <div className="w-10 sm:w-16 h-[1px] bg-[#C8A84B]/40 mb-3 sm:mb-4 md:mb-6"></div>
              
              {/* Paragraph */}
              <p className="text-white/80 text-[11px] sm:text-xs md:text-base leading-snug sm:leading-relaxed font-medium max-w-[260px] sm:max-w-[320px] md:max-w-md">
                Discover the remarkable celestial predictions that accurately foretold India's political transformation and leadership journey.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          WHO IS THIS FOR? (Split Layout with Image)
      ════════════════════════════════ */}
      <section className=" py-8 md:py-14  bg-white relative overflow-hidden">
        {/* Subtle background astrolabe */}
        <div className="absolute -right-[20%] top-[20%] text-[40rem] text-[#F5D98A] opacity-5 pointer-events-none select-none font-serif leading-none">☸</div>

        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Big Author Image */}
          <div className="reveal order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-[#E8D8B8] rounded-[2rem] transform translate-x-4 translate-y-4"></div>
            <Image 
  src="/smart-kundli.png" 
  alt="Celebrity Astrologer Surbhi Gupta" 
  width={600}           // Provide the maximum expected width
  height={750}          // Matches your aspect-[4/5] ratio
  quality={50}         // Balance quality and performance
  className="relative z-10 w-full h-auto rounded-[2rem] shadow-2xl object-cover"
  // No need for 'priority' here since it's further down the page
  sizes="(max-width: 768px) 100vw, 50vw" // Helps browser choose the right size
/>
            <div className="absolute bottom-10 left-[-20px] z-20 bg-white p-6 rounded-2xl shadow-xl border border-[#E8D8B8] reveal d3">
              <div className="Georgia text-2xl font-medium text-[#2A1400]">35+ Years</div>
              <div className="text-sm font-semibold text-[#C8A84B] uppercase tracking-wider">Mastering the Stars</div>
            </div>
          </div> 

          {/* Timeline content */}
          <div className="reveal order-1 lg:order-2">
            <h2 className="Georgia text-4xl lg:text-5xl font-medium text-[#2A1400] mb-6">Who Should Get a<br/> Premium Surbhi Kundali Report ?</h2>
            <p className="text-[#4A2E10] text-lg mb-12 leading-relaxed">
              Anyone facing a dilemma in life can have your Surbhi Kundali  guide your next steps. It helps you understand the right timing, make better decisions, and move forward with confidence.
            </p>

            <div className="relative timeline-line">
              {[
                { step: 1, title: "Students", desc: "Who want clarity on their strengths, academic path, and future career direction." },
                { step: 2, title: "Job Seekers", desc: "Who are struggling to find the right opportunity or succeed in competitive exams." },
                { step: 3, title: "Business Owners", desc: "Who are facing losses, uncertain decisions, or confusion about timing to act." },
                { step: 4, title: "Couples", desc: "Who are dealing with relationship challenges or delays in marriage." },
                { step: 5, title: "Parents", desc: "Who want clarity on their child's future, strengths, and right direction." },
              ].map((item, i) => (
                <div key={i} className="relative flex items-start gap-6 lg:gap-8 mb-8 last:mb-0 reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="relative z-10 w-12 h-12 rounded-full bg-[#C8A84B] text-white flex items-center justify-center font-medium text-xl flex-shrink-0 shadow-md">
                    {item.step}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="Georgia text-xl font-medium text-[#2A1400] mb-1">{item.title}</h3>
                    <p className="text-[#4A2E10] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 reveal">
              <a href="#offer" className="btn-auto-shine inline-block bg-gradient-to-r from-[#DEB85D] to-[#EFCF7A] text-[#2A0E00] px-10 py-4 rounded-xl font-medium text-lg shadow-[0_10px_20px_rgba(200,168,75,0.3)] hover:-translate-y-1 transition-transform">
                Order My Surbhi Kundali Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          WHAT'S INSIDE (Premium Features Grid)
      ════════════════════════════════ */}
      <section className=" py-8 md:py-14  bg-[#FCF7EE] relative overflow-hidden">
        <div className="max-w-[1300px] mx-auto px-5 relative z-10">
          
          
          <div className="text-center mb-16 reveal">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-[1px] bg-[#C8A84B]"></div>
              <span className="text-[#C8A84B] text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
                Everything Included
              </span>
              <div className="w-12 h-[1px] bg-[#C8A84B]"></div>
            </div>
            <h2 className="Georgia text-4xl lg:text-5xl font-medium text-[#2A1400]">
              What's Inside Your Premium  Surbhi Kundali
            </h2>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-2 mb-6">
            {[
              {
                badge: "CORE", badgeColor: "text-[#F5D98A] bg-[#F5D98A]/10 border-[#F5D98A]/30",
                icon: "📜",
                title: "Personality & Life Analysis",
                desc: "Discover your true nature, characteristics, strengths, and life path.",
                bg: "from-[#3A1010] to-[#1A0505]", // Deep Burgundy
                glow: "rgba(255, 100, 100, 0.15)"
              },
              {
                badge: "CORE", badgeColor: "text-[#F5D98A] bg-[#F5D98A]/10 border-[#F5D98A]/30",
                icon: "🧘‍♂️",
                title: "10-Year Predictions",
                desc: "Year-by-year guidance for your most important life events.",
                bg: "from-[#0A1A3A] to-[#050A1A]", // Deep Navy
                glow: "rgba(100, 150, 255, 0.15)"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#E2C06A] bg-[#E2C06A]/10 border-[#E2C06A]/30",
                icon: "💎",
                title: "Gemstone & Rudraksha",
                desc: "Personalized recommendations with complete wearing guidance.",
                bg: "from-[#2A2A0A] to-[#101005]", // Deep Olive Gold
                glow: "rgba(255, 215, 0, 0.15)"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#E2C06A] bg-[#E2C06A]/10 border-[#E2C06A]/30",
                icon: "💎",
                title: "Remedies & Puja Guidance",
                desc: "Practical Vedic remedies to help reduce challenges and enhance positive results.",
                bg: "from-[#2A2A0A] to-[#101005]", // Deep Olive Gold
                glow: "rgba(255, 215, 0, 0.15)"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#E2C06A] bg-[#E2C06A]/10 border-[#E2C06A]/30",
                icon: "🪔",
                title: "Marriage, Career & Wealth",
                desc: "Clear insights into relationships, success, and finances.",
                bg: "from-[#0A2A1A] to-[#05100A]", // Deep Forest
                glow: "rgba(100, 255, 150, 0.15)"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#E2C06A] bg-[#E2C06A]/10 border-[#E2C06A]/30",
                icon: "🔢",
                title: "Dosha & Yoga Analysis",
                desc: "Detailed analysis of Shani, Mangalik, Kaal Sarp, Raj Yog & more.",
                bg: "from-[#2A103A] to-[#10051A]", // Deep Indigo/Purple
                glow: "rgba(200, 100, 255, 0.15)"
              }
            ].map((card, i) => (
              <div 
                key={i} 
                className={`reveal d${(i % 6) + 1} relative rounded-3xl p-6 lg:p-5 xl:p-6 flex flex-col items-center text-center overflow-hidden border border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-300 group`}
                style={{ background: `linear-gradient(145deg, var(--tw-gradient-stops))` }}
              >
                
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-90`}></div>
                
                
                <div className={`absolute top-4 right-4 text-[9px] font-medium tracking-widest px-2 py-1 rounded-md border ${card.badgeColor} z-10`}>
                  {card.badge}
                </div>

                
                <div className="relative mt-4 mb-6 z-10">
                  <div className="absolute inset-0 rounded-full scale-150 blur-xl group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: card.glow }}></div>
                  <div className="w-14 h-14 relative flex items-center justify-center text-3xl drop-shadow-lg z-10">
                    {card.icon}
                  </div>
                  
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-white/10 rounded-full"></div>
                </div>

               
                <div className="relative z-10 mt-auto">
                  <h4 className="Georgia text-lg lg:text-base xl:text-lg font-medium text-[#E8D8B8] mb-2 leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-white/60 text-xs lg:text-[11px] xl:text-xs leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {[
              {
                badge: "BONUS", badgeColor: "text-[#D9481E] bg-[#D9481E]/10",
                icon: "📅",
                title: "Detailed Report on Every Area of Your Life",
                desc: "A complete Vedic Surbhi Kundali Report for every aspect of your life."
              },
              {
                badge: "EXCLUSIVE", badgeColor: "text-[#C8A84B] bg-[#C8A84B]/10",
                icon: "🗓️",
                title: "In-Depth Year-by-Year Analysis",
                desc: "A full decade roadmap for major decisions"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#1B4D30] bg-[#1B4D30]/10",
                icon: "📊",
                title: "Astrograph / Bhavbhal Chart",
                desc: "Personalized astrograph & horoscope analysis"
              },
              {
                badge: "FREE", badgeColor: "text-[#8B1E1E] bg-[#8B1E1E]/10",
                icon: "👥",
                title: "Free 1 personalised question on whatsapp",
                desc: "Surbhi gupta personally gives answers on WhatsApp"
              }
            ].map((card, i) => (
              <div 
                key={i} 
                className={`reveal d${(i % 4) + 1} bg-white rounded-2xl p-5 border border-[#E8D8B8] shadow-[0_5px_15px_rgba(61,22,0,0.03)] hover:shadow-[0_10px_25px_rgba(61,22,0,0.08)] transition-all duration-300 flex flex-col`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl bg-[#FCF7EE] w-10 h-10 rounded-lg flex items-center justify-center border border-[#E8D8B8]/50 shadow-sm shrink-0">
                    {card.icon}
                  </div>
                  <div className={`text-[9px] font-medium tracking-widest px-2 py-1 rounded-md ${card.badgeColor}`}>
                    {card.badge}
                  </div>
                </div>
                
                <h4 className="Georgia text-[#3D1600] font-medium text-[15px] mb-1.5 leading-tight">
                  {card.title}
                </h4>
                <p className="text-[#6B4423] text-xs leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════
          INSIDE THE REPORT (Dark Cinematic)
      ════════════════════════════════ */}
      {/* ════════════════════════════════
          INSIDE THE REPORT (Cinematic Cosmic Layout)
      ════════════════════════════════ */}
     <section className="py-8 sm:py-12 md:py-14 relative overflow-hidden" style={{ background: "linear-gradient(90deg, #ab500f, #E85D1F)" }}>
        
        {/* Cinematic Ambient Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(200,168,75,0.15)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,30,30,0.1)_0%,transparent_50%)] pointer-events-none" />
        {/* Starry noise overlay */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-screen pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        
        {/* Reduced gap on mobile (gap-8 instead of gap-12) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 relative z-10 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* ================= LEFT: TEXT & FEATURES ================= */}
          <div className="reveal mt-2 sm:mt-0 text-center sm:text-left">
            
            <div className="inline-block bg-[#C8A84B]/10 text-[#F5D98A] text-[9px] sm:text-xs font-medium tracking-[0.2em] uppercase px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 border border-[#C8A84B]/20">
              Deep Vedic Analysis
            </div>
            
            {/* Cinematic Gradient Title */}
            <h2 className="Georgia text-[2.2rem] leading-tight sm:text-5xl lg:text-6xl font-medium mb-4 sm:mb-6 bg-gradient-to-br from-white via-[#F5D98A] to-[#C8A84B] bg-clip-text text-transparent drop-shadow-sm">
              Get Your Premium <br className="hidden sm:block"/> Surbhi Kundali Report 
            </h2>
            
            {/* Tightened margin (mb-6 on mobile, mb-10 on sm) */}
          
            <p className="text-[#ffffff] font-light text-sm sm:text-lg mb-6 sm:mb-10 leading-relaxed max-w-lg mx-auto sm:mx-0">
              Get a detailed analysis of your birth chart quickly and accurately.

Our Premium Surbhi Kundali Report helps you understand your planetary positions, key life challenges, and practical solutions in a simple and easy-to-understand way. Check your Surbhi Kundali  online and gain valuable insights into your career, relationships, health, and future.
            </p>
            
            {/* Upgraded Glassmorphism Feature Grid - Tightened gaps for mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-10 text-left">
              {[
                { icon: "🕉️", text: "Special Mantras & Vedic Chants" },
                { icon: "💎", text: "Specialized Gem Suggestions" },
                { icon: "✨", text: "Manifestation + Astrology" },
                { icon: "📖", text: "Laal Kitab & Nakshatra Guidance" },
              ].map((f, i) => (
                <div key={i} className="reveal d2 group glass-card flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#C8A84B]/40 transition-all duration-500 shadow-lg">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#3D1600] to-[#1A0A00] border border-[#C8A84B]/30 flex items-center justify-center text-base sm:text-xl shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-white/90 group-hover:text-white transition-colors">{f.text}</div>
                </div>
              ))}
            </div>

            {/* Pricing & CTA */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-8 reveal d3">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-medium mb-0.5 sm:mb-1">Total Value</span>
                <div className="font-sans text-3xl sm:text-4xl lg:text-5xl font-medium text-white flex items-center gap-3">
                  ₹999 <del className="text-lg sm:text-xl lg:text-2xl text-white/30 font-sans font-medium">₹2999</del>
                </div>
              </div>
              
              <a href="#offer" className="btn-auto-shine block w-full sm:w-auto bg-gradient-to-r from-[#DEB85D] to-[#EFCF7A] text-[#2A0E00] px-8 sm:px-10 py-3.5 sm:py-5 rounded-full sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-[0_0_40px_rgba(239,207,122,0.4)] hover:-translate-y-1 transition-all text-center">
                Get My Surbhi Kundali Now
              </a>
            </div>
          </div>

          {/* ================= RIGHT: CINEMATIC SOLAR SYSTEM ================= */}
          {/* Adjusted height for mobile to keep it compact */}
          <div className="reveal d2 relative h-[380px] sm:h-[500px] lg:h-[600px] w-full flex items-center justify-center overflow-hidden lg:overflow-visible mt-2 sm:mt-10 lg:mt-0">
            
            {/* The Cinematic Core Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] bg-[#C8A84B] rounded-full blur-[80px] sm:blur-[100px] opacity-40 animate-pulse"></div>

            {/* Concentric Orbital Rings (Scaled down slightly for mobile) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[350px] aspect-square border border-[#C8A84B]/30 rounded-full shadow-[0_0_30px_rgba(200,168,75,0.1)_inset]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] aspect-square border border-dashed border-white/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] sm:w-[700px] aspect-square border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
            
            {/* Luminous Planets on Rings */}
            <div className="absolute inset-0 animate-[spin_40s_linear_infinite] pointer-events-none">
               <div className="absolute top-[12%] right-[20%] sm:right-[30%] w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-900 to-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.7)]" />
               <div className="absolute bottom-[15%] left-[15%] sm:left-[25%] w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-red-900 to-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.7)]" />
            </div>
            <div className="absolute inset-0 animate-[spin_80s_linear_infinite_reverse] pointer-events-none">
               <div className="absolute top-[35%] sm:top-[40%] right-[2%] sm:right-[10%] w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-yellow-700 to-yellow-200 shadow-[0_0_15px_rgba(253,224,71,0.6)]" />
            </div>

            {/* Floating Book in Center - SIGNIFICANTLY BIGGER ON MOBILE (200px vs old 160px) */}
            <div className="w-[200px] sm:w-[220px] lg:w-[350px] aspect-[1/1.4]  rounded-xl rounded-r-2xl  z-20 flex flex-col items-center justify-center relative animate-float">
               
               {/* Assuming reportImgError and setReportImgError are defined in your component state */}
               {!reportImgError ? (
                 <div className="w-[140px] md:w-[250px] lg:w-[350px] aspect-[1/1.4] overflow-hidden rounded-xl rounded-r-2xl">
                  <video 
                  src="/gif.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className= "w-full h-full object-cover"
                  />
                 </div>

               ) : (
                 <div className="absolute inset-1 border-2 border-[#C8A84B] flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#FCF7EE] to-[#E8D8B8] rounded-lg rounded-r-xl">
                   <div className="Georgia text-[#3D1600] font-medium text-xs sm:text-sm tracking-widest mb-1">PREMIUM</div>
                   <div className="Georgia text-[#8B1E1E] font-medium text-2xl sm:text-3xl mb-6">Surbhi KUNDALI</div>
                   <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#C8A84B] flex items-center justify-center text-2xl bg-white shadow-inner">👁️</div>
                 </div>
               )}

            </div>
          </div>
        </div>
      </section>

{/* ════════════════════════════════
          PREMIUM BABY REPORT SECTION
      ════════════════════════════════ */}
      <section className="py-8 md:py-14 bg-[#FCF7EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5">
          <div className="reveal bg-white rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(61,22,0,0.06)] border border-[#E8D8B8] flex flex-col lg:flex-row hover:shadow-[0_25px_60px_rgba(61,22,0,0.1)] transition-shadow duration-500">
            
            {/* Image Side */}
            <div className="w-full lg:w-1/2 relative min-h-[300px] sm:min-h-[400px] lg:min-h-full">
              {/* Fade gradient to blend the image smoothly into the white text area */}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-white/20 to-transparent z-10"></div>
              <Image 
                src="https://i.pinimg.com/736x/65/90/d7/6590d77c14d037afde320222419247b6.jpg" 
                alt="Premium Baby Naming & Future Report"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {/* Premium Floating Badge overlay */}
              <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-sm border border-[#C8A84B]/40 px-4 py-2 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center gap-2">
                 <span className="text-xl">👶</span>
                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#4A2E10]">For Newborns & Kids</span>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-14 xl:p-16 relative z-20 flex flex-col justify-center bg-white">
              <div className="inline-block w-fit bg-[#F5D98A]/20 text-[#84623F] text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-md mb-5 border border-[#C8A84B]/30">
                New Arrival Special
              </div>
              
              <h2 className="Georgia text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.2] font-medium text-[#2A1400] mb-5 tracking-tight">
                Secure Your Child's <br />
                <em className="text-[#C8A84B] italic">Cosmic Destiny.</em>
              </h2>
              
              <p className="text-[#6B4423] text-sm sm:text-base leading-relaxed mb-8">
                Every child is born with a unique cosmic blueprint. Our expert Vedic astrologers deeply analyze your baby's birth chart to provide auspicious Nakshatra-based naming syllables, predict core strengths, and offer lifelong remedies for health, intelligence, and prosperity.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  { icon: "✨", text: "Auspicious Initial Letters (Nakshatra based)" },
                  { icon: "🧠", text: "Intelligence, Education & Career Yogas" },
                  { icon: "🛡️", text: "Health Predictions & Lifelong Remedies" },
                  { icon: "💬", text: "Includes 1 Free WhatsApp Question for Parents" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#FCF7EE] border border-[#E8D8B8] flex items-center justify-center text-sm shrink-0 shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-[#4A2E10] font-medium text-sm sm:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* Action Area */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-[#E8D8B8]/50">
                <a 
                  href="https://kundalireport.surabhiastrology.com/checkout?service=Baby%20Name%20Report&plan=Baby%20Report%20(%E2%82%B91,100)" 
                  className="btn-auto-shine w-full sm:w-auto bg-gradient-to-r from-[#2A0E00] to-[#4A2E10] text-[#FDF7EC] px-8 py-4 rounded-xl font-medium text-center shadow-[0_10px_20px_rgba(42,14,0,0.2)] hover:shadow-[0_15px_30px_rgba(42,14,0,0.3)] hover:-translate-y-1 transition-all duration-300"
                >
                  Get My Baby Report →
                </a>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-[#8B6B52] text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Starting At</span>
                  <div className="flex items-baseline text-[#2A1400]">
                    <span className="text-lg font-bold mr-0.5 text-[#C8A84B]">₹</span>
                    <span className="Georgia text-2xl lg:text-3xl font-bold leading-none">999 <del className="font-sans text-[#8B6B52] text-2xl">2,999</del> </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      
      {/* ════════════════════════════════
          AUTHORITY (Acharya Style)
      ════════════════════════════════ */}
      <section className="py-8 md:py-14 bg-[#FCF7EE]">
        <div className="max-w-full mx-auto px-4 sm:px-0">
          {/* Changed to flex-col-reverse for mobile so the image shows at the top, switches to grid on desktop */}
          <div className="bg-[#F5D98A] overflow-hidden shadow-2xl flex flex-col-reverse lg:grid lg:grid-cols-2">
            
            {/* Text Side */}
            <div className="p-6 sm:p-10 lg:p-16 flex flex-col justify-center">
              <h2 className="Georgia text-2xl sm:text-3xl lg:text-4xl font-medium text-[#2A1400] mb-1.5 lg:mb-2">Trust the Best —</h2>
              <div className="bg-white inline-block px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6 rounded-md lg:rounded-none w-fit">
                <h3 className="Georgia text-xl sm:text-2xl lg:text-3xl font-medium text-[#8B1E1E] italic">Celebrity Astrologer Surbhi Gupta!</h3>
              </div>
              <p className="text-[#4A2E10] mb-5 lg:mb-8 leading-snug lg:leading-relaxed text-sm sm:text-base lg:text-lg">
                Celebrity Astrologer Surbhi Gupta, proudly recognized as the Pride of Bharat, is one of India’s most trusted astrology experts. She specializes in Astrology, Vastu, and Numerology, helping people find clarity and practical guidance for life’s challenges. Her accurate insights and personalized consultations have earned the trust of celebrities, business leaders, and thousands of satisfied clients across India.
              </p>
              <p className="text-[#2A1400] font-medium italic text-base sm:text-lg lg:text-xl mb-6 lg:mb-10">
                Your destiny is precious. Don't leave it to guesswork.
              </p>

              {/* Stats Row - Compact for Mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {[
                  { i: "✡", t: "35+ Years in Occult Science" },
                  { i: "👥", t: "Trusted by 1,50,000+ Worldwide" },
                  { i: "📖", t: "Author & Thought Leader" },
                  { i: "🎯", t: "Solution Driven Approach" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-2.5 sm:p-3 lg:p-4 rounded-xl text-center shadow-sm hover:-translate-y-1 transition-transform flex flex-col items-center justify-center">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#3D1600] text-[#E2C06A] rounded-lg flex items-center justify-center text-lg lg:text-xl mb-1.5 lg:mb-3">
                      {stat.i}
                    </div>
                    <div className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-[#4A2E10] leading-tight">
                      {stat.t}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Side */}
            <div className="bg-[#E8D8B8] relative min-h-[400px] sm:min-h-[400px] w-full">
               <Image 
  src="/surbhi-gupta-new.JPG" 
  alt="Celebrity Astrologer Surbhi Gupta" 
  fill 
  loading="eager" // Tells the browser to download this sooner than a standard lazy image
  placeholder="blur" // Instant visual feedback
  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAYAAABirU39AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNgYGBoYmBgSGRgYChmYGBoYmBgSGVgYChmYGBoYmBgSGRgYChmYGBoYmBgAAYBAf7p9jEAAAAASUVORK5CYII=" 
  sizes="(max-width: 1024px) 100vw, 50vw" 
  className="object-cover object-[center_top] lg:object-center" 
/>

{/* svg */}


               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#F5D98A] to-transparent h-24 lg:h-32 flex items-end justify-center pb-4 lg:pb-6">
                 {/* Hidden on mobile to save space since it's already in the text box below it */}
                 <h3 className="hidden lg:block Georgia text-3xl font-medium text-[#2A1400] drop-shadow-md italic">
                   Celebrity Astrologer Surbhi Gupta!
                 </h3>
               </div>
            </div>
            
          </div>

          {/* Full width button on mobile */}
          <div className="mt-8 lg:mt-12 text-center reveal">
             <a href="#offer" className="btn-auto-shine block w-full sm:inline-block sm:w-auto bg-gradient-to-br from-[#200404] via-[#3d0808] to-[#200404] text-white px-6 py-4 lg:px-12 lg:py-5 rounded-xl lg:rounded-2xl font-medium text-base sm:text-lg lg:text-xl shadow-xl hover:scale-105 transition-transform">
                Get Your Report From the Best!
             </a>
          </div>
        </div>
      </section>



      {/* ════════════════════════════════
          TESTIMONIALS (Real Transformations)
      ════════════════════════════════ */}
      <TestimonialsSection />

     
      {/* ════════════════════════════════
          OFFER & CTA (Elegant Compact Design)
      ════════════════════════════════ */}
      <section id="offer" className="py-20 px-4 bg-[#FCF7EE]">
        <div className="max-w-[850px] mx-auto reveal">
          
          <div className="relative bg-gradient-to-br from-[#200404] via-[#3d0808] to-[#200404] rounded-3xl p-8 sm:p-12 shadow-[0_20px_40px_rgba(61,22,0,0.15)] overflow-hidden border-2 border-[#E8D8B8]"
               >
            
            {/* Corner ribbon (Matching inspiration) */}
            <div className="absolute top-6 -right-10 bg-[#D9481E] text-white text-[10px] font-medium py-1.5 px-12 rotate-45 shadow-lg tracking-widest uppercase">
              OFFER
            </div>

            {/* Headers */}
            <div className="text-center mb-8">
              <div className="text-[#E8D8B8] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Premium Surbhi Kundali
              </div>
              <h2 className="Georgia text-3xl sm:text-4xl font-medium text-white">
                Your Complete Life Blueprint
              </h2>
            </div>

            {/* Two-Column Layout for Desktop (Compact!) */}
            <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
              
              {/* Left Column: Features */}
              <div className="space-y-4">
                {[
                  "10-Year Detailed Prediction Report",
                  "Complete Horoscope Analysis",
                  "Shani Sade Sati, Mangalik & Kaal Sarp Analysis",
                  "Personalized in depth Gemstone & Rudraksha Guide",
                  "Customized Vedic Remedies",
                  "Dasha & Life Cycle Analysis",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3 text-white/90 font-medium text-sm sm:text-base">
                    <div className="w-5 h-5 rounded-full bg-[#E2C06A] text-[#2A0E00] flex items-center justify-center text-xs flex-shrink-0 shadow-md mt-0.5">✓</div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Right Column: Pricing & CTA */}
              <div className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                
                {/* Price */}
                <div className="flex flex-col items-center mb-6">
                  <span className="text-white/50 line-through text-xl font-medium mb-1">₹2,999</span>
                  <div className="flex items-start">
                    <span className="text-[#E2C06A] text-2xl font-medium mt-1 mr-1">₹</span>
                    <span className="text-[#E2C06A] font-sans text-6xl font-medium leading-none tracking-tight">999</span>
                  </div>
                  <div className="bg-[#1B4D30]/80 border border-[#4ADE80]/30 text-[#A0F0C8] text-xs font-medium px-3 py-1 rounded-full mt-3">
                    You save ₹2,000 — Today Only!
                  </div>
                </div>

                {/* WhatsApp Bonus Box */}
                <div className="w-full bg-[#0D2614]/80 border border-[#1B4D30] rounded-xl p-3 mb-6 flex items-center justify-center gap-2 text-center">
                  <span className="text-xl shrink-0">💬</span>
                  <div className="text-[#4ADE80] font-medium text-xs sm:text-sm">
                    FREE: 1 Personal WhatsApp Q&A
                  </div>
                </div>

                {/* CTA Button */}
                <a href="https://kundalireport.surabhiastrology.com/checkout?service=Surbhi%20Kundali&plan=10-Yr%20Report%20%2B%201Question%20(%E2%82%B9999)" className="btn-auto-shine block w-full bg-gradient-to-r from-[#D9481E] to-[#A32A0C] text-white py-4 rounded-xl font-medium text-center text-lg shadow-[0_10px_20px_rgba(217,72,30,0.3)] hover:-translate-y-0.5 transition-transform duration-300">
                  BUY NOW →
                </a>

              </div>
            </div>

            {/* Footer: Trust & Timer */}
            <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 sm:gap-6 text-xs text-white/50 font-medium">
                <span className="flex items-center gap-1.5"><span className="text-[#E2C06A]">🔒</span> Secure</span>
                <span className="flex items-center gap-1.5"><span className="text-[#E2C06A]">⏱</span> 48hr</span>
                <span className="flex items-center gap-1.5"><span className="text-[#4ADE80]">✅</span> Guarantee</span>
              </div>

              <div className="flex items-center gap-2 text-white/60 text-sm font-medium bg-black/20 px-4 py-2 rounded-full border border-white/5">
                <span>⏳ Expires in:</span>
                <div className="text-[#E2C06A] font-medium tracking-widest">
                  {String(time?.h || 23).padStart(2, '0')}:{String(time?.m || 38).padStart(2, '0')}:{String(time?.s || 5).padStart(2, '0')}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          STICKY BOTTOM BAR
      ════════════════════════════════ */}
      <div className={`fixed bottom-0 left-0 right-0 z-[200] transition-transform duration-500 ${stickyVisible ? "translate-y-0" : "translate-y-full"}`}>
  <div className="ann-bar-shimmer flex items-center justify-between px-3 py-2.5 sm:px-8 sm:py-4 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"
       style={{ background: C.red, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
    
    {/* Left Side: Product Name & Bonus */}
    <div className="flex flex-col justify-center min-w-0 pr-2">
      <div className="font-semibold text-[13px] sm:text-lg text-white leading-tight truncate">
        Premium  Surbhi Kundali <span className="hidden sm:inline">Report</span>
      </div>
      <div className="text-[10px] sm:text-sm text-[#F5D98A] font-medium leading-tight mt-0.5 truncate">
        🎁 <span className="hidden sm:inline">+ 1 Free WhatsApp Question</span><span className="sm:hidden">Free WA Question</span>
      </div>
    </div>
    
    {/* Right Side: Price & CTA Button */}
    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
      
      {/* Price Section: Stacked for compact mobile view */}
      <div className="flex flex-col items-end justify-center pt-0.5">
        <del className="text-white/60 text-[10px] sm:text-sm font-sans font-medium leading-none mb-1 decoration-[#EFCF7A]">
          ₹2999
        </del>
        <div className="text-white font-sans text-[18px] sm:text-2xl font-bold leading-none">
          ₹999
        </div>
      </div>

      {/* Action Button */}
      <a href="#offer" className="flex items-center justify-center bg-gradient-to-r from-[#DEB85D] to-[#EFCF7A] text-[#2A0E00] px-5 py-2 sm:px-8 sm:py-3 rounded-full font-bold text-[13px] sm:text-base shadow-lg whitespace-nowrap btn-auto-shine hover:scale-105 active:scale-95 transition-transform">
        Get Now
      </a>
      
    </div>
  </div>
</div>

    </>
  );
}