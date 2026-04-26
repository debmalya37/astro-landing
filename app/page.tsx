"use client";
import dynamic from 'next/dynamic';

import ComparisonSlider2 from "@/components/Comparisonslider2";
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
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Outfit:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Outfit', sans-serif; background: ${C.iv}; color: ${C.t1}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

    .fraunces { font-family: 'Fraunces', serif; }
    
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


// Make sure to add the 'Fraunces' font family in your tailwind config or global CSS.
const CelebrityEndorsementSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-14" 
               style={{ background: `linear-gradient(135deg, #fdf3da 0%, #fce8c0 40%, #f9d89a 100%)` }}>
        
        {/* Interactive 3D Cosmic Earth */}
        {/* <CosmicEarthBackground /> */}

        <div className="max-w-7xl mx-auto px-5 w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <div className="text-center lg:text-left">
            <div className="reveal inline-flex items-center gap-2 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6" 
                 style={{ color: C.t1, background: "rgba(255,255,255,0.3)", border: `1px solid rgba(42,14,0,0.2)` }}>
              ✦ India's Most Trusted Vedic Astrologer
            </div>
            
            <h1 className="reveal d1 fraunces text-4xl sm:text-5xl lg:text-6xl leading-[1.1] font-medium text-[#2A0E00] mb-6">
              Accurate Predictions For <br />
              <em className="font-light italic text-[#4A2E10]">Love, Career & Wealth!</em>
            </h1>
            
            <p className="reveal d2 text-base sm:text-lg text-[#3D1600] font-medium max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Feeling stuck in life or lost about your future? celebrity astrologer Surbhi Gupta's Accurate Vedic Kundli Report reveals the answers hidden in your birth chart and exact timing for success.
            </p>

            <div className="reveal d3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href="#offer" className="btn-auto-shine w-full sm:w-auto px-8 py-4 rounded-full font-medium text-lg text-white shadow-[0_15px_30px_rgba(42,14,0,0.3)] hover:scale-105 transition-transform"
                 style={{ background: C.dk2 }}>
                Get Your Personalized Kundali
              </a>
              <div className="flex items-center gap-3 text-[#2A0E00] font-semibold text-sm">
                <span className="text-2xl">🎁</span> 
                <span className="text-left leading-tight">Includes 1 Free<br/>WhatsApp Question</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="reveal d4 grid grid-cols-3 gap-4 mt-12 border-t border-[#4A2E10]/20 pt-8 max-w-lg mx-auto lg:mx-0">
              {[
                ["10 Lakh+", "Reports Delivered"],
                ["4.9/5 ★", "Average Rating"],
                ["Personalized", "Deep Analysis"]
              ].map(([top, bot], i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="fraunces text-xl lg:text-2xl font-medium text-[#2A0E00]">{top}</div>
                  <div className="text-[10px] sm:text-xs text-[#4A2E10] uppercase tracking-widest mt-1">{bot}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              RIGHT VISUAL: Cosmic Wheel + Portrait + Floating Book 
              ======================================================== */}
          <div className="reveal d2 relative flex justify-center lg:justify-end items-center h-[550px] lg:h-[700px] mt-12 lg:mt-0 w-full overflow-hidden lg:overflow-visible perspective-1000">
            
            {/* 1. BACKGROUND: Massive Cosmic Wheel (Half off-screen to the right, DARK CORE / BRIGHTER EDGES) */}
            <div className="absolute right-[-35%] lg:right-[-25%] top-1/2 -translate-y-1/2 w-[450px] sm:w-[550px] lg:w-[750px] aspect-square z-0 pointer-events-none opacity-90 lg:opacity-100">
              <svg className="w-full h-full drop-shadow-[0_0_40px_rgba(200,168,75,0.2)] animate-[spin_120s_linear_infinite]" viewBox="0 0 460 460" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Updated Gradient: Darkest in center, richer/brighter at edges */}
                  <radialGradient id="wbg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1A0500" stopOpacity="0.8"/>
                    <stop offset="70%" stopColor="#3D1600" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#521F00" stopOpacity="0.4"/>
                  </radialGradient>
                </defs>
                <circle cx="230" cy="230" r="220" fill="url(#wbg)" stroke="rgba(200,168,75,0.6)" strokeWidth="1.5"/>
                
                {/* Outer Ring with Zodiac Fills (Brightened for visibility against dark edge) */}
                <g className="wheel-outer-ring">
                  <circle cx="230" cy="230" r="215" fill="none" stroke="rgba(200,168,75,0.3)" strokeWidth="0.5" strokeDasharray="4 8"/>
                  <g fill="rgba(226,192,106,0.9)" fontSize="16" fontFamily="serif" textAnchor="middle">
                    <text x="230" y="26">♈</text><text x="320" y="49">♉</text>
                    <text x="390" y="119">♊</text><text x="415" y="214">♋</text>
                    <text x="390" y="304">♌</text><text x="320" y="374">♍</text>
                    <text x="230" y="439">♎</text><text x="140" y="414">♏</text>
                    <text x="65"  y="349">♐</text><text x="32"  y="259">♑</text>
                    <text x="58"  y="164">♒</text><text x="128" y="86">♓</text>
                  </g>
                </g>
                
                {/* Inner Rings (Lighter to pop against dark center) */}
                <circle cx="230" cy="230" r="185" fill="none" stroke="rgba(200,168,75,0.2)" strokeWidth="1"/>
                <circle cx="230" cy="230" r="155" fill="none" stroke="rgba(200,168,75,0.15)" strokeWidth="0.5"/>
                
                {/* Connecting Lines */}
                <g stroke="rgba(200,168,75,0.2)" strokeWidth="1">
                  <line x1="230" y1="45" x2="230" y2="415"/>
                  <line x1="45"  y1="230" x2="415" y2="230"/>
                  <line x1="90"  y1="90"  x2="370" y2="370"/>
                  <line x1="370" y1="90"  x2="90"  y2="370"/>
                </g>
              </svg>
            </div>

            {/* 2. CENTER: celebrity astrologer Surbhi Gupta Portrait (Shifted rightish) */}
            <div className="relative z-10 w-[240px] sm:w-[300px] lg:w-[360px] lg:mr-[0%]">
              <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden border-[4px] border-[#C8A84B]/40 shadow-[0_25px_60px_rgba(42,14,0,0.6)] bg-[#2A0E00]">
                {/* Fallback color while image loads */}
                <div className="absolute inset-0 bg-[#E8D8B8]"></div> 
                <Image 
  src="/surbhi-gupta-portrait.JPG" 
  alt="Celebrity Astrologer Surbhi Gupta" 
  width={360}
  height={450}
  priority // Tells Next.js to preload this
  fetchPriority="high" // New browser standard to force immediate download
  placeholder="blur" // Shows a blurry version while the high-res one loads
  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAFCAYAAABirU39AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNgYGBoYmBgSGRgYChmYGBoYmBgSGVgYChmYGBoYmBgSGRgYChmYGBoYmBgAAYBAf7p9jEAAAAASUVORK5CYII=" 
  className="absolute inset-0 w-full h-full object-cover z-10"
/>
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#1A0A00] to-transparent z-20"></div>
                <div className="absolute bottom-5 inset-x-0 text-center z-30">
                  <div className="text-[#F5D98A] font-bold text-xl lg:text-2xl drop-shadow-lg">celebrity astrologer Surbhi Gupta</div>
                  <div className="text-white/80 text-[10px] lg:text-xs uppercase tracking-widest font-bold mt-1">Vedic Astrologer</div>
                </div>
              </div>

              {/* Floating Badge (Attached to Portrait) */}
              <div className="absolute -top-5 right-4 lg:-right-6 bg-white rounded-xl py-2 px-4 lg:px-5 shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex items-center gap-2 border border-[#E8D8B8] z-30 animate-[float_5s_ease-in-out_infinite_0.5s]">
                <div className="text-base lg:text-xl drop-shadow-sm">⭐</div>
                <div className="text-left">
                  <div className="text-[#4A2E10] text-[9px] lg:text-[10px] font-bold uppercase tracking-widest leading-none">Trusted by</div>
                  <div className="text-[#2A1400] text-xs lg:text-sm font-extrabold mt-0.5">1.5 Lakh+</div>
                </div>
              </div>
              
              {/* 🔥 Floating "Spots Left" Notification */}
              <div className="absolute -top-10 left-0 lg:-left-12 z-30 animate-[float_4s_ease-in-out_infinite_1s]">
                <div className="bg-gradient-to-r from-[#A82020] to-[#8B1E1E] text-white text-[10px] lg:text-xs font-bold tracking-widest px-4 py-2 lg:px-5 lg:py-2.5 rounded-full shadow-[0_10px_20px_rgba(168,32,32,0.4)] border border-[#FF8080]/30 flex items-center gap-2">
                  <span className="animate-pulse">🔥</span> ONLY 17 SPOTS LEFT
                </div>
              </div>

              {/* 3. FOREGROUND: Floating Premium Book */}
              <div className="absolute -bottom-8 -left-12 sm:-left-20 lg:-left-24 z-40 animate-float transform -rotate-6 hover:rotate-0 transition-transform duration-700">
                
                <div className="w-[160px] sm:w-[200px] lg:w-[220px] aspect-[1/1.6] rounded-xl rounded-l-md shadow-[10px_25px_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden border-r-[2px] border-y border-[#D8C49A]/30 border-l-[6px] border-l-[#1A0505]"
                     style={{ background: 'linear-gradient(160deg, #4A0E1A 0%, #1A0505 100%)' }}>
                  
                  {/* Book Spine Highlight/Crease */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-transparent via-white/10 to-transparent mix-blend-overlay"></div>
                  
                  {/* Top Text Section */}
                  <div className="p-4 pt-5 lg:p-5 lg:pt-6 text-center z-10 relative">
                    <div className="text-[#C8A84B] text-[7px] lg:text-[8px] font-bold tracking-[0.2em] uppercase mb-2">
                      Premium<br/>Personalized
                    </div>
                    <h3 className="fraunces text-xl lg:text-2xl font-bold text-white leading-tight">
                      Kundali <br/><span className="text-[#E2C06A]">Report</span>
                    </h3>
                  </div>

                  {/* Center 3D Icon Area */}
                  <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="absolute w-12 h-12 lg:w-16 lg:h-16 bg-[#7B42F6] rounded-full blur-2xl opacity-40"></div>
                    <div className="relative w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-[#8B5CF6] to-[#5B21B6] transform rotate-45 rounded-xl shadow-[inset_0_4px_10px_rgba(255,255,255,0.4),0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center border border-[#A78BFA]/50">
                      <div className="transform -rotate-45 text-white/90 text-lg lg:text-xl font-light">✡</div>
                    </div>
                  </div>

                  {/* Bottom Pricing Section */}
                  <div className="p-4 pb-5 lg:p-5 lg:pb-6 text-center z-10 relative">
                    <div className="text-white/40 line-through text-[9px] lg:text-[10px] font-medium mb-0.5">₹2,999</div>
                    <div className="flex items-center justify-center">
                      <span className="text-[#E2C06A] text-xs lg:text-sm font-bold mr-0.5">₹</span>
                      <span className="text-[#E2C06A] fraunces text-xl lg:text-2xl font-bold tracking-tight">999</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
  );
};

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
function ComparisonSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);


  const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as MouseEvent).clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={sliderRef}
      className="relative w-full h-[500px] lg:h-[650px] rounded-3xl overflow-hidden shadow-2xl select-none"
      onMouseDown={(e) => { setIsDragging(true); handleMove(e); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e); }}
      style={{ '--pos': `${sliderPos}%` } as React.CSSProperties}
    >
      {/* AFTER IMAGE (Background) */}
      <div className="absolute inset-0 bg-[#0A1A10]">
        <Image 
  src="/after-bg.jpg" 
  alt="Life state after Kundali report" 
  // 1. 'fill' is best for background images where you want to cover the container
  fill
  // 2. Add 'sizes' so Next.js doesn't serve a massive desktop image to mobile users
  sizes="(max-width: 768px) 100vw, 50vw"
  // 3. Keep all your cinematic overlay effects
  className="object-cover opacity-40 mix-blend-overlay"
  // 4. Leave as default (lazy load) so it doesn't slow down the critical path
/>
        <div className="absolute inset-0 flex items-center justify-end p-8 lg:p-16">
          <div className="text-right max-w-sm ml-auto z-10 pl-12">
            <h3 className="fraunces text-3xl lg:text-4xl font-medium text-[#A0F0C8] mb-6">AFTER Smart Kundli</h3>
            <ul className="space-y-5">
              {[
                { t: "Crystal Clarity", d: "Understand exactly WHY things happen" },
                { t: "Wealth Aligned", d: "Know your lucky periods and remedies" },
                { t: "Love Restored", d: "Compatibility insights & planetary fixes" },
                { t: "Career Breakthrough", d: "Know exactly WHEN your promotion arrives" },
              ].map((l, i) => (
                <li key={i} className="flex flex-col items-end border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3"><h4 className="text-white font-medium text-lg">{l.t}</h4><span className="text-xl">✨</span></div>
                  <p className="text-white/70 text-sm mt-1">{l.d}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* Main Visual Right */}
          <div className="absolute right-[5%] bottom-[5%] lg:right-[15%] w-[40%] lg:w-[35%] opacity-80 pointer-events-none">
             <Image 
  src="/happy-person-planet.png" 
  alt="Happy state after Kundali report" 
  // 1. Set explicit width and height to fix the PageInsight diagnostic
  width={500} 
  height={500}
  // 2. Add 'sizes' so mobile users get a lightweight version
  sizes="(max-width: 768px) 40vw, 35vw"
  // 3. Keep your existing animation and styling
  className="w-full h-auto object-contain animate-float" 
  // 4. Leave as default (lazy load) so it doesn't slow down the Hero load
/>
          </div>
        </div>
      </div>

      {/* BEFORE IMAGE (Clipped Foreground) */}
      <div className="absolute inset-0 bg-[#1A0505] clip-before border-r-[3px] border-white z-20">
      <Image 
  src="/before-bg.jpg" 
  alt="Life state before Vedic analysis" 
  // 1. 'fill' is best for background images where you want to cover the container
  fill
  // 2. Add 'sizes' so Next.js doesn't serve a massive desktop image to mobile users
  sizes="(max-width: 768px) 100vw, 50vw"
  // 3. Keep all your cinematic overlay and grayscale effects
  className="object-cover opacity-30 mix-blend-overlay grayscale"
  // 4. Default is lazy loading, perfect since the slider is usually below the fold
/>
        <div className="absolute inset-0 flex items-center justify-start p-8 lg:p-16">
          <div className="text-left max-w-sm z-10 pr-12">
            <h3 className="fraunces text-3xl lg:text-4xl font-medium text-[#FF8080] mb-6">BEFORE Smart Kundli</h3>
            <ul className="space-y-5">
              {[
                { t: "Constant Confusion", d: "Not knowing why bad things happen" },
                { t: "Money Slipping Away", d: "Working hard but can't save wealth" },
                { t: "Relationship Struggles", d: "Arguments, loneliness, no understanding" },
                { t: "No Career Direction", d: "Stuck in same position, bypassed" },
              ].map((l, i) => (
                <li key={i} className="flex flex-col items-start border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3"><span className="text-xl">😰</span><h4 className="text-white font-medium text-lg">{l.t}</h4></div>
                  <p className="text-white/60 text-sm mt-1">{l.d}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* Main Visual Left */}
          <div className="absolute left-[5%] bottom-[5%] lg:left-[15%] w-[40%] lg:w-[35%] opacity-60 pointer-events-none grayscale">
        <Image 
  src="/confused-person-planet.png" 
  alt="Confused state before Kundali" 
  // 1. Provide the natural width and height of the file
  width={500} 
  height={500}
  // 2. Use 'sizes' to ensure mobile users get a smaller version
  sizes="(max-width: 768px) 40vw, 35vw"
  // 3. Keep your existing animation and styling classes
  className="w-full h-auto object-contain animate-float-slow" 
  // 4. This is inside the slider which is usually below the fold, 
  // so we let it lazy load automatically.
/>
          </div>
        </div>
      </div>

      {/* SLIDER HANDLE */}
      <div 
        className="absolute top-0 bottom-0 z-30 flex items-center justify-center slider-handle"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-gray-800 font-medium border-2 border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" transform="rotate(90 12 12)" />
          </svg>
        </div>
      </div>
    </div>
  );
}


export default function NewLandingPage() {
  useReveal();
  const [stickyVisible, setStickyVisible] = useState(false);
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
          <span>🔥 Launch:&nbsp;<strong style={{ color: C.g3 }}>{spots} of 1,000 spots remain</strong></span>
        </div>
        
        <span className="hidden sm:inline">&nbsp;at ₹999 — includes&nbsp;</span>
        
        {/* Switched to gold accent for '1 FREE Question' for better premium feel against red */}
        <span style={{ color: C.g3, fontWeight: 700 }}>
          <span className="sm:hidden">+ </span>1 FREE Question <span className="hidden sm:inline">Answered on WhatsApp</span>
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
  src="https://www.surabhiastrology.com/assets/images/surbhi-logo.png" 
  alt="Celebrity Astrologer Surbhi Gupta" 
  // Set these to the natural aspect ratio of your logo
  width={250} 
  height={64}
  // This keeps the logo sharp while allowing Tailwind to handle responsive sizing
  className="h-14 sm:h-16 lg:h-16 w-auto object-contain"
  // Since the logo is in the navbar, it's critical for LCP
  priority
/>
          {/* Fallback text just in case the image path is wrong */}
          <div className="hidden fraunces text-[1.15rem] sm:text-[1.35rem] font-bold" style={{ color: C.t1 }}>
            Celebrity Astrologer Surbhi <em style={{ fontStyle: "italic", color: C.g }}>Gupta</em>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-2 text-sm font-medium" style={{ color: C.t2 }}>
          <span className="text-[#C8A000] tracking-widest text-lg">★★★★★</span> 4.9/5 • 15,000+ Reports
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#offer" className="btn-auto-shine rounded-full font-medium px-6 py-2.5 text-sm shadow-md transition-transform hover:scale-105"
             style={{ background: C.dk2, color: C.g3 }}>
            Get Kundali <span className="hidden sm:inline">— ₹999</span>
          </a>
        </div>
      </nav>

      {/* ════════════════════════════════
          HERO SECTION (Warm Gold Aesthetic)
      ════════════════════════════════ */}
  {/* ════════════════════════════════
          HERO SECTION (Warm Gold Aesthetic)
      ════════════════════════════════ */}
      {/* ════════════════════════════════
          HERO SECTION (Warm Gold Aesthetic)
      ════════════════════════════════ */}
      {/* ════════════════════════════════
          HERO SECTION (Warm Gold Aesthetic)
      ════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-6 sm:py-10 lg:py-14" 
               style={{ background: `linear-gradient(135deg, #fdf3da 0%, #fce8c0 40%, #f9d89a 100%)` }}>
        
        {/* Interactive 3D Cosmic Earth */}
        {/* <CosmicEarthBackground /> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-5 w-full relative z-10 grid lg:grid-cols-2 gap-2 sm:gap-8 lg:gap-12 items-center">
          
          {/* ========================================================
              LEFT TEXT (Headings & Subheadings)
              ======================================================== */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-[9px] sm:text-xs font-medium tracking-[0.2em] uppercase px-3 sm:px-4 py-1.5 rounded-full mb-3 lg:mb-6" 
                 style={{ color: C.t1, background: "rgba(255,255,255,0.3)", border: `1px solid rgba(42,14,0,0.2)` }}>
              ✦ India's Most Trusted Vedic Astrologer
            </div>
            
            <h1 className="fraunces text-4xl sm:text-5xl lg:text-6xl leading-[1.1] font-medium text-[#2A0E00] mb-3 lg:mb-6">
              Accurate Predictions For <br />
              <em className="font-light italic text-[#4A2E10]">Love, Career & Wealth!</em>
            </h1>
            
            <p className="text-sm sm:text-lg text-[#3D1600] font-medium max-w-lg mx-auto lg:mx-0 mb-0 lg:mb-8 leading-relaxed px-2 lg:px-0">
              Feeling stuck in life or lost about your future? Celebrity astrologer Surbhi Gupta's Accurate Vedic Kundli Report reveals the answers hidden in your birth chart and exact timing for success.
            </p>

            {/* DESKTOP CTA & BADGES (Hidden on Mobile) */}
            <div className="hidden lg:block">
              <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                <a href="#offer" className="btn-auto-shine w-auto px-8 py-4 rounded-full font-medium text-lg text-white shadow-[0_15px_30px_rgba(42,14,0,0.3)] hover:scale-105 transition-transform"
                   style={{ background: C.dk2 }}>
                  Get Your Personalized Kundali
                </a>
                <div className="flex items-center gap-3 text-[#2A0E00] font-semibold text-sm">
                  <span className="text-2xl">🎁</span> 
                  <span className="text-left leading-tight">Includes 1 Free<br/>WhatsApp Question</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-12 border-t border-[#4A2E10]/20 pt-8 max-w-lg mx-0">
                {[
                  ["10 Lakh+", "Reports Delivered"],
                  ["4.9/5 ★", "Average Rating"],
                  ["Personalized", "Deep Analysis"]
                ].map(([top, bot], i) => (
                  <div key={i} className="text-left">
                    <div className="fraunces text-xl lg:text-2xl font-medium text-[#2A0E00]">{top}</div>
                    <div className="text-[10px] lg:text-xs text-[#4A2E10] uppercase tracking-widest mt-1">{bot}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT VISUAL: Cosmic Wheel + Portrait + Floating Book 
              ======================================================== */}
          <div className="relative flex justify-center lg:justify-end items-center h-[400px] sm:h-[480px] lg:h-[700px] mt-0 sm:mt-6 lg:mt-0 w-full overflow-hidden lg:overflow-visible perspective-1000 z-10">
            
            {/* 1. BACKGROUND: Massive Cosmic Wheel */}
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-[-25%] w-[400px] sm:w-[500px] lg:w-[750px] aspect-square z-0 pointer-events-none opacity-90 lg:opacity-100">
              <svg className="w-full h-full drop-shadow-[0_0_40px_rgba(200,168,75,0.2)] animate-[spin_120s_linear_infinite]" viewBox="0 0 460 460" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="wbg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1A0500" stopOpacity="0.8"/>
                    <stop offset="70%" stopColor="#3D1600" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#521F00" stopOpacity="0.4"/>
                  </radialGradient>
                </defs>
                <circle cx="230" cy="230" r="220" fill="url(#wbg)" stroke="rgba(200,168,75,0.6)" strokeWidth="1.5"/>
                <g className="wheel-outer-ring">
                  <circle cx="230" cy="230" r="215" fill="none" stroke="rgba(200,168,75,0.3)" strokeWidth="0.5" strokeDasharray="4 8"/>
                  <g fill="rgba(226,192,106,0.9)" fontSize="16" fontFamily="serif" textAnchor="middle">
                    <text x="230" y="26">♈</text><text x="320" y="49">♉</text>
                    <text x="390" y="119">♊</text><text x="415" y="214">♋</text>
                    <text x="390" y="304">♌</text><text x="320" y="374">♍</text>
                    <text x="230" y="439">♎</text><text x="140" y="414">♏</text>
                    <text x="65"  y="349">♐</text><text x="32"  y="259">♑</text>
                    <text x="58"  y="164">♒</text><text x="128" y="86">♓</text>
                  </g>
                </g>
                <circle cx="230" cy="230" r="185" fill="none" stroke="rgba(200,168,75,0.2)" strokeWidth="1"/>
                <circle cx="230" cy="230" r="155" fill="none" stroke="rgba(200,168,75,0.15)" strokeWidth="0.5"/>
                <g stroke="rgba(200,168,75,0.2)" strokeWidth="1">
                  <line x1="230" y1="45" x2="230" y2="415"/>
                  <line x1="45"  y1="230" x2="415" y2="230"/>
                  <line x1="90"  y1="90"  x2="370" y2="370"/>
                  <line x1="370" y1="90"  x2="90"  y2="370"/>
                </g>
              </svg>
            </div>

            {/* 2. CENTER: Portrait */}
            <div className="relative z-10 w-[200px] sm:w-[280px] lg:w-[360px] ml-6 sm:ml-10 lg:ml-0 lg:mr-0">
              <div className="relative w-full aspect-[4/5] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border-[3px] lg:border-[4px] border-[#C8A84B]/40 shadow-[0_15px_40px_rgba(42,14,0,0.6)] lg:shadow-[0_25px_60px_rgba(42,14,0,0.6)] bg-[#2A0E00]">
                <div className="absolute inset-0 bg-[#E8D8B8]"></div> 
                <Image
  src="/surbhi-gupta-portrait.jpg"
  alt="Celebrity Astrologer Surbhi Gupta - Trusted Astrologer"
  width={360}
  height={450}
  // guidline-change: add priority prop to disable lazy-loading (defaults loading="eager")
  priority
  // guidline-change: add fetchPriority="high" for immediate discovery/download
  fetchPriority="high"
  className="absolute inset-0 w-full h-full object-cover z-10"
/>
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#1A0A00] to-transparent z-20"></div>
                <div className="absolute bottom-3 lg:bottom-5 inset-x-0 text-center z-30">
                  <div className="text-[#F5D98A] font-bold text-sm sm:text-xl lg:text-2xl drop-shadow-lg px-2 leading-tight">Celebrity Astrologer<br/>Surbhi Gupta</div>
                  <div className="text-white/80 text-[8px] lg:text-xs uppercase tracking-widest font-bold mt-1">Vedic Astrologer</div>
                </div>
              </div>

              {/* Floating Badge (Trusted By) */}
              <div className="absolute top-4 -right-6 sm:top-8 sm:-right-8 lg:-top-5 lg:-right-6 bg-white rounded-lg lg:rounded-xl py-1.5 px-3 lg:py-2 lg:px-5 shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center gap-1.5 lg:gap-2 border border-[#E8D8B8] z-30 animate-[float_5s_ease-in-out_infinite_0.5s]">
                <div className="text-sm lg:text-xl drop-shadow-sm">⭐</div>
                <div className="text-left">
                  <div className="text-[#4A2E10] text-[7px] lg:text-[10px] font-bold uppercase tracking-widest leading-none">Trusted by</div>
                  <div className="text-[#2A1400] text-[10px] sm:text-xs lg:text-sm font-extrabold mt-0.5">1.5 Lakh+</div>
                </div>
              </div>
              
              {/* Floating "Spots Left" Notification */}
              <div className="absolute -top-6 -left-4 sm:-top-8 sm:-left-4 lg:-top-10 lg:-left-12 z-30 animate-[float_4s_ease-in-out_infinite_1s]">
                <div className="bg-gradient-to-r from-[#A82020] to-[#8B1E1E] text-white text-[8px] sm:text-[10px] lg:text-xs font-bold tracking-widest px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-full shadow-[0_10px_20px_rgba(168,32,32,0.4)] border border-[#FF8080]/30 flex items-center gap-1.5 lg:gap-2 whitespace-nowrap">
                  <span className="animate-pulse">🔥</span> ONLY 17 SPOTS LEFT
                </div>
              </div>

              {/* 3. FOREGROUND: Floating Premium Book */}
              <div className="absolute -bottom-10 -left-20 sm:-bottom-10 sm:-left-16 lg:-bottom-8 lg:-left-40 z-40 animate-float transform -rotate-6 hover:rotate-0 transition-transform duration-700">
                <div className="w-[110px] sm:w-[160px] lg:w-[220px] aspect-[1/1.6] rounded-xl rounded-l-md shadow-[10px_15px_30px_rgba(0,0,0,0.8)] lg:shadow-[10px_25px_50px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden border-r-[2px] border-y border-[#D8C49A]/30 border-l-[4px] lg:border-l-[6px] border-l-[#1A0505]"
                     style={{ background: 'linear-gradient(160deg, #4A0E1A 0%, #1A0505 100%)' }}>
                  
                  <div className="absolute left-0 top-0 bottom-0 w-2 lg:w-3 bg-gradient-to-r from-transparent via-white/10 to-transparent mix-blend-overlay"></div>
                  
                  <div className="p-2 pt-3 sm:p-4 sm:pt-5 lg:p-5 lg:pt-6 text-center z-10 relative">
                    <div className="text-[#C8A84B] text-[5px] sm:text-[7px] lg:text-[8px] font-bold tracking-[0.2em] uppercase mb-1 sm:mb-1.5 lg:mb-2">
                      Premium<br/>Personalized
                    </div>
                    <h3 className="fraunces text-sm sm:text-lg lg:text-2xl font-bold text-white leading-tight">
                      Kundali <br/><span className="text-[#E2C06A]">Report</span>
                    </h3>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="absolute w-6 h-6 sm:w-10 sm:h-10 lg:w-16 lg:h-16 bg-[#7B42F6] rounded-full blur-xl lg:blur-2xl opacity-40"></div>
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-[#8B5CF6] to-[#5B21B6] transform rotate-45 rounded-lg lg:rounded-xl shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.5)] flex items-center justify-center border border-[#A78BFA]/50">
                      <div className="transform -rotate-45 text-white/90 text-xs sm:text-base lg:text-xl font-light">✡</div>
                    </div>
                  </div>

                  <div className="p-2 pb-3 sm:p-4 sm:pb-5 lg:p-5 lg:pb-6 text-center z-10 relative">
                    <div className="text-white/40 line-through text-[6px] sm:text-[8px] lg:text-[10px] font-medium mb-0.5">₹2,999</div>
                    <div className="flex items-center justify-center">
                      <span className="text-[#E2C06A] text-[8px] sm:text-[10px] lg:text-sm font-bold mr-0.5">₹</span>
                      <span className="text-[#E2C06A] fraunces text-sm sm:text-lg lg:text-2xl font-bold tracking-tight">999</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ========================================================
              MOBILE CTA & BADGES (Hidden on Desktop)
              ======================================================== */}
          <div className="block lg:hidden w-full pt-4 sm:pt-6 relative z-20">
            <div className="flex flex-col items-center justify-center gap-3">
              <a href="#offer" className="btn-auto-shine w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-medium text-base sm:text-lg text-white shadow-[0_10px_20px_rgba(42,14,0,0.3)] active:scale-95 transition-transform text-center"
                 style={{ background: C.dk2 }}>
                Get Your Personalized Kundali
              </a>
              <div className="flex items-center justify-center gap-2 text-[#2A0E00] font-semibold text-xs">
                <span className="text-xl">🎁</span> 
                <span className="text-left leading-tight">Includes 1 Free<br/>WhatsApp Question</span>
              </div>
            </div>

            {/* Mobile Trust Badges */}
            <div className="grid grid-cols-3 gap-2 mt-6 border-t border-[#4A2E10]/20 pt-4 max-w-lg mx-auto">
              {[
                ["10 Lakh+", "Reports Delivered"],
                ["4.9/5 ★", "Average Rating"],
                ["Personalized", "Deep Analysis"]
              ].map(([top, bot], i) => (
                <div key={i} className="text-center">
                  <div className="fraunces text-base sm:text-lg font-medium text-[#2A0E00]">{top}</div>
                  <div className="text-[7px] sm:text-[9px] text-[#4A2E10] uppercase tracking-widest mt-0.5">{bot}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

     {/* ════════════════════════════════
          WHAT CAN IT SOLVE? (Interactive 3D Hover Cards)
      ════════════════════════════════ */}
      <section className=" py-8 md:py-14  bg-[#FCF7EE]">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16 reveal">
            <h2 className="fraunces text-4xl lg:text-5xl font-medium text-[#2A1400] mb-4">What Can Smart Kundli Solve for You?</h2>
            <p className="text-lg text-[#4A2E10] max-w-2xl mx-auto">Get absolute clarity and powerful remedies for the most pressing challenges in your life.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: "Struggling in Business?", desc: "Manifest Success – Amplify remedies that actually WORK for success.", img: "https://static.vecteezy.com/system/resources/thumbnails/066/700/531/small_2x/tired-indian-business-man-suffering-from-headache-problem-tension-migraine-stress-at-home-office-video.jpg" },
              { title: "Relationship Conflicts?", desc: "Peace & Harmony – Align your life with cosmic energies for stronger bonds.", img: "https://gerardcounseling.com/wp-content/uploads/2012/03/communication-problems.jpg" },
              { title: "Financial Struggle?", desc: "Obstacle Removal – Align your energies for prosperity & stability.", img: "https://media.swncdn.com/cms/CW/28319-finances-man-struggle-challenge.1200w.tn.jpg" },
              { title: "Health Issues?", desc: "Fix dosh – Identify planetary imbalances & remedies for well-being.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ5Vn-8_svgUyFHnNtgyrsPQGw1ncZuDWMAQ&s" },
              { title: "Kundli Matchmaking?", desc: "Beyond Compatibility – We don't just match; we provide solutions to any mismatch!", img: "https://www.jyotishdham.com/cdn/shop/articles/Kundali_Match.png?v=1764230492" },
              { title: "Enlighten Baby Future?", desc: "Give Direction – Align your child's life towards ultimate success.", img: "https://media.istockphoto.com/id/2166738474/photo/mother-looking-away-contemplating-and-carrying-her-baby-daughter-at-home.jpg?s=612x612&w=0&k=20&c=ZY-Tst9DAjFg35m06lLrAaMCEM_8kynHkUHptGp5vO0=" },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`reveal d${(i % 3) + 1} group relative w-full aspect-[2/1] md:aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer bg-[#2A0E00] shadow-xl hover:shadow-[0_30px_60px_rgba(200,168,75,0.25)] transition-all duration-500 hover:-translate-y-3`}
              >
                {/* 1. Background Image with 3D Zoom Effect */}
                <Image 
  src={item.img} 
  alt={item.title} 
  // 1. Use 'fill' to cover the absolute container (the rounded-2rem div)
  fill
  // 2. 'sizes' prevents the browser from loading full-size images for small cards
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  // 3. Keep all your hover and transition styles
  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" 
  // 4. These are below the fold, so they stay lazy-loaded by default
/>

                {/* 2. Premium Dark Gradient Overlay (Protects Text Legibility) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A00] via-[#1A0A00]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                {/* 3. Text Content Container (Positioned at Bottom) */}
                <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10 flex flex-col justify-end">
                  
                  {/* Title */}
                  <h3 className="fraunces text-2xl lg:text-3xl font-medium text-[#F5D98A] transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
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
              Fix Your Problems with Smart Kundli NOW!
            </a>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* ════════════════════════════════
          BEFORE VS AFTER (Interactive Image Slider)
      ════════════════════════════════ */}

    <section className=" py-8 md:py-14 " style={{ background: '#1A0A00' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5">
        <div className="text-center mb-12 reveal">
          <div className="inline-block bg-white/5 text-[#E2C06A] text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6 border border-[#E2C06A]/30">
            The Transformation
          </div>
          <h2 className="fraunces text-4xl lg:text-5xl font-medium text-white mb-6">
            Life Before vs After Your <span className="italic text-[#E2C06A]">Kundali Report</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base">
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
              <h2 className="fraunces text-[28px] leading-none sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#E2C06A] mb-1 sm:mb-2 drop-shadow-md uppercase tracking-wide">
                Narendra Modi
              </h2>
              
              {/* Subtitle */}
              <h3 className="text-[#E8D8B8] font-serif text-xs sm:text-sm md:text-lg lg:text-xl italic mb-3 sm:mb-4 md:mb-6 px-2">
                Prime Ministerial Astrological Insights
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
  src="/surbhi-gupta-portrait.jpg" 
  alt="Celebrity Astrologer Surbhi Gupta" 
  width={600}           // Provide the maximum expected width
  height={750}          // Matches your aspect-[4/5] ratio
  className="relative z-10 w-full h-auto rounded-[2rem] shadow-2xl object-cover"
  // No need for 'priority' here since it's further down the page
  sizes="(max-width: 768px) 100vw, 50vw" // Helps browser choose the right size
/>
            <div className="absolute bottom-10 left-[-20px] z-20 bg-white p-6 rounded-2xl shadow-xl border border-[#E8D8B8] reveal d3">
              <div className="fraunces text-2xl font-medium text-[#2A1400]">35+ Years</div>
              <div className="text-sm font-semibold text-[#C8A84B] uppercase tracking-wider">Mastering the Stars</div>
            </div>
          </div> 

          {/* Timeline content */}
          <div className="reveal order-1 lg:order-2">
            <h2 className="fraunces text-4xl lg:text-5xl font-medium text-[#2A1400] mb-6">Who Should Get a <br/>Janam Kundli Made?</h2>
            <p className="text-[#4A2E10] text-lg mb-12 leading-relaxed">
              Anyone facing a dilemma in life can have your Kundli guide your next steps. It helps you understand the right timing, make better decisions, and move forward with confidence.
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
                    <h3 className="fraunces text-xl font-medium text-[#2A1400] mb-1">{item.title}</h3>
                    <p className="text-[#4A2E10] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 reveal">
              <a href="#offer" className="btn-auto-shine inline-block bg-gradient-to-r from-[#DEB85D] to-[#EFCF7A] text-[#2A0E00] px-10 py-4 rounded-xl font-medium text-lg shadow-[0_10px_20px_rgba(200,168,75,0.3)] hover:-translate-y-1 transition-transform">
                Order Yours Now
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
          
          {/* Section Header */}
          <div className="text-center mb-16 reveal">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-[1px] bg-[#C8A84B]"></div>
              <span className="text-[#C8A84B] text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
                Everything Included
              </span>
              <div className="w-12 h-[1px] bg-[#C8A84B]"></div>
            </div>
            <h2 className="fraunces text-4xl lg:text-5xl font-medium text-[#2A1400]">
              What's Inside Your Premium Kundali
            </h2>
          </div>

          {/* TOP ROW: 5 Dark Cinematic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mb-6">
            {[
              {
                badge: "CORE", badgeColor: "text-[#F5D98A] bg-[#F5D98A]/10 border-[#F5D98A]/30",
                icon: "📜",
                title: "Dosh & Dasha Analysis",
                desc: "Complete planetary period report with remedies",
                bg: "from-[#3A1010] to-[#1A0505]", // Deep Burgundy
                glow: "rgba(255, 100, 100, 0.15)"
              },
              {
                badge: "CORE", badgeColor: "text-[#F5D98A] bg-[#F5D98A]/10 border-[#F5D98A]/30",
                icon: "🧘‍♂️",
                title: "All Yog Report",
                desc: "Raj Yoga, Gajkesari & all formed yogas",
                bg: "from-[#0A1A3A] to-[#050A1A]", // Deep Navy
                glow: "rgba(100, 150, 255, 0.15)"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#E2C06A] bg-[#E2C06A]/10 border-[#E2C06A]/30",
                icon: "💎",
                title: "Gemstone Recommendation",
                desc: "When, why & how to wear — by top gemologists",
                bg: "from-[#2A2A0A] to-[#101005]", // Deep Olive Gold
                glow: "rgba(255, 215, 0, 0.15)"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#E2C06A] bg-[#E2C06A]/10 border-[#E2C06A]/30",
                icon: "🪔",
                title: "Puja Recommendation",
                desc: "Targeted pujas to counter your specific doshas",
                bg: "from-[#0A2A1A] to-[#05100A]", // Deep Forest
                glow: "rgba(100, 255, 150, 0.15)"
              },
              {
                badge: "SPECIAL", badgeColor: "text-[#E2C06A] bg-[#E2C06A]/10 border-[#E2C06A]/30",
                icon: "🔢",
                title: "Remedies",
                desc: "Numerology — personality, nature & behaviors",
                bg: "from-[#2A103A] to-[#10051A]", // Deep Indigo/Purple
                glow: "rgba(200, 100, 255, 0.15)"
              }
            ].map((card, i) => (
              <div 
                key={i} 
                className={`reveal d${(i % 5) + 1} relative rounded-3xl p-6 lg:p-5 xl:p-6 flex flex-col items-center text-center overflow-hidden border border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-300 group`}
                style={{ background: `linear-gradient(145deg, var(--tw-gradient-stops))` }}
              >
                {/* Dynamic Background Tailwind Classes applied via style map */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-90`}></div>
                
                {/* Floating Badge */}
                <div className={`absolute top-4 right-4 text-[9px] font-medium tracking-widest px-2 py-1 rounded-md border ${card.badgeColor} z-10`}>
                  {card.badge}
                </div>

                {/* Icon with Subtle Glowing Aura */}
                <div className="relative mt-4 mb-6 z-10">
                  <div className="absolute inset-0 rounded-full scale-150 blur-xl group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: card.glow }}></div>
                  <div className="w-14 h-14 relative flex items-center justify-center text-3xl drop-shadow-lg z-10">
                    {card.icon}
                  </div>
                  {/* Faint ground line like in the screenshot */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-[2px] bg-white/10 rounded-full"></div>
                </div>

                {/* Text Content */}
                <div className="relative z-10 mt-auto">
                  <h4 className="fraunces text-lg lg:text-base xl:text-lg font-medium text-[#E8D8B8] mb-2 leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-white/60 text-xs lg:text-[11px] xl:text-xs leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM ROW: 4 Light Horizontal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {[
              {
                badge: "BONUS", badgeColor: "text-[#D9481E] bg-[#D9481E]/10",
                icon: "📅",
                title: "Monthly Predictions — 1 Year",
                desc: "Month-by-month insights across all life areas"
              },
              {
                badge: "EXCLUSIVE", badgeColor: "text-[#C8A84B] bg-[#C8A84B]/10",
                icon: "🗓️",
                title: "Yearly Predictions — 10 Years",
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
                desc: "Lifetime access to private astrology group"
              }
            ].map((card, i) => (
              <div 
                key={i} 
                className={`reveal d${(i % 4) + 1} bg-white rounded-2xl p-5 border border-[#E8D8B8] shadow-[0_5px_15px_rgba(61,22,0,0.03)] hover:shadow-[0_10px_25px_rgba(61,22,0,0.08)] transition-all duration-300 flex flex-col`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl bg-[#FCF7EE] w-10 h-10 rounded-lg flex items-center justify-center border border-[#E8D8B8]/50 shadow-sm shrink-0">
                    {card.icon}
                  </div>
                  <div className={`text-[9px] font-medium tracking-widest px-2 py-1 rounded-md ${card.badgeColor}`}>
                    {card.badge}
                  </div>
                </div>
                
                <h4 className="fraunces text-[#3D1600] font-medium text-[15px] mb-1.5 leading-tight">
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
     <section className="py-8 sm:py-12 md:py-14 relative overflow-hidden" style={{ background: C.dk2 }}>
        
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
            <h2 className="fraunces text-[2.2rem] leading-tight sm:text-5xl lg:text-6xl font-medium mb-4 sm:mb-6 bg-gradient-to-br from-white via-[#F5D98A] to-[#C8A84B] bg-clip-text text-transparent drop-shadow-sm">
              Get Your Smart <br className="hidden sm:block"/>Kundli Online
            </h2>
            
            {/* Tightened margin (mb-6 on mobile, mb-10 on sm) */}
            <p className="text-[#E8D8B8]/80 font-light text-sm sm:text-lg mb-6 sm:mb-10 leading-relaxed max-w-lg mx-auto sm:mx-0">
              Apni online kundli banaiye aur apni janampatri ka detailed analysis paiye quickly aur accurately. Smart Kundli ek advanced online kundali making report hai jisme aap apni kundali check karke grahon ki position, life challenges aur unke practical solutions samajh sakte hain.
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
                <div className="fraunces text-3xl sm:text-4xl lg:text-5xl font-medium text-white flex items-center gap-3">
                  ₹999 <del className="text-lg sm:text-xl lg:text-2xl text-white/30 font-sans font-medium">₹2999</del>
                </div>
              </div>
              
              <a href="#offer" className="btn-auto-shine block w-full sm:w-auto bg-gradient-to-r from-[#DEB85D] to-[#EFCF7A] text-[#2A0E00] px-8 sm:px-10 py-3.5 sm:py-5 rounded-full sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-[0_0_40px_rgba(239,207,122,0.4)] hover:-translate-y-1 transition-all text-center">
                Get Smart Kundli Now
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
            <div className="w-[200px] sm:w-[220px] lg:w-[260px] aspect-[1/1.4] bg-white rounded-xl rounded-r-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),_0_0_40px_rgba(200,168,75,0.4)] z-20 flex flex-col items-center justify-center relative animate-float border-r-2 border-[#C8A84B]/50">
               
               {/* Assuming reportImgError and setReportImgError are defined in your component state */}
               {!reportImgError ? (
                 <Image 
  src="/smart-kundli.png" 
  alt="Smart Kundli Book" 
  width={260}            // Matches the maximum width in your desktop CSS
  height={364}           // Matches the 1/1.4 aspect ratio in your CSS
  className="w-full h-full object-cover rounded-xl rounded-r-2xl" 
  // onError={() => setReportImgError(true)}
  // Default is lazy loading, which is perfect for this section
/>
               ) : (
                 <div className="absolute inset-1 border-2 border-[#C8A84B] flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#FCF7EE] to-[#E8D8B8] rounded-lg rounded-r-xl">
                   <div className="fraunces text-[#3D1600] font-medium text-xs sm:text-sm tracking-widest mb-1">SMART</div>
                   <div className="fraunces text-[#8B1E1E] font-medium text-2xl sm:text-3xl mb-6">KUNDLI</div>
                   <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#C8A84B] flex items-center justify-center text-2xl bg-white shadow-inner">👁️</div>
                 </div>
               )}

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          AUTHORITY (Acharya Style)
      ════════════════════════════════ */}
      <section className="py-8 md:py-14 bg-[#FCF7EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5">
          {/* Changed to flex-col-reverse for mobile so the image shows at the top, switches to grid on desktop */}
          <div className="bg-[#F5D98A] rounded-[1.5rem] lg:rounded-3xl overflow-hidden shadow-2xl flex flex-col-reverse lg:grid lg:grid-cols-2">
            
            {/* Text Side */}
            <div className="p-6 sm:p-10 lg:p-16 flex flex-col justify-center">
              <h2 className="fraunces text-2xl sm:text-3xl lg:text-4xl font-medium text-[#2A1400] mb-1.5 lg:mb-2">Trust the Best —</h2>
              <div className="bg-white inline-block px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6 rounded-md lg:rounded-none w-fit">
                <h3 className="fraunces text-xl sm:text-2xl lg:text-3xl font-medium text-[#8B1E1E] italic">Celebrity Astrologer Surbhi Gupta!</h3>
              </div>
              <p className="text-[#4A2E10] mb-5 lg:mb-8 leading-snug lg:leading-relaxed text-sm sm:text-base lg:text-lg">
                Celebrity Astrologer Surbhi Gupta, recognized as the Pride of Bharat, is an elite Astrologer in India. She is a highly regarded expert in the fields of Astrology, Vastu, Numerology, and Tantra. She has gained recognition for providing satisfactory, deeply accurate solutions to a wide range of problems, endorsed by top celebrities and business leaders!
              </p>
              <p className="text-[#2A1400] font-medium italic text-base sm:text-lg lg:text-xl mb-6 lg:mb-10">
                Your destiny is precious. Don't leave it to guesswork.
              </p>

              {/* Stats Row - Compact for Mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {[
                  { i: "✡", t: "35+ Years in Occult Science" },
                  { i: "👥", t: "Trusted by 15,000+ Worldwide" },
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
               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#F5D98A] to-transparent h-24 lg:h-32 flex items-end justify-center pb-4 lg:pb-6">
                 {/* Hidden on mobile to save space since it's already in the text box below it */}
                 <h3 className="hidden lg:block fraunces text-3xl font-medium text-[#2A1400] drop-shadow-md italic">
                   Celebrity Astrologer Surbhi Gupta!
                 </h3>
               </div>
            </div>
            
          </div>

          {/* Full width button on mobile */}
          <div className="mt-8 lg:mt-12 text-center reveal">
             <a href="#offer" className="btn-auto-shine block w-full sm:inline-block sm:w-auto bg-[#3D1600] text-white px-6 py-4 lg:px-12 lg:py-5 rounded-xl lg:rounded-2xl font-medium text-base sm:text-lg lg:text-xl shadow-xl hover:scale-105 transition-transform">
                Get Your Report From the Best!
             </a>
          </div>
        </div>
      </section>

<section className="relative overflow-hidden py-4 sm:py-8" style={{ background: C.dk }}>
        <StarCanvas id="proofC" style={{ opacity: .5 }} />
        {/* Hide large floating symbols on mobile to prevent overflow/distraction */}
        <div className="hidden lg:block absolute right-[-30px] top-[20%] text-[24rem] opacity-[0.025] pointer-events-none leading-none font-serif" style={{ color: C.g }}>♀</div>
        <div className="hidden lg:block absolute left-[-20px] bottom-[25%] text-[18rem] opacity-[0.025] pointer-events-none leading-none font-serif" style={{ color: C.g }}>♂</div>

        {/* Global style injection just for hiding scrollbar in the carousel */}
        <style dangerouslySetInnerHTML={{ __html: `.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }` }} />

        <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          
          <div className="reveal text-center mb-10 lg:mb-[40px]">
            <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-medium tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>✦ Real People. Real Shifts.</div>
            <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.02em]" style={{ color: C.td1 }}>
              15,000 Lives Touched.<br /><em style={{ fontStyle: "italic", color: C.g2 }}>Trusted by the Stars.</em>
            </h2>
          </div>

          {/* CELEBRITY CAROUSEL (Mobile Swipeable / Desktop Scrollable) */}
          <div className="reveal d1 mb-16 lg:mb-[80px]">
            <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8 max-w-[800px] mx-auto">
              <div className="h-[1px] flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(200,168,75,0.3))" }} />
              <div className="text-[0.65rem] lg:text-[0.8rem] font-medium tracking-[0.2em] uppercase text-center" style={{ color: C.g2 }}>Celebrity Consultations</div>
              <div className="h-[1px] flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(200,168,75,0.3))" }} />
            </div>

            {/* Carousel Container */}
            <div className="flex overflow-x-auto gap-4 lg:gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scroll px-2 -mx-2">
              {[
                { name: "Leading Politician", desc: "Muhurat & Strategy", img: "/celebs/4.jpeg" },
                { name: "Bollywood Actor", desc: "Career Timing", img: "/celebs/5.jpeg" },
                { name: "Top Industrialist", desc: "Business Expansion", img: "/celebs/6.jpeg" },
                { name: "Cricket Icon", desc: "Injury & Comeback", img: "/celebs/11.png" },
                { name: "Global CEO", desc: "Wealth Yogas", img: "/celebs/8.png" },
              ].map((celeb, i) => (
                <div key={i} className="relative shrink-0 w-[140px] sm:w-[180px] lg:w-[220px] aspect-[3/4] rounded-2xl lg:rounded-[24px] overflow-hidden snap-center group transition-transform duration-300 hover:-translate-y-2" style={{ border: "1px solid rgba(200,168,75,.3)", background: C.dk2, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                  
                  {/* Image (Replace src with actual celeb images) */}
                  <div className="absolute inset-0 bg-[#3D1600] flex items-center justify-center text-4xl opacity-20 z-0">👤</div>
                  <Image 
  src={celeb.img} 
  alt={celeb.name} 
  // 1. Define dimensions based on the container aspect ratio (3:4)
  width={220} // The max width in your CSS
  height={293} // Matches the 3/4 aspect ratio (220 / 3 * 4)
  // 2. Responsive 'sizes' are crucial for carousel images
  sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 220px"
  // 3. Keep your existing cinematic/hover styling
  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 z-0"
  // 4. Set priority to false (or just omit it) because it's further down the page
  priority={false}
/>

                  {/* Dark Gradient Overlay for Text Readability */}
                  <div className="absolute inset-x-0 bottom-0 p-3 lg:p-5 z-20" style={{ background: "linear-gradient(to top, rgba(20,5,0,0.95) 0%, rgba(20,5,0,0.6) 60%, transparent 100%)" }}>
                    {/* <div className="text-[0.55rem] lg:text-[0.65rem] font-medium mb-1 tracking-wider uppercase" style={{ color: C.g }}>✦ {celeb.desc}</div> */}
                    {/* <div className="fraunces text-[0.9rem] lg:text-[1.2rem] font-medium text-white leading-tight">{celeb.name}</div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
              <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          
          {/* Header */}
          <div className="reveal text-center mb-10 lg:mb-[52px]">
            <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-medium tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>
              ✦ As Featured In
            </div>
            <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.02em]" style={{ color: C.td1 }}>
              Making Headlines.<br /><em style={{ fontStyle: "italic", color: C.g2 }}>Trusted by the Press.</em>
            </h2>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {[
              // { id: 1, publisher: "The Times of India", date: "Oct 2024", img: "/news/001.jpg" },
              { id: 2, publisher: "Hindustan Times", date: "Sep 2024", img: "/news/002.jpg" },
              { id: 3, publisher: "Mid-Day", date: "Aug 2024", img: "/news/003.jpg" },
              { id: 4, publisher: "Zee News", date: "Jul 2024", img: "/news/004.jpg" },
              // { id: 5, publisher: "Deccan Chronicle", date: "Jun 2024", img: "/news/005.jpg" },
              { id: 6, publisher: "India Today", date: "May 2024", img: "/narendra-modi.jpg" },
              // { id: 7, publisher: "The Tribune", date: "Apr 2024", img: "/news/007.jpg" },
              // { id: 8, publisher: "NDTV", date: "Mar 2024", img: "/news/008.jpg" },
              { id: 9, publisher: "Firstpost", date: "Feb 2024", img: "/news/009.png" },
              // { id: 5, publisher: "Deccan Chronicle", date: "Jun 2024", img: "/news/010.jpg" },
              // { id: 6, publisher: "India Today", date: "May 2024", img: "/news/011.jpg" },
              // { id: 7, publisher: "The Tribune", date: "Apr 2024", img: "/news/012.jpg" },
              // { id: 8, publisher: "NDTV", date: "Mar 2024", img: "/news/012.jpg" },
              // { id: 9, publisher: "Firstpost", date: "Feb 2024", img: "/news/013.jpg" },
            ]
              // If showAllNews is false, only show the first 6. If true, show all.
              .map((news, i) => (
                <div 
                  key={news.id} 
                  className={`reveal${i > 0 && i < 3 ? " d"+i : ""} group relative rounded-[18px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5`} 
                  style={{ background: C.dk, border: "1px solid rgba(200,168,75,.15)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] bg-[#2A0E00] overflow-hidden">
                    {/* Placeholder icon just in case image doesn't load */}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10">📰</div>
                    
                    <Image 
  src={news.img} 
  alt={`News snippet from ${news.publisher}`} 
  // 1. Define dimensions to prevent Layout Shift (CLS)
  width={400} 
  height={300}
  // 2. Add 'sizes' so Next.js generates smaller versions for mobile
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  // 3. Keep your existing cinematic styling
  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 z-10"
  // 4. Optimization: Standard <img> doesn't need 'loading="lazy"' here 
  // because Next.js handles it automatically for images below the fold.
/>
                    
                    {/* Gradient Overlay for bottom text */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 z-20" style={{ background: "linear-gradient(to top, rgba(20,5,0,0.95) 0%, transparent 100%)" }} />
                  </div>

                  {/* Publisher Info (Overlayed at bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-30 flex items-end justify-between">
                    <div>
                      <div className="text-[0.6rem] lg:text-[0.65rem] font-medium tracking-wider uppercase mb-1" style={{ color: C.g }}>Media Coverage</div>
                      <div className="fraunces text-[1.05rem] lg:text-[1.15rem] font-medium text-white leading-tight">{news.publisher}</div>
                    </div>
                    <div className="text-[0.6rem] lg:text-[0.65rem] px-2 py-1 rounded border" style={{ color: C.td4, borderColor: "rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.4)" }}>
                      {news.date}
                    </div>
                  </div>
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C8A84B]/40 rounded-[18px] transition-colors duration-300 z-40 pointer-events-none" />
                </div>
            ))}
          </div>

          

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
          
          <div className="relative rounded-3xl p-8 sm:p-12 shadow-[0_20px_40px_rgba(61,22,0,0.15)] overflow-hidden border-2 border-[#E8D8B8]"
               style={{ background: 'linear-gradient(180deg, #5C2B09 0%, #2A0E00 100%)' }}>
            
            {/* Corner ribbon (Matching inspiration) */}
            <div className="absolute top-6 -right-10 bg-[#D9481E] text-white text-[10px] font-medium py-1.5 px-12 rotate-45 shadow-lg tracking-widest uppercase">
              OFFER
            </div>

            {/* Headers */}
            <div className="text-center mb-8">
              <div className="text-[#E8D8B8] text-xs font-medium tracking-[0.2em] uppercase mb-2">
                Premium Personalized Kundali
              </div>
              <h2 className="fraunces text-3xl sm:text-4xl font-medium text-white">
                Your Complete Life Blueprint
              </h2>
            </div>

            {/* Two-Column Layout for Desktop (Compact!) */}
            <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
              
              {/* Left Column: Features */}
              <div className="space-y-4">
                {[
                  "10-Year Detailed Prediction Report",
                  "Dosh, Dasha & Ank Jyotish Analysis",
                  "Gemstone & Puja Recommendations",
                  "Monthly Predictions for 12 Months",
                  "Astrograph / Bhavbhal Chart",
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
                    <span className="text-[#E2C06A] fraunces text-6xl font-medium leading-none tracking-tight">999</span>
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
                <a href="https://kundalireport.surabhiastrology.com/checkout?service=Surbhi%20Kundli&plan=10-Yr%20Report%20%2B%201Q%20(%E2%82%B9999)" className="btn-auto-shine block w-full bg-gradient-to-r from-[#D9481E] to-[#A32A0C] text-white py-4 rounded-xl font-medium text-center text-lg shadow-[0_10px_20px_rgba(217,72,30,0.3)] hover:-translate-y-0.5 transition-transform duration-300">
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
        Premium Kundali <span className="hidden sm:inline">Report</span>
      </div>
      <div className="text-[10px] sm:text-sm text-[#F5D98A] font-medium leading-tight mt-0.5 truncate">
        🎁 <span className="hidden sm:inline">+ Free WhatsApp Consultation</span><span className="sm:hidden">Free WA Consult</span>
      </div>
    </div>
    
    {/* Right Side: Price & CTA Button */}
    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
      
      {/* Price Section: Stacked for compact mobile view */}
      <div className="flex flex-col items-end justify-center pt-0.5">
        <del className="text-white/60 text-[10px] sm:text-sm font-sans font-medium leading-none mb-1 decoration-[#EFCF7A]">
          ₹2999
        </del>
        <div className="text-white fraunces text-[18px] sm:text-2xl font-bold leading-none">
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