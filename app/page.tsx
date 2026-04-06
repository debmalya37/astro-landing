"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── COLOUR TOKENS (mirrors :root CSS vars) ─── */
const C = {
  dk:  "#2A0E00",
  dk2: "#3D1600",
  dk3: "#521F00",
  dk4: "#6B2C00",
  g:   "#C8A84B",
  g2:  "#E2C06A",
  g3:  "#F5D98A",
  g4:  "#FFF0C0",
  gg:  "rgba(200,168,75,0.22)",
  iv:  "#FCF7EE",
  iv2: "#F4EAD6",
  iv3: "#E8D8B8",
  iv4: "#D8C49A",
  t1:  "#2A1400",
  t2:  "#4A2E10",
  t3:  "#6A4E30",
  t4:  "#9A7A58",
  td1: "#FCF7EE",
  td2: "rgba(252,247,238,0.80)",
  td3: "rgba(252,247,238,0.52)",
  td4: "rgba(252,247,238,0.30)",
  red: "#A82020",
  grn: "#1A6A40",
};

/* ─── GLOBAL KEYFRAME STYLES (injected once) ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300;1,9..144,500;1,9..144,700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Nunito Sans', sans-serif; background: #FCF7EE; color: #2A1400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

    .fraunces { font-family: 'Fraunces', serif; }
    .nunito   { font-family: 'Nunito Sans', sans-serif; }

    /* paper noise */
    body::before {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.025; pointer-events: none; z-index: 9000;
    }

    @keyframes pd    { 0%,100%{box-shadow:0 0 0 0 rgba(168,32,32,.5)} 50%{box-shadow:0 0 0 6px rgba(168,32,32,0)}}
    @keyframes tkr   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes wspin { to{transform:rotate(360deg)} }
    @keyframes badge-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes ppulse{ 0%,100%{opacity:.6} 50%{opacity:1} }
    @keyframes wt    { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
    @keyframes rsp   { to{transform:translate(-50%,-50%) rotate(360deg)} }
    @keyframes sglow { 0%,100%{box-shadow:0 0 5px rgba(200,168,75,.3)} 50%{box-shadow:0 0 14px rgba(200,168,75,.7)} }
    @keyframes wfp   { 0%,100%{box-shadow:0 6px 24px rgba(37,211,102,.4)} 50%{box-shadow:0 8px 36px rgba(37,211,102,.7)} }
    @keyframes shimmer { from{transform:translateX(-110%) skewX(-20deg)} to{transform:translateX(200%) skewX(-20deg)} }

    .ann-dot { width:7px;height:7px;background:#A82020;border-radius:50%;flex-shrink:0;animation:pd 1.3s ease-in-out infinite; }
    .ticker-row { display:flex;gap:52px;white-space:nowrap;animation:tkr 28s linear infinite; }
    .wheel-outer-ring { animation:wspin 80s linear infinite;transform-origin:230px 230px; }
    .wheel-mid-ring   { animation:wspin 50s linear infinite reverse;transform-origin:230px 230px; }
    .planet-dot { animation:ppulse 2.5s ease-in-out infinite; }
    .wt-dot-1 { animation:wt 1.2s ease-in-out 0s infinite; }
    .wt-dot-2 { animation:wt 1.2s ease-in-out .2s infinite; }
    .wt-dot-3 { animation:wt 1.2s ease-in-out .4s infinite; }
    .badge-float { animation:badge-float 3s ease-in-out infinite; }
    .scar-fill { animation:sglow 2.5s ease-in-out infinite; }
    .wa-float { animation:wfp 3s ease-in-out infinite; }
    .fr-ring-1 { position:absolute;width:700px;height:700px;border:1px solid rgba(200,168,75,.06);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);animation:rsp 120s linear infinite;pointer-events:none; }
    .fr-ring-2 { position:absolute;width:500px;height:500px;border:1px solid rgba(200,168,75,.05);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);animation:rsp 80s linear infinite reverse;pointer-events:none; }
    .fr-ring-3 { position:absolute;width:300px;height:300px;border:1px dashed rgba(200,168,75,.07);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);animation:rsp 60s linear infinite;pointer-events:none; }

    .reveal { opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease; }
    .reveal.visible { opacity:1;transform:none; }
    .reveal-lf { opacity:0;transform:translateX(-28px);transition:opacity .7s ease,transform .7s ease; }
    .reveal-lf.visible { opacity:1;transform:none; }
    .d1 { transition-delay:.08s } .d2 { transition-delay:.16s } .d3 { transition-delay:.24s }
    .d4 { transition-delay:.32s } .d5 { transition-delay:.40s }

    .btn-shimmer { position:relative;overflow:hidden; }
    .btn-shimmer::after { content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.2) 50%,transparent 70%);transform:translateX(-110%) skewX(-20deg);transition:transform .55s ease; }
    .btn-shimmer:hover::after { transform:translateX(200%) skewX(-20deg); }

    .pi-card { transition:all .3s; }
    .pi-card:hover { transform:translateX(5px); }

    .chap-card { position:relative;overflow:hidden;transition:all .3s ease; }
    .chap-card::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#C8A84B,#E2C06A);transform:scaleY(0);transform-origin:top;transition:transform .35s; }
    .chap-card:hover { transform:translateX(6px); }
    .chap-card:hover::before { transform:scaleY(1); }

    .story-card { transition:all .3s; }
    .story-card:hover { transform:translateY(-4px); }

    .vid-card { transition:all .3s; }
    .vid-card:hover { transform:translateY(-4px); }
    .vid-card:hover .vid-play { transform:translate(-50%,-50%) scale(1.1) !important; }

    .oc-cta-btn { position:relative;overflow:hidden;transition:all .3s; }
    .oc-cta-btn::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(255,255,255,.08),transparent);transform:translateX(-100%) skewX(-20deg);transition:transform .5s; }
    .oc-cta-btn:hover::after { transform:translateX(200%) skewX(-20deg); }
    .oc-cta-btn:hover { transform:translateY(-2px); }

    .vs-row { transition:all .25s; }
    .vs-row:hover { border-color:rgba(200,168,75,.25) !important;background:rgba(200,168,75,.04) !important; }

    .faq-answer { max-height:0;overflow:hidden;transition:max-height .35s ease,padding .3s; }
    .faq-answer.open { max-height:240px; }

    .sticky-bar { transform:translateY(100%);transition:transform .42s cubic-bezier(.34,1.3,.64,1); }
    .sticky-bar.show { transform:translateY(0); }

    .ticker-wrap::before, .ticker-wrap::after { content:'';position:absolute;top:0;width:80px;height:100%;z-index:2; }
    .ticker-wrap::before { left:0;background:linear-gradient(to right,#F4EAD6,transparent); }
    .ticker-wrap::after  { right:0;background:linear-gradient(to left,#F4EAD6,transparent); }

    .auth-s-ticker-before::before { background:linear-gradient(to right,#2A0E00,transparent); }
    .auth-s-ticker-after::after   { background:linear-gradient(to left,#2A0E00,transparent); }
  `}</style>
);

/* ─── REVEAL HOOK ─── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
    );
    document.querySelectorAll(".reveal,.reveal-lf").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

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

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function KundaliPage() {
  useReveal();
  const countdown = useCountdown();
  const spots = useLiveCounter();
  const [stickyVisible, setStickyVisible] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <GlobalStyles />

    {/* ── STICKY BAR ── */}
      <div
        // Added 'ann-bar-shimmer' for the slow continuous gold sweep
        className={`sticky-bar ${stickyVisible ? "show" : ""} ann-bar-shimmer fixed bottom-0 left-0 right-0 z-[200] flex items-center justify-between gap-2 px-4 py-3 sm:px-7 sm:py-3 backdrop-blur-md`}
        style={{
          background: C.red, // Premium red background
          borderTop: "1px solid rgba(255,255,255,0.15)", // Subtle light border
          boxShadow: "0 -8px 32px rgba(168,32,32,0.4)", // Red-tinted shadow glow
        }}
      >
        {/* Left Column: Title & Spots */}
        <div className="flex flex-col gap-0.5 sm:gap-1 max-w-[45%] sm:max-w-none truncate relative z-10">
          <div className="text-[0.75rem] sm:text-[0.86rem] font-bold truncate" style={{ color: C.iv }}>
            <span className="hidden sm:inline">Surbhi Gupta — </span>Kundali Report
            
            {/* Updated badge: Translucent background with Gold text instead of Green */}
            <span className="hidden lg:inline-flex items-center gap-1 text-[0.62rem] font-bold px-2 py-0.5 rounded-full ml-2" 
                  style={{ background: "rgba(255,255,255,0.1)", color: C.g3, border: "1px solid rgba(200,168,75,0.3)" }}>
              + Free Consultation
            </span>
          </div>
          
          <div className="text-[0.65rem] sm:text-[0.7rem] truncate" style={{ color: "rgba(252,247,238,0.8)" }}>
            {/* Changed 'spots left' text to Gold since the background is now Red */}
            🔥 <strong style={{ color: C.g3 }}>{spots} spots left</strong> <span className="hidden sm:inline">at ₹999</span>
          </div>
        </div>

        {/* Right Column: Price & Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative z-10">
          {/* Updated Price to White, and Strikethrough to faded White */}
          <div className="fraunces text-[1.15rem] sm:text-[1.48rem] whitespace-nowrap" style={{ color: C.iv }}>
            <del className="text-[0.65rem] sm:text-[0.76rem] font-sans mr-1" style={{ color: "rgba(252,247,238,0.5)" }}>₹2,999</del>₹999
          </div>
          
          <a
            href="#offer"
            // Button keeps the fast/medium shine to draw the eye to the click action
            className="btn-auto-shine inline-flex items-center justify-center font-bold rounded-full text-white no-underline text-[0.75rem] sm:text-[0.86rem] px-4 py-2 sm:px-[26px] sm:py-[12px] whitespace-nowrap"
            style={{
              fontFamily: "'Nunito Sans',sans-serif",
              background: `linear-gradient(135deg,${C.g} 0%,${C.g2} 55%,${C.g} 100%)`, // Gold button pops perfectly on red
              color: C.dk, // Dark text on gold button for readability
              boxShadow: `0 12px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,.3)`,
            }}
          >
            Get Report <span className="hidden sm:inline">&nbsp;+ Consultation</span> →
          </a>
        </div>
      </div>

      {/* ── WA FLOAT ── */}
      <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer"
        className="wa-float"
        style={{
          position: "fixed", right: 22, bottom: 88, zIndex: 199,
          width: 54, height: 54, borderRadius: "50%", background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem", textDecoration: "none",
        }}>
        💬
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
          className="btn-auto-shine ml-1 sm:ml-0 px-3 py-1 sm:px-[13px] sm:py-[4px] rounded-full font-bold no-underline whitespace-nowrap tracking-[0.04em] text-[0.6rem] sm:text-[0.68rem]"
          style={{ background: C.g, color: C.dk }} // Gold button, dark text
        >
          Claim Yours →
        </a>
      </div>

     {/* ════════════════════════════════
          NAV
      ════════════════════════════════ */}
      <nav 
        className="sticky top-0 z-[99] flex items-center justify-between px-4 lg:px-7 h-[60px] lg:h-[68px] border-b backdrop-blur-md"
        style={{ 
          background: "rgba(252,247,238,.94)", 
          borderColor: C.iv3 
        }}
      >
        {/* Logo (Responsive Image) */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <img 
            src="/logo.svg" 
            alt="Surbhi Gupta" 
            className="h-14 sm:h-16 lg:h-16 w-auto object-cover"
            onError={(e) => {
              // Fallback to text if the SVG is missing or fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback text just in case the image path is wrong */}
          <div className="hidden fraunces text-[1.15rem] sm:text-[1.35rem] font-bold" style={{ color: C.t1 }}>
            Celebrity Astrologer Surbhi <em style={{ fontStyle: "italic", color: C.g }}>Gupta</em>
          </div>
        </Link>
        
        {/* Reviews (Hidden on Mobile to save space) */}
        <div className="hidden md:flex items-center gap-1.5 text-[0.74rem]" style={{ color: C.t4 }}>
          <span style={{ color: "#C8A000", letterSpacing: -1 }}>★★★★★</span> 4.9 · 1,200+ reviews
        </div>
        
        {/* CTA & Price */}
        <div className="flex items-center gap-3 lg:gap-[12px]">
          {/* Strike-through price (Hidden on very small screens) */}
          <div className="fraunces text-[0.9rem] sm:text-[1.05rem] hidden sm:block" style={{ color: C.t1 }}>
            <del className="text-[0.65rem] sm:text-[0.74rem] font-sans mr-1" style={{ color: C.t4 }}>₹2,999</del> ₹999
          </div>
          
          <a 
            href="#offer" 
            className="btn-auto-shine rounded-full font-bold no-underline transition-all duration-220 px-4 py-2 sm:px-[22px] sm:py-[10px] text-[0.75rem] sm:text-[0.82rem]"
            style={{ 
              background: C.dk, 
              color: C.td1, 
              fontFamily: "'Nunito Sans',sans-serif" 
            }}
          >
            Get Kundali <span className="sm:hidden">— ₹999</span>
          </a>
        </div>
      </nav>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      {/* ════════════════════════════════
         HERO
      ════════════════════════════════ */}
      <section className="relative bg-[#2A0E00] text-white min-h-screen flex items-center overflow-hidden py-4 sm:py-8 lg:py-20">
        
        {/* Background gradients */}
        <div className="absolute w-[400px] lg:w-[600px] h-[300px] lg:h-[400px] bg-[radial-gradient(ellipse,rgba(130,55,0,.35),transparent)] top-[-80px] lg:top-[-120px] right-[-50px] lg:right-[-100px] rounded-full pointer-events-none" />
        <div className="absolute w-[350px] lg:w-[500px] h-[250px] lg:h-[300px] bg-[radial-gradient(ellipse,rgba(200,168,75,.1),transparent)] bottom-[-50px] lg:bottom-[-80px] left-[-50px] lg:left-[-80px] rounded-full pointer-events-none" />
        <StarCanvas id="heroC" style={{ opacity: 1 }} />

        <div className="max-w-7xl mx-auto px-5 lg:px-6 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-12 items-center">

            {/* ================= LEFT (TEXT) ================= */}
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left mt-10 lg:mt-0">

              {/* Tag */}
              <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#E2C06A] font-bold mb-4 lg:mb-4">
                ✦ India's Most Trusted Vedic Astrologer ✦
              </p>

              {/* Heading */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-tight mb-6 lg:mb-8">
                <span className="block">You’re not unlucky.</span>
                <span className="block italic text-[#E2C06A]">You’re just making moves at the wrong time</span>
                {/* <span className="block"></span> */}
                {/* <span className="block">to Hear It?</span> */}
              </h1>

              {/* Profile Card */}
              <div className="bg-white/5 border border-[#C8A84B]/30 rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 lg:mb-8 relative overflow-hidden text-left">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2C06A] to-transparent" />

                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[#3D1600] to-[#521F00] flex items-center justify-center text-xl border-2 border-[#C8A84B]/40 shadow-lg flex-shrink-0">
                  🔮
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="font-serif text-lg">Surbhi Gupta</h3>
                  <p className="text-xs lg:text-sm text-white/70 mb-2">
                    35+ years reading Kundalis · 15K+ readings
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {["PM Narendra Modi", "Bollywood Charts", "15K+ Clients"].map((t) => (
                      <span
                        key={t}
                        className="text-[9px] lg:text-[10px] font-bold px-2 py-1 rounded-full bg-[#C8A84B]/10 border border-[#C8A84B]/30 text-[#E2C06A]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Free Consultation */}
              <div className="bg-green-900/20 border border-green-400/30 rounded-xl p-3 lg:p-4 flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8 text-left">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  🎁
                </div>

                <div>
                  <p className="text-green-200 font-semibold text-xs lg:text-sm">
                    1 FREE question answered via WhatsApp
                  </p>
                  <p className="text-green-200/70 text-[10px] lg:text-xs">
                    Ask your most important question directly
                  </p>
                </div>

                <span className="ml-auto text-[10px] lg:text-xs font-bold bg-green-300 text-green-900 px-2 lg:px-3 py-1 rounded-full">
                  FREE
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 flex-wrap">
                <span className="line-through text-white/40 text-sm">₹2,999</span>
                <span className="text-4xl font-serif">₹999</span>
                <span className="bg-red-600 px-2 py-1 text-[10px] lg:text-xs rounded font-bold">
                  67% OFF
                </span>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
  href="/checkout"
  className="btn-auto-shine w-full sm:w-auto bg-gradient-to-r from-[#C8A84B] to-[#E2C06A] px-8 py-3.5 lg:py-4 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition text-center text-[#2A0E00]"
>
  ✨ Get My Kundali
</a>

                <a
                  href="#what"
                  className="btn-auto-shine w-full sm:w-auto border border-white/20 px-6 py-3.5 lg:py-3 rounded-full text-sm hover:bg-white/10 transition text-center"
                >
                  What's inside ↓
                </a>
              </div>

              {/* Trust line */}
              <p className="text-[11px] lg:text-xs text-white/50 mt-5">
                🔒 Secure · PDF in 72 hrs · 100% private
              </p>
            </div>

            {/* ================= RIGHT (WHEEL & IMAGES) ================= */}
            {/* ================= RIGHT (WHEEL & IMAGES) ================= */}
            {/* ================= RIGHT (WHEEL & IMAGES) ================= */}
            <div className="reveal d2 relative flex justify-center items-start mt-8 lg:mt-0 mb-10 lg:mb-0 lg:-translate-y-12 w-full">
              
              {/* Main scalable container for the wheel */}
              {/* Decreased wheel size slightly to 420px so the image pops more */}
              <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[420px] aspect-square flex-shrink-0">
                
                {/* Spot Badge */}
                <div className="badge-float absolute -top-3 left-0 lg:top-4 lg:-left-6 z-20 bg-[#A82020] text-white text-[10px] lg:text-[0.75rem] font-extrabold tracking-wider px-3.5 py-2 rounded-full shadow-[0_4px_16px_rgba(168,32,32,0.4)]">
                  🔥 {spots} spots left
                </div>

                {/* SVG WHEEL */}
                <svg className="w-full h-full drop-shadow-[0_0_20px_rgba(200,168,75,0.15)] lg:drop-shadow-[0_0_40px_rgba(200,168,75,0.22)]" viewBox="0 0 460 460" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="wbg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#521F00" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#2A0E00" stopOpacity="0.9"/>
                    </radialGradient>
                  </defs>
                  <circle cx="230" cy="230" r="220" fill="url(#wbg)" stroke="rgba(200,168,75,0.25)" strokeWidth="1"/>
                  <g className="wheel-outer-ring">
                    <circle cx="230" cy="230" r="215" fill="none" stroke="rgba(200,168,75,0.15)" strokeWidth="0.5" strokeDasharray="4 8"/>
                    <g fill="rgba(200,168,75,0.5)" fontSize="11" fontFamily="serif" textAnchor="middle">
                      <text x="230" y="22">♈</text><text x="320" y="45">♉</text>
                      <text x="390" y="115">♊</text><text x="415" y="210">♋</text>
                      <text x="390" y="300">♌</text><text x="320" y="370">♍</text>
                      <text x="230" y="435">♎</text><text x="140" y="410">♏</text>
                      <text x="65"  y="345">♐</text><text x="32"  y="255">♑</text>
                      <text x="58"  y="160">♒</text><text x="128" y="82">♓</text>
                    </g>
                  </g>
                  <g className="wheel-mid-ring">
                    <circle cx="230" cy="230" r="185" fill="none" stroke="rgba(200,168,75,0.12)" strokeWidth="0.5"/>
                    <circle cx="230" cy="230" r="155" fill="none" stroke="rgba(200,168,75,0.08)" strokeWidth="0.5"/>
                  </g>
                  <g stroke="rgba(200,168,75,0.3)" strokeWidth="0.8">
                    <line x1="230" y1="45" x2="230" y2="415"/>
                    <line x1="45"  y1="230" x2="415" y2="230"/>
                    <line x1="90"  y1="90"  x2="370" y2="370"/>
                    <line x1="370" y1="90"  x2="90"  y2="370"/>
                    <line x1="37"  y1="155" x2="423" y2="305"/>
                    <line x1="37"  y1="305" x2="423" y2="155"/>
                    <line x1="155" y1="37"  x2="305" y2="423"/>
                    <line x1="305" y1="37"  x2="155" y2="423"/>
                  </g>
                  <g fill="rgba(200,168,75,0.45)" fontSize="11" fontFamily="Fraunces,serif" textAnchor="middle">
                    <text x="230" y="82">1</text><text x="310" y="105">2</text>
                    <text x="360" y="165">3</text><text x="372" y="240">4</text>
                    <text x="354" y="308">5</text><text x="305" y="362">6</text>
                    <text x="230" y="392">7</text><text x="155" y="365">8</text>
                    <text x="108" y="310">9</text><text x="95"  y="240">10</text>
                    <text x="112" y="170">11</text><text x="158" y="110">12</text>
                  </g>
                  <circle cx="230" cy="230" r="80" fill="rgba(42,14,0,0.8)" stroke="rgba(200,168,75,0.35)" strokeWidth="1.2"/>
                  <circle cx="230" cy="230" r="55" fill="rgba(42,14,0,0.6)" stroke="rgba(200,168,75,0.2)" strokeWidth="0.6"/>
                  <text x="230" y="242" fill="rgba(200,168,75,0.7)" fontSize="32" textAnchor="middle" fontFamily="serif">ॐ</text>
                  <g className="planet-dot">
                    <circle cx="230" cy="62" r="5" fill="#F5D98A" opacity="0.9"/>
                    <circle cx="230" cy="62" r="8" fill="rgba(245,217,138,0.2)"/>
                    <text x="243" y="60" fill="rgba(245,217,138,0.8)" fontSize="9" fontFamily="serif">☀</text>
                  </g>
                  <g className="planet-dot" style={{animationDelay:".5s"}}>
                    <circle cx="352" cy="142" r="4.5" fill="#E2C06A" opacity="0.85"/>
                    <circle cx="352" cy="142" r="7"   fill="rgba(226,192,106,0.2)"/>
                    <text x="360" y="140" fill="rgba(226,192,106,0.8)" fontSize="9" fontFamily="serif">☽</text>
                  </g>
                  <g className="planet-dot" style={{animationDelay:"1s"}}>
                    <circle cx="108" cy="142" r="4"   fill="#D4806A" opacity="0.8"/>
                    <circle cx="108" cy="142" r="6.5" fill="rgba(212,128,106,0.2)"/>
                    <text x="92"  y="140" fill="rgba(212,128,106,0.8)" fontSize="9" fontFamily="serif">♂</text>
                  </g>
                  <g className="planet-dot" style={{animationDelay:"1.5s"}}>
                    <circle cx="383" cy="230" r="5.5" fill="#C8A84B" opacity="0.85"/>
                    <circle cx="383" cy="230" r="9"   fill="rgba(200,168,75,0.2)"/>
                    <text x="392" y="228" fill="rgba(200,168,75,0.8)" fontSize="9" fontFamily="serif">♃</text>
                  </g>
                  <g className="planet-dot" style={{animationDelay:"2s"}}>
                    <circle cx="340" cy="330" r="4.5" fill="#A8C0D4" opacity="0.8"/>
                    <circle cx="340" cy="330" r="7"   fill="rgba(168,192,212,0.2)"/>
                    <text x="352" y="328" fill="rgba(168,192,212,0.7)" fontSize="9" fontFamily="serif">♀</text>
                  </g>
                  <g className="planet-dot" style={{animationDelay:"2.5s"}}>
                    <circle cx="78"  cy="298" r="4.5" fill="#9A9AB0" opacity="0.75"/>
                    <circle cx="78"  cy="298" r="7"   fill="rgba(154,154,176,0.2)"/>
                    <text x="62"  y="296" fill="rgba(154,154,176,0.7)" fontSize="9" fontFamily="serif">♄</text>
                  </g>
                  <polygon points="230,45 215,75 245,75" fill="rgba(200,168,75,0.15)" stroke="rgba(200,168,75,0.3)" strokeWidth="0.5"/>
                  <polygon points="415,230 385,215 385,245" fill="rgba(200,168,75,0.15)" stroke="rgba(200,168,75,0.3)" strokeWidth="0.5"/>
                  <polygon points="230,415 215,385 245,385" fill="rgba(200,168,75,0.15)" stroke="rgba(200,168,75,0.3)" strokeWidth="0.5"/>
                  <polygon points="45,230 75,215 75,245" fill="rgba(200,168,75,0.15)" stroke="rgba(200,168,75,0.3)" strokeWidth="0.5"/>
                </svg>

                {/* DESKTOP ASTROLOGER IMAGE - Massively Increased Size */}
                <div className="hidden lg:block absolute lg:-right-24 top-[20%] -translate-y-1/2 z-10">
                  <div className="w-[340px] h-[460px] rounded-[24px] overflow-hidden border-[4px] border-[#C8A84B]/60 shadow-[0_30px_80px_rgba(0,0,0,0.7)] bg-[#2A0E00]">
                    <img src="/news/surbhi-gupta.JPG" alt="Surbhi Gupta" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-black/70 backdrop-blur-md -mt-5 p-4 rounded-b-[24px] text-center font-bold text-[#E2C06A] text-[1.1rem] border border-[#C8A84B]/30">
                    Surbhi Gupta
                  </div>
                </div>

                {/* MOBILE ASTROLOGER IMAGE */}
                <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] rounded-full overflow-hidden border-[3px] border-[#C8A84B]/60 shadow-2xl">
                    <img src="/news/surbhi-gupta.JPG" alt="Surbhi Gupta" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Report preview card - Scaled up and pushed right */}
                <div className="absolute right-0 lg:-right-12 -bottom-6 lg:-bottom-10 w-[140px] lg:w-[240px] bg-[#FCF7EE] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-[#E8D8B8] overflow-hidden z-20">
                  <div className="bg-[#3D1600] px-2 py-2 lg:px-4 lg:py-3 flex items-center gap-1.5 lg:gap-2.5">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#C8A84B] flex-shrink-0"/>
                    <div className="text-[8px] lg:text-[11px] font-bold text-[#FCF7EE]/50 tracking-wider uppercase leading-tight">Your Kundali</div>
                    <div className="ml-auto text-[8px] lg:text-[10px] bg-[#C8A84B]/20 text-[#E2C06A] px-2 py-1 rounded-full font-bold">100+ pg</div>
                  </div>
                  <div className="p-2 lg:p-4 blur-[2px]">
                    {[100,85,100,70,85,100,55].map((w,i)=>(
                      <div key={i} className="h-1 lg:h-2 bg-[#E8D8B8] rounded-full mb-1 lg:mb-2" style={{width:`${w}%`}}/>
                    ))}
                  </div>
                  <div className="text-center text-[8px] lg:text-[11px] text-[#9A7A58] pb-2 lg:pb-3 italic leading-tight px-1">
                    Sample — your name & chart here
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          TRUST TICKER
      ════════════════════════════════ */}
      <div className="ticker-wrap" style={{ background:C.iv2,borderTop:`1px solid ${C.iv3}`,borderBottom:`1px solid ${C.iv3}`,padding:"13px 0",overflow:"hidden",position:"relative",zIndex:1 }}>
        <div className="ticker-row">
          {[
            ["⭐","4.9/5","· 1,200+ Google reviews"],
            ["🏛️","Prepared chart for","PM Narendra Modi"],
            ["🎁","1 Free question answered on Whatsapp","with every report"],
            ["📖","100+ pages","hand-written by Surbhi ji"],
            ["⚡","Delivered in","72 hours"],
            ["🔮","35+ years","of Vedic Jyotish practice"],
            ["🎬","Trusted by","top Bollywood stars"],
          ].flatMap((item, i) => [
            <div key={`ti-${i}`} style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0,fontSize:".78rem",fontWeight:600,color:C.t3 }}>
              {item[0]} <strong style={{ color:C.t1 }}>{item[1]}</strong> {item[2]}
            </div>,
            <div key={`ts-${i}`} style={{ color:C.iv4,flexShrink:0 }}>·</div>,
          ]).concat(
            /* duplicate for seamless loop */
            [
              ["⭐","4.9/5","· 1,200+ Google reviews"],
              ["🏛️","Prepared chart for","PM Narendra Modi"],
              ["🎁","1 Free question answered on Whatsapp","with every report"],
              ["📖","100+ pages","hand-written by Surbhi ji"],
              ["⚡","Delivered in","72 hours"],
              ["🔮","35+ years","of Vedic Jyotish practice"],
              ["🎬","Trusted by","top Bollywood stars"],
            ].flatMap((item, i) => [
              <div key={`ti2-${i}`} style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0,fontSize:".78rem",fontWeight:600,color:C.t3 }}>
                {item[0]} <strong style={{ color:C.t1 }}>{item[1]}</strong> {item[2]}
              </div>,
              <div key={`ts2-${i}`} style={{ color:C.iv4,flexShrink:0 }}>·</div>,
            ])
          )}
        </div>
      </div>

 {/* ════════════════════════════════
          PROBLEM — EDITORIAL
      ════════════════════════════════ */}
      <section className="relative overflow-hidden py-4 sm:py-8 " style={{ background: C.iv }}>
        {/* Hide giant background moon on mobile to prevent overflow */}
        <div className="hidden lg:block absolute right-[-60px] top-[20%] -translate-y-1/2 text-[32rem] pointer-events-none select-none leading-none" style={{ color: C.g, opacity: .018 }}>☽</div>
        
        <div className="max-w-[1100px] mx-auto px-5 lg:px-7">
          
          {/* TOP SECTION: 2-Column Grid (Editorial Text + Sticky Letter) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-[80px] items-start">

            {/* Left editorial */}
            <div>
              <div className="reveal inline-flex items-center gap-2 text-[10px] sm:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4" style={{ color: C.g, background: "rgba(200,168,75,.1)", border: "1px solid rgba(200,168,75,.28)" }}>
                ✦ Something You Already Know
              </div>
              <h2 className="fraunces reveal d1 text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em] mb-5 lg:mb-6" style={{ color: C.t1 }}>
                Why is this happening to<em style={{ fontStyle: "italic", color: C.g2 }}> me?</em>
              </h2>
              <div className="reveal d1 w-[50px] h-[2px] rounded-sm mb-6 lg:mb-7" style={{ background: `linear-gradient(90deg,${C.g},${C.g2})` }}/>

              <p className="reveal d2 text-[1rem] lg:text-[1.04rem] leading-[1.8] lg:leading-[1.88] mb-5 lg:mb-6 font-light" style={{ color: C.t2 }}>
                You already know something is off.
Your career keeps hitting the same invisible wall. You earn, but money doesn't stay. You meet people, but the relationship always ends the same way. You work hard, but someone else always seems to move forward faster.
              </p>
              <p className="reveal d2 text-[1rem] lg:text-[1.04rem] leading-[1.8] lg:leading-[1.88] mb-5 lg:mb-6 font-light" style={{ color: C.t2 }}>
                You've told yourself it's bad luck. Or bad timing. Or that you're not trying hard enough.
It's none of those things., your birth report will tell you exactly why this is happening, and when this loop will stop, and what you should do to stop this
              </p>

              <div className="reveal d2 my-6 lg:my-8 py-5 px-5 lg:px-6 rounded-r-xl" style={{ borderLeft: `3px solid ${C.g}`, background: "rgba(200,168,75,.05)" }}>
                <p className="fraunces text-lg lg:text-[1.28rem] italic leading-[1.55] m-0" style={{ color: C.t1 }}>
                  "You've tried therapy. You've read books. You've worked harder. And still, some part of your life feels like it's running on a script <em style={{ color: C.g }}>you didn't write.</em>"
                </p>
              </div>

              <p className="reveal d3 text-[1rem] lg:text-[1.04rem] leading-[1.8] lg:leading-[1.88] mb-5 lg:mb-6 font-light" style={{ color: C.t2 }}>
                Vedic astrology offers a specific, 5,000-year-old answer: <strong style={{ color: C.t1 }}>you were born into a pattern.</strong> Every planet, every house, every dasha period — together they form a blueprint of who you are, what you're here to do, and what's holding you back.
              </p>
              <p className="reveal d3 text-[1rem] lg:text-[1.04rem] leading-[1.8] lg:leading-[1.88] font-light" style={{ color: C.t2 }}>
                The reason you've felt unresolved isn't a personal failure. It's that nobody has read <em>your specific chart</em> with depth. Generic online Kundalis give you a software printout. Sun-sign horoscopes are written for one-twelfth of humanity. Neither knows you.
              </p>
            </div>

            {/* Right letter card */}
            <div>
              <div className="reveal d2 bg-white rounded-2xl lg:rounded-[26px] p-6 lg:p-7 shadow-[0_8px_36px_rgba(42,14,0,.13)] sticky top-20 lg:top-[88px]" style={{ border: `1px solid ${C.iv3}` }}>
                <div className="w-[70px] h-[70px] lg:w-[90px] lg:h-[90px] rounded-full mx-auto mb-3 lg:mb-4 overflow-hidden relative" style={{ border: "2.5px solid rgba(200,168,75,.45)", boxShadow: "0 0 0 6px rgba(200,168,75,.07)", background: C.dk2 }}>
                  <img src="/news/surbhi-gupta.JPG" alt="Surbhi Gupta" className="w-full h-full object-cover object-center" />
                </div>
                <div className="fraunces text-lg lg:text-[1.15rem] text-center mb-0.5" style={{ color: C.t1 }}>Surbhi Gupta</div>
                <div className="text-[10px] lg:text-[0.66rem] font-bold tracking-[0.14em] uppercase text-center mb-4 lg:mb-5" style={{ color: C.g }}>Vedic Jyotish Expert · 35 years</div>
                
                <div className="fraunces text-[0.9rem] lg:text-[0.96rem] italic leading-[1.72] pt-4 border-t" style={{ color: C.t2, borderTopColor: C.iv3 }}>
                  <p className="mb-4">"In 35 years of reading charts, the one thing that strikes me again and again is this — people already sense their own patterns. They just don't have the language for it yet.</p>
                  <p className="mb-4">When I read your chart, I'm not telling you something foreign. I'm handing you a mirror that reflects something you've always felt but couldn't name.</p>
                  <p className="mb-0">That is what a real Kundali does. Not predict your fate — illuminate your nature."</p>
                </div>
                
                <div className="mt-5 pt-4 border-t flex items-center gap-2.5 fraunces text-[1rem] lg:text-[1.1rem]" style={{ borderTopColor: C.iv3, color: C.t1 }}>
                  <div className="flex-1 h-[1px]" style={{ background: C.iv3 }}/>
                  Surbhi Gupta
                  <div className="flex-1 h-[1px]" style={{ background: C.iv3 }}/>
                </div>
                
                <div className="grid grid-cols-2 gap-2 lg:gap-2 mt-4 lg:mt-[18px]">
                  {[["15K+","Readings"],["4.9★","Google Rating"],["35+","Yrs Practice"],["100+","Pages / Report"]].map(([n,l])=>(
                    <div key={l} className="rounded-md p-2 lg:p-2.5 text-center" style={{ background: C.iv2, border: `1px solid ${C.iv3}` }}>
                      <span className="fraunces text-[1.2rem] lg:text-[1.5rem] block leading-none" style={{ color: C.g }}>{n}</span>
                      <span className="text-[10px] lg:text-[0.64rem] mt-1 block" style={{ color: C.t3 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: Full-width Pain Point Cards */}
          <div className="mt-4 lg:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {[
                { 
                  icon: "😰", 
                  title: "I work very hard, still not able to get that promotion", 
                  text: "There's a Kundali explanation — and a specific dasha window — for why this keeps happening and when it finally breaks open." 
                },
                { 
                  icon: "💔", 
                  title: "You attract the same person who doesn't deserve you", 
                  text: "Your 7th house and Venus placement explain why, precisely. And exactly what kind of connection would actually work for you." 
                },
                { 
                  icon: "⏳", 
                  title: "You feel scared, everyone around you is making progress", 
                  text: "Your Mahadasha sequence has an answer. The current weight might be the end of a difficult period — not the beginning." 
                },
              ].map((p, i) => (
                <div 
                  key={i} 
                  className={`pi-card reveal${i>0?" d"+i:""} flex flex-col items-center text-center p-6 lg:p-8 bg-white rounded-2xl`} 
                  style={{ border: `1px solid ${C.iv3}`, boxShadow: "0 6px 24px rgba(42,14,0,.06)" }}
                >
                  <span className="text-4xl lg:text-5xl flex-shrink-0 mb-4">{p.icon}</span>
                  <div>
                    <h4 className="text-[1rem] lg:text-[1.1rem] font-bold mb-3 leading-snug" style={{ color: C.t1 }}>{p.title}</h4>
                    <p className="text-[0.85rem] lg:text-[0.9rem] leading-[1.65] m-0" style={{ color: C.t2 }}>{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="#offer" className="mt-4 btn-auto-shine oc-cta-btn flex items-center justify-center w-full p-4 lg:p-[17px] rounded-full font-bold text-[0.9rem] lg:text-[0.98rem] tracking-[0.02em] no-underline mb-2.5 lg:mb-[10px]"style={{
              fontFamily: "'Nunito Sans',sans-serif",
              background: `linear-gradient(135deg,${C.g} 0%,${C.g2} 55%,${C.g} 100%)`, // Gold button pops perfectly on red
              color: C.dk, // Dark text on gold button for readability
              boxShadow: `0 12px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,.3)`,
            }}>
                  ✨ Want to view full report ? 
                </a>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════
          AUTHORITY — DARK
      ════════════════════════════════ */}
      <section className="relative overflow-hidden py-8 lg:py-[50px]" style={{ background: `linear-gradient(158deg,${C.dk} 0%,${C.dk2} 100%)` }}>
        <StarCanvas id="authC" />
        {/* Hide background symbols on mobile */}
        <div className="hidden lg:block absolute right-[-40px] top-[10%] text-[18rem] pointer-events-none leading-none font-serif" style={{ opacity: .03, color: C.g }}>♃</div>
        <div className="hidden lg:block absolute left-[-20px] bottom-[15%] text-[14rem] pointer-events-none leading-none font-serif" style={{ opacity: .03, color: C.g }}>♄</div>

        <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          {/* Responsive Grid: 1 column on mobile, 2 on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[80px] items-start">

            {/* Modi card */}
            {/* Modi card */}
            <div className="reveal rounded-2xl lg:rounded-[26px] overflow-hidden" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(200,168,75,.18)", boxShadow: "0 32px 80px rgba(42,14,0,.55)" }}>
              
              {/* IMAGE HEADER (Replaced Placeholder) */}
              <div className="w-full h-[200px] sm:h-[240px] lg:h-[280px] relative overflow-hidden" style={{ borderBottom: "1px solid rgba(200,168,75,.12)", background: C.dk2 }}>
                <img 
                  src="/narendra-modi-1.jpg" 
                  alt="Surbhi Gupta with PM Narendra Modi" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
                {/* Subtle dark gradient overlay at the bottom to blend with the card naturally */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(42,14,0,0.9) 0%, transparent 40%)" }} />
              </div>

              {/* CARD CONTENT */}
              <div className="p-6 lg:p-[26px]">
                <p className="fraunces text-[0.95rem] lg:text-[1.05rem] italic leading-[1.7] lg:leading-[1.72] mb-3 lg:mb-[14px] pl-3.5" style={{ color: C.td2, borderLeft: `2px solid ${C.g}` }}>
                  "When the nation's most consequential decisions are being considered, authentic Vedic Jyotish offers a dimension of clarity that transcends the conventional. Preparing the Prime Minister's Kundali remains one of the deepest honours of my practice."
                </p>
                <div className="text-[0.7rem] lg:text-[0.71rem] flex items-center gap-1.5" style={{ color: C.td4 }}>
                  <span style={{ color: C.g }}>—</span> Surbhi Gupta, on reading PM Modi's chart
                </div>
                <div className="flex flex-wrap gap-1.5 lg:gap-[7px] mt-4 lg:mt-[18px]">
                  {["🎬 Bollywood","💼 Industrialists","🏛️ Politicians","🏆 Athletes","📺 Media"].map(t=>(
                    <div key={t} className="rounded-md px-2 py-1.5 lg:px-[11px] lg:py-[7px] text-[10px] lg:text-[0.68rem] font-medium" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", color: C.td3 }}>{t}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Authority narrative */}
            <div className="reveal d1">
              <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>✦ Why Surbhi Gupta</div>
              <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em] mb-5 lg:mb-[22px]" style={{ color: C.td1 }}>
                The same reading that guides India's most powerful decisions<br/><em style={{ fontStyle: "italic", color: C.g2 }}>now available to you.</em>
              </h2>
              <div className="w-[50px] h-[2px] rounded-sm mb-6 lg:mb-[28px]" style={{ background: `linear-gradient(90deg,${C.g2},${C.g3})` }}/>
              
              <p className="text-[0.95rem] lg:text-[1rem] leading-[1.8] lg:leading-[1.85] mb-5 lg:mb-[22px] font-light" style={{ color: C.td2 }}>Anyone can offer an astrology reading. Very few are entrusted with the charts of people whose decisions shape the lives of millions. Surbhi Gupta is among that rarest group.</p>
              
              <div className="rounded-xl p-5 lg:p-[22px] my-6 lg:my-[28px]" style={{ background: "rgba(200,168,75,.08)", border: "1px solid rgba(200,168,75,.2)" }}>
                <div className="fraunces text-[1rem] lg:text-[1.1rem] italic leading-[1.6]" style={{ color: C.g3 }}>"The chart does not lie. It doesn't flatter you — it shows you. That's what makes it the most honest mirror you'll ever look into."</div>
                <div className="text-[10px] lg:text-[0.74rem] mt-2" style={{ color: C.td3 }}>— Surbhi Gupta, on the practice of Vedic Jyotish</div>
              </div>
              
              <p className="text-[0.95rem] lg:text-[1rem] leading-[1.8] lg:leading-[1.85] mb-5 lg:mb-[22px] font-light" style={{ color: C.td2 }}>Her approach is not sun-sign astrology. It's the full Vedic system — all 12 houses, 9 planets, the Navagraha, the specific Mahadasha period you're currently in, and the yogas unique to your exact birth moment.</p>
              
              <div className="grid grid-cols-3 gap-3 lg:gap-[14px] mb-7 lg:mb-[32px]">
                {[["35+","Years of study"],["15K+","Readings given"],["4.9★","Google rating"]].map(([n,l])=>(
                  <div key={l} className="rounded-xl p-3 lg:p-[14px] text-center" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                    <span className="fraunces text-xl sm:text-2xl lg:text-[2rem] block leading-none mb-1 lg:mb-[3px]" style={{ color: C.g2 }}>{n}</span>
                    <span className="text-[9px] lg:text-[0.68rem] font-medium block" style={{ color: C.td3 }}>{l}</span>
                  </div>
                ))}
              </div>
              
              <a href="#offer" className="btn-auto-shine btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 lg:px-[32px] lg:py-[15px] rounded-full text-[0.9rem] tracking-[0.025em] no-underline" style={{ fontFamily: "'Nunito Sans',sans-serif", background: `linear-gradient(135deg,${C.g} 0%,${C.g2} 55%,${C.g} 100%)`, color: "#fff", boxShadow: `0 12px 44px rgba(200,168,75,.28)` }}>
                Begin Your Reading — ₹999 →
              </a>
            </div>

          </div>
        </div>
      </section>

{/* ════════════════════════════════
          FREE CONSULTATION — DARK
      ════════════════════════════════ */}
      <section className="relative overflow-hidden py-4 sm:py-8 " style={{ background: `linear-gradient(155deg,${C.dk2} 0%,#3D1600 50%,${C.dk} 100%)` }}>
        {/* Hide large background blobs on mobile to prevent clipping/overflow issues */}
        <div className="hidden lg:block absolute top-[-100px] left-[-80px] w-[500px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(26,106,64,.1) 0%,transparent 65%)" }}/>
        <div className="hidden lg:block absolute bottom-[-60px] right-[-40px] w-[400px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(200,168,75,.06) 0%,transparent 65%)" }}/>
        <StarCanvas id="fcC" />

        <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          {/* Responsive Grid: Stacks on mobile, 1fr + 420px on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-[72px] items-center">
            
            <div className="reveal">
              <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 lg:mb-5" style={{ color: "#0E6040", background: "#D0F0E0", border: "1px solid rgba(26,106,64,.3)" }}>
                🎁 Included Free With Every Report
              </div>
              <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em] mb-5 lg:mb-[22px]" style={{ color: C.td1 }}>
                <em style={{ fontStyle: "italic", color: C.g2 }}>One question.</em><br/>Answered by Surbhi ji<br/>Personally on WhatsApp.
              </h2>
              <div className="w-[50px] h-[2px] rounded-sm mb-6 lg:mb-[28px]" style={{ background: `linear-gradient(90deg,${C.g2},${C.g3})` }}/>
              
              <p className="text-[0.95rem] lg:text-[1rem] leading-[1.8] lg:leading-[1.85] mb-6 lg:mb-[28px] font-light" style={{ color: C.td2 }}>
                Every Kundali Report comes with direct WhatsApp access to Surbhi ji herself. One question — career, love, money, health, anything — answered personally. Voice note or text. Not a team member. Not a template. Her.
              </p>
              
              <div className="flex flex-col gap-3.5 lg:gap-[14px]">
                {[
                  ["Any topic — from your report or beyond it"],
                  [<><strong style={{ color: "#B0F0D0" }}>Personal voice note or detailed text</strong> from Surbhi ji herself</>],
                  ["Replied within 24–48 hours of receiving your question"],
                  [<>Standalone consultation value: <strong style={{ color: "#B0F0D0" }}>₹1,500+</strong> — yours free</>],
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5 lg:gap-[12px] text-[0.8rem] lg:text-[0.84rem]" style={{ color: C.td2 }}>
                    <span className="text-[0.9rem] flex-shrink-0 mt-0.5" style={{ color: "#5DDAA0" }}>✓</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp card */}
            <div className="reveal d1 w-full max-w-[420px] mx-auto lg:mx-0">
              <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(42,14,0,.55)]" style={{ background: "#ECE5DD" }}>
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#075E54" }}>
                  <div className="w-9 h-9 lg:w-[38px] lg:h-[38px] rounded-full flex items-center justify-center text-[1.1rem] border-2 border-white/20" style={{ background: C.dk2 }}>🔮</div>
                  <div>
                    <div className="text-[0.8rem] lg:text-[0.82rem] font-bold text-white">Surbhi Gupta</div>
                    <div className="text-[0.65rem] lg:text-[0.68rem] text-white/70">Online · Typically replies within 24hrs</div>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col gap-2.5">
                  {/* User Bubble */}
                  <div className="rounded-[12px_12px_4px_12px] p-2.5 lg:p-[10px_14px] max-w-[85%] text-[0.75rem] lg:text-[0.8rem] leading-[1.5] ml-auto text-[#1a1a1a]" style={{ background: "#DCF8C6" }}>
                    Surbhi ji, I've read the report. My question is — I'm deciding between staying in my current job or starting my own venture. What does my chart say about this period for business?
                    <div className="text-[0.6rem] lg:text-[0.65rem] text-[#999] mt-1 text-right">2:14 PM ✓✓</div>
                  </div>
                  
                  {/* Typing Indicator */}
                  <div className="bg-white rounded-[12px_12px_12px_4px] p-2.5 lg:p-[10px_14px] flex items-center gap-1 w-[60px]">
                    <div className="wt-dot-1 w-1.5 h-1.5 lg:w-[7px] lg:h-[7px] rounded-full bg-[#999]"/>
                    <div className="wt-dot-2 w-1.5 h-1.5 lg:w-[7px] lg:h-[7px] rounded-full bg-[#999]"/>
                    <div className="wt-dot-3 w-1.5 h-1.5 lg:w-[7px] lg:h-[7px] rounded-full bg-[#999]"/>
                  </div>
                  
                  {/* Astrologer Voice Note Bubble */}
                  <div className="bg-white rounded-[12px_12px_12px_4px] p-2.5 lg:p-[10px_14px] max-w-[85%] text-[0.75rem] lg:text-[0.8rem] leading-[1.5] text-[#1a1a1a]">
                    🎙 Voice note (2 min 34 sec)
                    <div className="text-[0.6rem] lg:text-[0.65rem] text-left text-[#555] mt-1">Surbhi Gupta · 2:47 PM</div>
                  </div>
                  
                  {/* Astrologer Text Bubble */}
                  <div className="bg-white rounded-[12px_12px_12px_4px] p-2.5 lg:p-[10px_14px] max-w-[85%] text-[0.7rem] lg:text-[0.74rem] text-[#555] italic leading-[1.5]">
                    "Your Jupiter Mahadasha begins in 8 months — this is the most significant window for new ventures in your chart for the next 16 years..."
                  </div>
                </div>
                
                <div className="text-white text-center p-3.5 text-[0.75rem] lg:text-[0.8rem] font-bold cursor-pointer" style={{ background: "#25D366" }}>
                  📱 This is what your free consultation looks like
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          WHAT YOU GET
      ════════════════════════════════ */}
      <section className="relative bg-[#FCF7EE] py-4 sm:py-8 lg:py-8 overflow-hidden" id="what">
        
        {/* Background Symbol hidden on mobile to prevent horizontal scrolling */}
        <div className="hidden lg:block absolute -left-20 -bottom-20 text-[30rem] opacity-[0.02] pointer-events-none text-[#C8A84B]">
          ☸
        </div>

        <div className="max-w-7xl mx-auto px-5 lg:px-6">

          {/* HEADER */}
          <div className="text-center mb-12 lg:mb-20">
            <div className="inline-block mb-3 lg:mb-4 bg-[#C8A84B]/10 border border-[#C8A84B]/30 px-3 py-1 lg:px-4 lg:py-1 rounded-full text-[10px] lg:text-xs font-bold tracking-widest uppercase text-[#C8A84B]">
              ✦ Inside Your Report
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#2A1400] max-w-2xl mx-auto">
              Most people realize this too late<br />
              <span className="italic text-[#E2C06A]">
                don’t be one of them.
              </span>
            </h2>

            <p className="text-[#4A2E10] mt-3 lg:mt-4 max-w-xl mx-auto text-[0.9rem] sm:text-sm md:text-base leading-relaxed">
              100+ pages, personally prepared. Each section goes beyond describing a life area —
              it answers the real questions you carry.
            </p>
          </div>

          {/* GRID LAYOUT */}
          <div className="grid gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "💼",
                title: "Professional Life",
                sub: "Career · Purpose · Direction",
                hook: "Why does my career keep hitting this ceiling — and is there a field where I would actually thrive?",
                badge: "✦ 8–10 Pages",
              },
              {
                icon: "🔮",
                title: "10-Year Predictions",
                sub: "2025–2035",
                hook: "Which years are actually mine — when do I stop pushing and start flowing?",
                badge: "✦ 15–20 Pages",
              },
              {
                icon: "❤️",
                title: "Love Life",
                sub: "Relationships · Patterns",
                hook: "Why do I keep attracting the same kind of person?",
                badge: "✦ 8–10 Pages",
              },
              {
                icon: "💰",
                title: "Finance",
                sub: "Wealth · Timing",
                hook: "Why doesn’t wealth stay even when I earn well?",
                badge: "✦ 8–10 Pages",
              },
              {
                icon: "👨‍👩‍👧",
                title: "Family Life",
                sub: "Marriage · Dynamics",
                hook: "Why are some family relationships so difficult?",
                badge: "✦ 6–8 Pages",
              },
              {
                icon: "🌿",
                title: "Health",
                sub: "Vitality · Risks",
                hook: "Which areas of health need attention in my life?",
                badge: "✦ 6–8 Pages",
              },
              {
                icon: "🧘",
                title: "Personality",
                sub: "Strengths · Blindspots",
                hook: "What are my natural strengths and hidden weaknesses?",
                badge: "✦ 6–8 Pages",
              },
              {
                icon: "☸️",
                title: "Life Purpose",
                sub: "Dharma · Karma",
                hook: "What am I truly meant to do in this life?",
                badge: "✦ 8–10 Pages",
              },
              {
                icon: "🎁",
                title: "1:1 Consultation",
                sub: "WhatsApp Access",
                hook: "Ask your most important question directly to Surbhi ji.",
                badge: "FREE",
                
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 lg:p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl
                  bg-white border border-[#E8D8B8] hover:bg-[#E6F5EE] border border-[#1A6A40]/30
                }`}
              >
                <div className="flex items-start gap-3.5 lg:gap-4 mb-3 lg:mb-4">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="font-serif font-bold text-[#2A1400] text-[1.05rem] lg:text-lg">
                      {item.title}
                    </h3>
                    <p className="text-[0.7rem] lg:text-xs font-semibold text-[#C8A84B]">
                      {item.sub}
                    </p>
                  </div>
                </div>

                <p className="text-[0.82rem] lg:text-sm text-[#4A2E10] italic leading-relaxed">
                  {item.hook}
                </p>

                <div className="mt-3.5 lg:mt-4 inline-block text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full bg-[#C8A84B]/10 text-[#C8A84B]">
                  {item.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          IN THE MEDIA (NEWS SNIPPETS)
      ════════════════════════════════ */}
      

     {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
    {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
      <section className="relative overflow-hidden py-4 sm:py-8" style={{ background: C.dk }}>
        <StarCanvas id="proofC" style={{ opacity: .5 }} />
        {/* Hide large floating symbols on mobile to prevent overflow/distraction */}
        <div className="hidden lg:block absolute right-[-30px] top-[20%] text-[24rem] opacity-[0.025] pointer-events-none leading-none font-serif" style={{ color: C.g }}>♀</div>
        <div className="hidden lg:block absolute left-[-20px] bottom-[25%] text-[18rem] opacity-[0.025] pointer-events-none leading-none font-serif" style={{ color: C.g }}>♂</div>

        {/* Global style injection just for hiding scrollbar in the carousel */}
        <style dangerouslySetInnerHTML={{ __html: `.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }` }} />

        <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          
          <div className="reveal text-center mb-10 lg:mb-[40px]">
            <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>✦ Real People. Real Shifts.</div>
            <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em]" style={{ color: C.td1 }}>
              15,000 Lives Touched.<br /><em style={{ fontStyle: "italic", color: C.g2 }}>Trusted by the Stars.</em>
            </h2>
          </div>

          {/* CELEBRITY CAROUSEL (Mobile Swipeable / Desktop Scrollable) */}
          <div className="reveal d1 mb-16 lg:mb-[80px]">
            <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8 max-w-[800px] mx-auto">
              <div className="h-[1px] flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(200,168,75,0.3))" }} />
              <div className="text-[0.65rem] lg:text-[0.8rem] font-bold tracking-[0.2em] uppercase text-center" style={{ color: C.g2 }}>Celebrity Consultations</div>
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
                  <img src={celeb.img} alt={celeb.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 z-0" />

                  {/* Dark Gradient Overlay for Text Readability */}
                  <div className="absolute inset-x-0 bottom-0 p-3 lg:p-5 z-20" style={{ background: "linear-gradient(to top, rgba(20,5,0,0.95) 0%, rgba(20,5,0,0.6) 60%, transparent 100%)" }}>
                    {/* <div className="text-[0.55rem] lg:text-[0.65rem] font-bold mb-1 tracking-wider uppercase" style={{ color: C.g }}>✦ {celeb.desc}</div> */}
                    {/* <div className="fraunces text-[0.9rem] lg:text-[1.2rem] font-bold text-white leading-tight">{celeb.name}</div> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
              <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          
          {/* Header */}
          <div className="reveal text-center mb-10 lg:mb-[52px]">
            <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>
              ✦ As Featured In
            </div>
            <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em]" style={{ color: C.td1 }}>
              Making Headlines.<br /><em style={{ fontStyle: "italic", color: C.g2 }}>Trusted by the Press.</em>
            </h2>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {[
              { id: 1, publisher: "The Times of India", date: "Oct 2024", img: "/news/001.jpg" },
              { id: 2, publisher: "Hindustan Times", date: "Sep 2024", img: "/news/002.jpg" },
              { id: 3, publisher: "Mid-Day", date: "Aug 2024", img: "/news/003.jpg" },
              { id: 4, publisher: "Zee News", date: "Jul 2024", img: "/news/004.jpg" },
              { id: 5, publisher: "Deccan Chronicle", date: "Jun 2024", img: "/news/005.jpg" },
              { id: 6, publisher: "India Today", date: "May 2024", img: "/news/006.jpg" },
              { id: 7, publisher: "The Tribune", date: "Apr 2024", img: "/news/007.jpg" },
              { id: 8, publisher: "NDTV", date: "Mar 2024", img: "/news/008.jpg" },
              { id: 9, publisher: "Firstpost", date: "Feb 2024", img: "/news/009.png" },
              { id: 5, publisher: "Deccan Chronicle", date: "Jun 2024", img: "/news/010.jpg" },
              { id: 6, publisher: "India Today", date: "May 2024", img: "/news/011.jpg" },
              { id: 7, publisher: "The Tribune", date: "Apr 2024", img: "/news/012.jpg" },
              { id: 8, publisher: "NDTV", date: "Mar 2024", img: "/news/012.jpg" },
              { id: 9, publisher: "Firstpost", date: "Feb 2024", img: "/news/013.jpg" },
            ]
              // If showAllNews is false, only show the first 6. If true, show all.
              .slice(0, showAllNews ? 9 : 6)
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
                    
                    <img 
                      src={news.img} 
                      alt={`News snippet from ${news.publisher}`} 
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 z-10"
                    />
                    
                    {/* Gradient Overlay for bottom text */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 z-20" style={{ background: "linear-gradient(to top, rgba(20,5,0,0.95) 0%, transparent 100%)" }} />
                  </div>

                  {/* Publisher Info (Overlayed at bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-30 flex items-end justify-between">
                    <div>
                      <div className="text-[0.6rem] lg:text-[0.65rem] font-bold tracking-wider uppercase mb-1" style={{ color: C.g }}>Media Coverage</div>
                      <div className="fraunces text-[1.05rem] lg:text-[1.15rem] font-bold text-white leading-tight">{news.publisher}</div>
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

          {/* View More Button */}
          {!showAllNews && (
            <div className="mt-10 lg:mt-14 flex justify-center">
              {/* <button 
                onClick={() => setShowAllNews(true)}
                className="flex items-center gap-2 px-6 py-3 lg:px-[30px] lg:py-[12px] rounded-full font-bold text-[0.8rem] lg:text-[0.85rem] tracking-[0.05em] uppercase transition-all hover:bg-white/5"
                style={{ 
                  color: C.g2, 
                  border: `1px solid ${C.g}`, 
                  fontFamily: "'Nunito Sans',sans-serif" 
                }}
              >
                View More Coverage ↓
              </button> */}
            </div>
          )}

        </div>
          {/* Responsive Grid: Stacks on mobile, 2 columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-5">
            
            {/* Featured */}
            <div className="story-card reveal col-span-1 lg:col-span-2 rounded-2xl lg:rounded-[26px] p-6 lg:p-[34px_30px] grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-[32px] items-start" style={{ background: "rgba(200,168,75,.07)", border: "1px solid rgba(200,168,75,.22)" }}>
              <div>
                <div className="flex items-center gap-3.5 lg:gap-[14px] mb-5 lg:mb-[22px]">
                  <div className="w-11 h-11 lg:w-[52px] lg:h-[52px] rounded-full flex-shrink-0 flex items-center justify-center text-[0.9rem] lg:text-[1rem] font-bold text-white border-2" style={{ background: "linear-gradient(135deg,#3D1600,#6B2C00)", borderColor: "rgba(200,168,75,.3)" }}>AM</div>
                  <div>
                    <div className="fraunces text-[0.95rem] lg:text-[1rem] mb-0.5" style={{ color: C.td1 }}>Aditya Mehta</div>
                    <div className="text-[0.65rem] lg:text-[0.7rem]" style={{ color: C.td4 }}>📍 Bangalore · IT Professional</div>
                  </div>
                </div>
                <div className="mb-4 lg:mb-[16px] tracking-[1px] text-[0.7rem] lg:text-[0.78rem]" style={{ color: C.g2 }}>★★★★★</div>
                <div className="fraunces text-[1.05rem] lg:text-[1.18rem] italic leading-[1.6] lg:leading-[1.72] mb-3.5 lg:mb-[14px]" style={{ color: C.td2 }}>"I've read three 'comprehensive' Kundalis before. All three were copy-paste software output. Surbhi ji's report described a specific emotional pattern in my career that I've never discussed with anyone — not even my therapist."</div>
                <div className="text-[0.75rem] lg:text-[0.8rem] leading-[1.6] lg:leading-[1.7]" style={{ color: C.td3 }}>What stood out: the accuracy of the planetary period analysis, and how the WhatsApp consultation helped him interpret one specific section for his current decision.</div>
                <div className="text-[0.6rem] lg:text-[0.65rem] mt-3.5 lg:mt-[14px] flex items-center gap-1.5" style={{ color: C.td4 }}>🔵 Verified Google Review</div>
              </div>
              
              <div className="rounded-xl p-5 lg:p-[18px_20px]" style={{ background: "rgba(200,168,75,.08)" }}>
                <div className="text-[0.6rem] lg:text-[0.64rem] font-bold tracking-[0.1em] uppercase mb-3 lg:mb-[10px]" style={{ color: C.g2 }}>What shifted for Aditya</div>
                {["Avoided a wrong career move with ₹8L salary cut", "Understood why 2023 felt so difficult (Sade Sati)", "Knew exactly when to negotiate his next raise", "Used WhatsApp Q&A to clarify his business timing"].map(t => (
                  <div key={t} className="flex items-start lg:items-center gap-2 lg:gap-[8px] text-[0.75rem] lg:text-[0.8rem] py-1.5 lg:py-[5px] border-b border-white/5" style={{ color: C.td2 }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 lg:mt-0" style={{ background: C.g }} />{t}
                  </div>
                ))}
              </div>
            </div>

            {/* Story 2 */}
            <div className="story-card reveal d1 rounded-2xl lg:rounded-[26px] p-6 lg:p-[34px_30px]" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div className="flex items-center gap-3.5 lg:gap-[14px] mb-5 lg:mb-[22px]">
                <div className="w-11 h-11 lg:w-[52px] lg:h-[52px] rounded-full flex-shrink-0 flex items-center justify-center text-[0.9rem] lg:text-[1rem] font-bold text-white border-2" style={{ background: "linear-gradient(135deg,#4a2010,#7a3818)", borderColor: "rgba(200,168,75,.3)" }}>NP</div>
                <div>
                  <div className="fraunces text-[0.95rem] lg:text-[1rem] mb-0.5" style={{ color: C.td1 }}>Neha Patil</div>
                  <div className="text-[0.65rem] lg:text-[0.7rem]" style={{ color: C.td4 }}>📍 Nashik · Teacher</div>
                </div>
              </div>
              <div className="mb-4 lg:mb-[16px] tracking-[1px] text-[0.7rem] lg:text-[0.78rem]" style={{ color: C.g2 }}>★★★★★</div>
              <div className="fraunces text-[0.95rem] lg:text-[1.05rem] italic leading-[1.6] lg:leading-[1.72] mb-3.5 lg:mb-[14px]" style={{ color: C.td2 }}>"The free WhatsApp consultation was something I almost didn't use. I thought it would be generic. She sent a six-minute voice note that specifically addressed my marriage timing question with the kind of detail I've never received anywhere."</div>
              <div className="text-[0.6rem] lg:text-[0.65rem] flex items-center gap-1.5" style={{ color: C.td4 }}>🔵 Verified Google Review</div>
            </div>

            {/* Story 3 */}
            <div className="story-card reveal d2 rounded-2xl lg:rounded-[26px] p-6 lg:p-[34px_30px]" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div className="flex items-center gap-3.5 lg:gap-[14px] mb-5 lg:mb-[22px]">
                <div className="w-11 h-11 lg:w-[52px] lg:h-[52px] rounded-full flex-shrink-0 flex items-center justify-center text-[0.9rem] lg:text-[1rem] font-bold text-white border-2" style={{ background: "linear-gradient(135deg,#1a5e30,#2a8040)", borderColor: "rgba(200,168,75,.3)" }}>RS</div>
                <div>
                  <div className="fraunces text-[0.95rem] lg:text-[1rem] mb-0.5" style={{ color: C.td1 }}>Rohan Sharma</div>
                  <div className="text-[0.65rem] lg:text-[0.7rem]" style={{ color: C.td4 }}>📍 Jaipur · Astrology student</div>
                </div>
              </div>
              <div className="mb-4 lg:mb-[16px] tracking-[1px] text-[0.7rem] lg:text-[0.78rem]" style={{ color: C.g2 }}>★★★★★</div>
              <div className="fraunces text-[0.95rem] lg:text-[1.05rem] italic leading-[1.6] lg:leading-[1.72] mb-3.5 lg:mb-[14px]" style={{ color: C.td2 }}>"I study astrology as a serious hobby — I know enough to spot shallow work immediately. Surbhi ji identified a specific planetary yoga in my chart that explains something I've wrestled with for thirty years."</div>
              <div className="text-[0.6rem] lg:text-[0.65rem] flex items-center gap-1.5" style={{ color: C.td4 }}>🔵 Verified Google Review</div>
            </div>
          </div>

         {/* Text Reviews Row (Replaced Video Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[16px] mt-6 lg:mt-[24px]">
            {[
              { 
                name: "Priya S.", 
                loc: "Mumbai", 
                text: "\"My career suddenly made sense. The detailed dasha breakdown showed exactly why I felt stuck for 3 years, and when the block would lift.\"" 
              },
              { 
                name: "Meera R.", 
                loc: "Hyderabad", 
                text: "\"The WhatsApp reply changed my decision. Surbhi ji's voice note was so specific to my chart, it saved me from a terrible business partnership.\"" 
              },
              { 
                name: "Vikram K.", 
                loc: "Pune", 
                text: "\"I finally understood the pattern. 100+ pages of pure, specific insight. Not the generic software fluff you get on other sites.\"" 
              },
            ].map((v, i) => (
              <div 
                key={i} 
                className={`reveal${i > 0 ? " d" + i : ""} relative flex flex-col justify-between overflow-hidden rounded-[18px] shadow-[0_8px_36px_rgba(42,14,0,.13)] p-6 lg:p-[28px_24px] transition-transform duration-300 hover:-translate-y-1.5`} 
                style={{ background: C.dk2, border: "1px solid rgba(255,255,255,.07)" }}
              >
                {/* Decorative Quote Icon Background */}
                <div className="absolute top-2 right-4 text-[5rem] font-serif leading-none pointer-events-none" style={{ color: C.g2, opacity: 0.04 }}>
                  "
                </div>
                
                <div>
                  <div className="text-[0.7rem] lg:text-[0.75rem] mb-3.5 tracking-[1.5px]" style={{ color: C.g2 }}>★★★★★</div>
                  <div className="text-[0.85rem] lg:text-[0.92rem] italic leading-[1.7]" style={{ color: "rgba(255,255,255,.85)" }}>
                    {v.text}
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-[24px] pt-4 border-t" style={{ borderColor: "rgba(255,255,255,.08)" }}>
                  <div className="text-[0.85rem] lg:text-[0.9rem] font-bold text-white mb-0.5">{v.name}</div>
                  <div className="text-[0.65rem] lg:text-[0.7rem]" style={{ color: C.td4 }}>{v.loc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal flex justify-center mt-8 lg:mt-[36px]">
            <div className="inline-flex items-center gap-3 lg:gap-[14px] rounded-full p-2.5 px-5 lg:p-[12px_26px]" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }}>
              <span className="text-lg lg:text-[1.2rem]">🔵</span>
              <div className="text-[0.65rem] lg:text-[0.76rem]" style={{ color: C.td3 }}>
                <strong className="block text-[0.75rem] lg:text-[0.87rem]" style={{ color: C.td1 }}>Google Reviews · 4.9 / 5.0</strong>
                1,200+ verified client reviews across India
              </div>
              <div className="text-[0.8rem] lg:text-[0.95rem] tracking-[1px] hidden sm:block" style={{ color: C.g2 }}>★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          OFFER — DARK
      ════════════════════════════════ */}
      <section id="offer" className="relative overflow-hidden py-4 sm:py-8" style={{ background: `linear-gradient(150deg,${C.dk} 0%,${C.dk2} 50%,#2A0E00 100%)` }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 45% at 50% 0%,rgba(200,168,75,.07) 0%,transparent 55%)" }} />
        <StarCanvas id="offerC" />
        
        <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          <div className="reveal text-center mb-10 lg:mb-[52px]">
            <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 lg:mb-[16px]" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>✦ Limited Launch Offer</div>
            <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em]" style={{ color: C.td1 }}>
              You’ve tried everything<br /><em style={{ fontStyle: "italic", color: C.g2 }}>except understanding your timing.</em>
            </h2>
          </div>

          {/* Responsive Grid: Stacks on mobile, 1fr + 390px on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-10 lg:gap-[52px] items-start">
            
            {/* Left narrative */}
            <div className="reveal order-2 lg:order-1">
              <p className="text-[0.95rem] lg:text-[0.98rem] leading-[1.8] lg:leading-[1.85] mb-5 lg:mb-[22px] font-light" style={{ color: C.td2 }}>You've spent more than ₹999 on a single evening out. On a book you didn't finish. On a course you never completed. This is 100+ pages prepared personally for you — the only document in existence about your specific chart — plus direct personal access to India's most trusted Vedic astrologer.</p>

              <div className="flex flex-col gap-3 lg:gap-[12px] mb-6 lg:mb-[28px]">
                {[
                  { ico: "📖", title: "Complete 100+ Page Kundali Report", sub: "All 10 life domains, personally prepared by Surbhi Gupta", val: "₹2,499", fc: false },
                  { ico: "🎁", title: "1 Free Question Answered on WhatsApp", sub: "One question, answered personally by Surbhi ji — voice note or text, within 48 hours. Worth ₹11,000+ standalone.", val: "FREE", fc: true },
                ].map((vs, i) => (
                  <div key={i} className={`vs-row reveal${i > 0 ? " d" + i : ""} flex items-center gap-3 lg:gap-[14px] p-3.5 lg:p-[15px_18px] rounded-xl`} style={{ background: vs.fc ? "rgba(26,106,64,.06)" : "rgba(255,255,255,.04)", border: `1px solid ${vs.fc ? "rgba(80,200,140,.28)" : "rgba(255,255,255,.07)"}` }}>
                    <div className="w-10 h-10 lg:w-[42px] lg:h-[42px] rounded-lg flex-shrink-0 flex items-center justify-center text-[1rem] lg:text-[1.1rem]" style={{ background: vs.fc ? "rgba(26,106,64,.14)" : "rgba(200,168,75,.1)", border: `1px solid ${vs.fc ? "rgba(80,200,140,.28)" : "rgba(200,168,75,.2)"}` }}>{vs.ico}</div>
                    <div className="flex-1">
                      <h5 className="text-[0.8rem] lg:text-[0.86rem] font-bold mb-0.5 lg:mb-[2px]" style={{ color: C.td1 }}>{vs.title}</h5>
                      <p className="text-[0.65rem] lg:text-[0.73rem] leading-[1.4] lg:leading-[1.5] m-0" style={{ color: C.td3 }}>{vs.sub}</p>
                    </div>
                    <div className="text-[0.75rem] lg:text-[0.8rem] font-bold whitespace-nowrap" style={{ color: vs.fc ? "#A0F0C8" : C.g2 }}>{vs.val}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4 lg:p-[18px_20px] mb-5 lg:mb-[20px]" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
                {[
                  { l: "Report + Predictions", r: "₹2,998", strike: true },
                  { l: "Free Consultation Bonus", r: "₹1,500", strike: true },
                  { l: "Launch Discount", r: "−₹1,999", special: true },
                  { l: "You Pay Today", r: "₹999", total: true },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center" style={{ fontSize: row.total ? ".98rem" : ".79rem", fontWeight: row.total ? 700 : 400, color: row.total ? C.g2 : C.td3, padding: row.total ? "13px 0 5px" : "5px 0", borderTop: row.total ? "1px solid rgba(255,255,255,.08)" : "none", marginTop: row.total ? 8 : 0 }}>
                    <span>{row.l}</span>
                    <span style={{ textDecoration: row.strike ? "line-through" : "none", color: row.strike ? C.td4 : row.special ? "#A0F0C8" : undefined }}>{row.r}</span>
                  </div>
                ))}
              </div>

              <p className="text-[0.8rem] lg:text-[0.84rem] leading-[1.7] lg:leading-[1.85] font-light" style={{ color: C.td2 }}>
                ⚠️ <span className="font-bold" style={{ color: C.g2 }}>Why ₹999?</span> This is a one-time launch price to build 1,000 verified case studies. Once those 1,000 reports are delivered, the price returns permanently to ₹2,999.
              </p>
            </div>

            {/* Right Offer card - Sticky on Desktop */}
            <div className="reveal d1 order-1 lg:order-2 rounded-[22px] lg:rounded-[26px] overflow-hidden lg:sticky lg:top-[84px] shadow-2xl" style={{ background: C.iv, boxShadow: `0 36px 90px rgba(42,14,0,.55),0 0 0 1px rgba(200,168,75,.2)` }}>
              <div className="text-center p-4 lg:p-[18px_24px]" style={{ background: `linear-gradient(135deg,${C.g} 0%,${C.g2} 100%)` }}>
                <div className="text-[0.6rem] lg:text-[0.67rem] font-bold tracking-[0.1em] uppercase mb-0.5 lg:mb-[2px]" style={{ color: "rgba(42,14,0,.6)" }}>🔥 First 1,000 People Only</div>
                <div className="text-[0.85rem] lg:text-[0.94rem] font-bold" style={{ color: C.dk }}>Limited Launch Pricing</div>
              </div>
              
              <div className="p-5 lg:p-[24px_22px]">
                {/* Free consult row */}
                <div className="rounded-lg p-3 lg:p-[12px_14px] flex items-center gap-2.5 lg:gap-[10px] mb-4 lg:mb-[16px]" style={{ background: "linear-gradient(135deg,rgba(26,106,64,.12),rgba(26,106,64,.06))", border: "1.5px solid rgba(80,200,140,.32)" }}>
                  <span className="text-[1rem] lg:text-[1.15rem]">🎁</span>
                  <div className="flex-1">
                    <h6 className="text-[0.75rem] lg:text-[0.8rem] font-bold m-0 mb-0.5" style={{ color: "#0E6040" }}>1 Free Question Answered on WhatsApp</h6>
                    <p className="text-[0.65rem] lg:text-[0.7rem] m-0" style={{ color: C.t3 }}>Ask Surbhi ji directly · Worth ₹1,500+</p>
                  </div>
                  <div className="flex-shrink-0 text-[0.55rem] lg:text-[0.6rem] font-extrabold px-2 py-1 lg:px-[10px] lg:py-[4px] rounded-full tracking-[0.08em] uppercase whitespace-nowrap" style={{ background: "#CDFADF", color: "#0E5C35" }}>FREE</div>
                </div>

                <div className="flex items-baseline gap-2 lg:gap-[10px] mb-1 lg:mb-[6px]">
                  <span className="fraunces text-4xl lg:text-[3.2rem] leading-none" style={{ color: C.t1 }}>₹999</span>
                  <span className="text-[0.9rem] lg:text-[1rem] line-through" style={{ color: C.t4 }}>₹2,999</span>
                </div>
                
                <div className="flex gap-1.5 lg:gap-[7px] mb-2 lg:mb-[7px]">
                  <span className="inline-flex items-center gap-1 text-[0.6rem] lg:text-[0.67rem] font-extrabold px-2 py-1 lg:px-[10px] lg:py-[4px] rounded-full tracking-[0.05em] uppercase" style={{ background: "#FDECEA", color: C.red, border: "1px solid rgba(168,32,32,.2)" }}>67% OFF</span>
                  <span className="inline-flex items-center gap-1 text-[0.6rem] lg:text-[0.67rem] font-extrabold px-2 py-1 lg:px-[10px] lg:py-[4px] rounded-full tracking-[0.05em] uppercase" style={{ background: "#EEE8FF", color: "#5B35B0", border: "1px solid #C4B0F0" }}>LAUNCH PRICE</span>
                </div>
                
                <div className="text-[0.68rem] lg:text-[0.72rem] mb-4 lg:mb-[16px]" style={{ color: C.t3 }}>One-time payment · PDF in 72 hrs · Free consultation included</div>

                <div className="flex flex-col gap-2 mb-4 lg:mb-[16px]">
                  {[
                    { t: "100+ Page Personalised Report", fc: false },
                    { t: "All 10 Life Domains", fc: false },
                    { t: "10-Year Predictions (2025–2035)", fc: false },
                    { t: "Delivered as PDF in 72 Hours", fc: false },
                    { t: "1 FREE Question Answered on WhatsApp", fc: true },
                    { t: "100% Private & Confidential", fc: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start lg:items-center gap-2 text-[0.75rem] lg:text-[0.79rem] ${item.fc ? "font-bold" : "font-normal"}`} style={{ color: item.fc ? C.grn : C.t2 }}>
                      <span className="text-[0.8rem] lg:text-[0.82rem] mt-0.5 lg:mt-0 flex-shrink-0" style={{ color: item.fc ? "#1A6A40" : C.grn }}>{item.fc ? "🎁" : "✓"}</span>{item.t}
                    </div>
                  ))}
                </div>

                {/* Scarcity bar */}
                <div className="mb-4 lg:mb-[16px]">
                  <div className="flex justify-between text-[0.65rem] lg:text-[0.68rem] mb-1.5" style={{ color: C.t3 }}>
                    <span>Spots Claimed</span>
                    <span><strong>{1000 - spots}</strong> / 1,000</span>
                  </div>
                  <div className="h-1.5 lg:h-[5px] rounded-full overflow-hidden" style={{ background: C.iv3 }}>
                    <div className="scar-fill h-full rounded-full" style={{ width: `${((1000 - spots) / 10)}%`, background: `linear-gradient(90deg,${C.g},${C.g2})` }} />
                  </div>
                  <div className="text-[0.65rem] lg:text-[0.68rem] font-bold mt-1" style={{ color: C.red }}>⚠️ Only {spots} spots at ₹999</div>
                </div>

                <a href="/checkout" target="_blank" rel="noopener noreferrer" className="btn-auto-shine oc-cta-btn flex items-center justify-center w-full p-4 lg:p-[17px] rounded-full font-bold text-[0.9rem] lg:text-[0.98rem] tracking-[0.02em] no-underline mb-2.5 lg:mb-[10px]" style={{ background: `linear-gradient(135deg,${C.dk},${C.dk3})`, color: C.td1, fontFamily: "'Nunito Sans',sans-serif", boxShadow: "0 10px 32px rgba(42,14,0,.38)" }}>
                  ✨ Get Report + Free Consultation — ₹999
                </a>

                <div className="flex items-center justify-center gap-1.5 lg:gap-[7px] my-3 flex-wrap">
                  {["UPI", "GPay", "PhonePe", "Razorpay", "Net Banking"].map(p => (
                    <div key={p} className="rounded-[5px] px-2 py-1 text-[0.55rem] lg:text-[0.62rem] font-bold tracking-[0.03em]" style={{ background: C.iv2, border: `1px solid ${C.iv3}`, color: C.t3 }}>{p}</div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 rounded-lg p-2.5 lg:p-[9px_13px] mt-3 text-[0.65rem] lg:text-[0.72rem] font-semibold" style={{ background: "#E6F5EE", border: "1px solid rgba(26,106,64,.2)", color: C.grn }}>
                  🛡️ Secure payment · 72-hr delivery · Full confidentiality
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FAQ
      ════════════════════════════════ */}
      <section className="py-4 sm:py-8 " style={{ background: C.iv }}>
        <div className="max-w-[1100px] mx-auto px-5 lg:px-7">
          <div className="reveal text-center mb-10 lg:mb-[52px]">
            <div className="inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 lg:mb-[16px]" style={{ color: C.g, background: "rgba(200,168,75,.1)", border: "1px solid rgba(200,168,75,.28)" }}>✦ Honest Answers</div>
            <h2 className="fraunces text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.4] tracking-[-0.02em] text-center" style={{ color: C.t1 }}>
  No Vague Answers.<br /><em style={{ fontStyle: "italic", color: C.g2 }} className="leading-[1]" >Just the Truth.</em>
</h2>
          </div>
          
          <div className="max-w-[700px] mx-auto">
            <FaqItem q="What exactly can I ask in the free consultation?" a="One clear question on any topic your chart covers — career decisions, relationship timing, business moves, health concerns, financial windows, or something deeply personal. Surbhi ji replies personally by voice note or text on WhatsApp, typically within 24–48 hours. This is not a template response. It is her personal attention to your specific situation." delay="d1" />
            <FaqItem q="How accurate can astrology actually be?" a="Vedic astrology is a precise mathematical system developed over 5,000 years — not intuition or guesswork. Surbhi ji reads your complete chart: all 12 houses, 9 planets, dashas, and yogas together as one system. Accuracy comes from this holistic depth, not from one placement in isolation." delay="d2" />
            <FaqItem q="Is my birth information completely safe?" a="Completely. Your details are used only to prepare your report and are never shared or retained. Surbhi ji has handled readings for some of India's most prominent public figures. Absolute discretion is non-negotiable in her practice." />
            <FaqItem q="What if I don't know my exact birth time?" a="An approximate time works, though the exact time improves precision significantly. A birth certificate or parent's recollection is ideal. When uncertain, Surbhi ji uses chart rectification techniques and notes confidence levels clearly in your report." delay="d1" />
            <FaqItem q="Is this only for Hindus or people who believe in astrology?" a="Not at all. Vedic astrology is a mathematical and observational system — it doesn't require religious belief to be meaningful. Surbhi ji has clients across all communities, cities, and backgrounds across India and internationally." delay="d2" />
            <FaqItem q="What if I'm not satisfied with the report?" a="Surbhi ji stands behind every report personally. If specific sections feel unclear, reach out within 7 days and she will review and clarify those areas. The goal is genuine clarity — not a document you leave confused by." />
            <FaqItem q="Will the price genuinely increase after 1,000 orders?" a="Yes — this is a genuine, hard limit. ₹999 exists to build 1,000 verified testimonials during launch. Once 1,000 reports are delivered, the price returns permanently to ₹2,999. The counter reflects actual orders, not a marketing trick." delay="d1" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FINAL CTA
      ════════════════════════════════ */}
      <section className="relative overflow-hidden text-center py-4 sm:py-8 " style={{ background: `linear-gradient(155deg,${C.dk} 0%,${C.dk2} 50%,#3D1600 100%)` }}>
        {/* Hide large rings on mobile if they cause scroll issues, or keep them absolute */}
        <div className="fr-ring-1" /><div className="fr-ring-2" /><div className="fr-ring-3" />
        <StarCanvas id="finalC" style={{ opacity: 1 }} />
        
        <div className="max-w-[1100px] mx-auto px-5 lg:px-7 relative z-10">
          <div className="max-w-[700px] mx-auto">
            <div className="reveal inline-flex items-center gap-1.5 lg:gap-[7px] text-[10px] lg:text-[0.67rem] font-bold tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 lg:mb-[20px]" style={{ color: C.g3, background: "rgba(200,168,75,.12)", border: "1px solid rgba(200,168,75,.3)" }}>✦ Your Next Step</div>
            <br />
            <div className="reveal d1 inline-flex items-center gap-2 lg:gap-[10px] rounded-full px-4 py-2 lg:px-[22px] lg:py-[8px] mb-6 lg:mb-[26px] text-[0.65rem] lg:text-[0.75rem] font-bold" style={{ background: "rgba(26,106,64,.14)", border: "1.5px solid rgba(80,200,140,.32)", color: "#B0F0D0" }}>🎁 Report + Free Personal Consultation — ₹999 Only</div>
            
            <h2 className="fraunces reveal d2 text-3xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 lg:mb-[18px]" style={{ color: C.td1 }}>
              Your Life Has a Blueprint.<br /><em style={{ fontStyle: "italic", color: C.g2 }}>It's Time to Read It.</em>
            </h2>
            
            <p className="reveal d3 text-[0.95rem] lg:text-[1rem] leading-[1.8] lg:leading-[1.85] mb-8 lg:mb-[44px] font-light" style={{ color: C.td3 }}>You've felt it — that quiet sense of a larger pattern. Your Kundali is a 5,000-year system for understanding that pattern precisely. For ₹999, you get 100+ pages of it, plus direct personal access to the astrologer trusted when the stakes are highest.</p>

            <div className="reveal d4 flex flex-col items-center gap-3 lg:gap-[11px] mb-10 lg:mb-[50px] w-full">
  <a 
    href="#offer" 
    className="btn-auto-shine btn-shimmer flex sm:inline-flex items-center justify-center gap-2 lg:gap-[9px] w-full sm:w-auto px-8 py-4 lg:px-[62px] lg:py-[22px] rounded-full font-bold text-[0.95rem] lg:text-[1.08rem] tracking-[0.025em] no-underline" 
    style={{ 
      fontFamily: "'Nunito Sans',sans-serif", 
      background: `linear-gradient(135deg,${C.g} 0%,${C.g2} 55%,${C.g} 100%)`, 
      color: "#fff", 
      boxShadow: `0 12px 44px rgba(200,168,75,.28),inset 0 1px 0 rgba(255,255,255,.22)` 
    }}
  >
    ✨ Get Report + Free Consultation — <del className="opacity-60 mr-1.5 font-normal">₹2,999</del> ₹999
  </a>
  
  <div className="text-[0.65rem] lg:text-[0.72rem]" style={{ color: C.td4 }}>
    🔥 <strong style={{ color: C.red }}>Only {spots} spots left</strong> at launch price · 67% off
  </div>
  
  <div className="text-[0.65rem] lg:text-[0.72rem]" style={{ color: C.td4 }}>
    🔒 Secure · PDF in 72 hrs · Free WhatsApp consultation included
  </div>
</div>

            {/* Countdown */}
            <div className="reveal d5 flex items-center justify-center gap-2 lg:gap-[11px]">
              {[{ n: pad(countdown.h), l: "Hours" }, { n: pad(countdown.m), l: "Mins" }, { n: pad(countdown.s), l: "Secs" }].map((cd, i) => (
                <div key={`cd-wrapper-${cd.l}`} className="flex items-center gap-2 lg:gap-[11px]">
                  <div className="text-center rounded-lg min-w-[50px] lg:min-w-[60px]" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(200,168,75,.18)" }}>
                    <span className="fraunces block px-3 py-2 lg:px-[15px] lg:py-[11px] text-2xl lg:text-[2.1rem] leading-none" style={{ color: C.td1 }}>{cd.n}</span>
                    <span className="block text-[0.5rem] lg:text-[0.58rem] tracking-[0.1em] uppercase pb-1.5 lg:pb-[7px]" style={{ color: C.td4 }}>{cd.l}</span>
                  </div>
                  {i < 2 && <span className="text-xl lg:text-[1.8rem] pb-3 lg:pb-[18px]" style={{ color: C.td4 }}>:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer className="text-center p-8 lg:p-[36px_28px]" style={{ background: C.dk, borderTop: "1px solid rgba(200,168,75,.1)" }}>
        <div className="fraunces text-[1rem] lg:text-[1.18rem] italic mb-2.5 lg:mb-[10px]" style={{ color: C.g2 }}>Surbhi Gupta · Vedic Jyotish</div>
        <p className="text-[0.65rem] lg:text-[0.71rem] leading-[1.7] lg:leading-[1.9] max-w-[500px] mx-auto" style={{ color: C.td4 }}>
          © 2025 Surbhi Gupta Astrology. All rights reserved.<br />
          For guidance and informational purposes. Astrology complements, not replaces, professional advice in any domain.
        </p>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-[22px] mt-4 lg:mt-[14px]">
          {["Privacy Policy", "Terms", "Refund Policy", "Contact"].map(l => (
            <a key={l} href="#" className="text-[0.6rem] lg:text-[0.69rem] no-underline" style={{ color: C.td4 }}>{l}</a>
          ))}
        </div>
      </footer>

    </>
  );
}