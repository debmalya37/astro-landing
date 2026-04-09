"use client";

import { useEffect, useRef, useState } from "react";

/* ─── 5 STEPS RESPONSIVE TIMELINE COMPONENT ─── */
export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll listener mapped to the actual height of the container
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Start animating when the top of the section hits 70% down the screen
      const startOffset = windowHeight * 0.7;
      
      // The distance it takes to fill the line is the height of the container
      const totalScrollRange = rect.height;
      
      const current = startOffset - rect.top;
      let progress = (current / totalScrollRange) * 100;
      
      // Clamp between 0 and 100
      progress = Math.max(0, Math.min(100, progress));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const steps = [
    { num: "1", title: "Enter Your Details", desc: "Name, DOB, Time & Place", icon: "📝" },
    { num: "2", title: "Birth Chart Created", desc: "Vedic chart generation", icon: "🗺️" },
    { num: "3", title: "Expert Analysis", desc: "Deep Vedic reading", icon: "🔭" },
    { num: "4", title: "Problems Identified", desc: "Dosh, Dasha & transit", icon: "🔍" },
    { num: "5", title: "Solutions Delivered", desc: "Remedies & predictions", icon: "✨" }
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: '#1A0A00' }}>
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[300px] bg-[#C8A84B] opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-5 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-24 reveal">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#C8A84B]"></div>
            <span className="text-[#C8A84B] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
              Simple & Fast
            </span>
            <div className="w-8 h-[1px] bg-[#C8A84B]"></div>
          </div>
          <h2 className="fraunces text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your Kundali in <span className="italic text-[#E2C06A] block sm:inline">5 Simple Steps</span>
          </h2>
        </div>

        {/* Timeline Container */}
        <div className="w-full relative pb-10">
          <div ref={containerRef} className="relative w-full pt-4">
            
            {/* =========================================
                THE TRACKS (Background Lines)
                ========================================= */}
            {/* Desktop Track (Horizontal) */}
            <div className="hidden md:block absolute left-[5%] right-[5%] top-10 h-[2px] bg-white/10 rounded-full"></div>
            
            {/* Mobile Track (Vertical - Shifted to left-6 to center behind the 48px circle) */}
            <div className="block md:hidden absolute left-6 top-[5%] bottom-[5%] w-[2px] bg-white/10 rounded-full"></div>

            {/* =========================================
                THE FILLS (Glowing Golden Lines)
                ========================================= */}
            {/* Desktop Fill (Horizontal) */}
            <div 
              className="hidden md:block absolute left-[5%] top-10 h-[2px] bg-gradient-to-r from-[#C8A84B] to-[#F5D98A] rounded-full shadow-[0_0_15px_#C8A84B] transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress * 0.9}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FFF] rounded-full shadow-[0_0_20px_10px_rgba(226,192,106,0.6)]"></div>
            </div>

            {/* Mobile Fill (Vertical - Shifted left to match track) */}
            <div 
              className="block md:hidden absolute left-6 top-[5%] w-[2px] bg-gradient-to-b from-[#C8A84B] to-[#F5D98A] rounded-full shadow-[0_0_15px_#C8A84B] transition-all duration-300 ease-out"
              style={{ height: `${scrollProgress * 0.9}%` }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFF] rounded-full shadow-[0_0_20px_10px_rgba(226,192,106,0.6)]"></div>
            </div>

            {/* =========================================
                TIMELINE ITEMS
                ========================================= */}
            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
              {steps.map((step, index) => {
                const activationPoint = (index / (steps.length - 1)) * 100;
                const isActive = scrollProgress >= activationPoint - 5; 

                return (
                  // Mobile: Flex-row (left to right). Desktop: Flex-col (top to bottom)
                  <div key={index} className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center w-full md:w-48 relative group">
                    
                    {/* Circle Node */}
                    <div className={`w-12 h-12 flex-shrink-0 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 delay-75 shadow-lg mr-6 md:mr-0 mb-0 md:mb-6 relative z-10 ${
                      isActive 
                        ? "bg-[#D89F3C] border-[#F5D98A] text-[#2A0E00] shadow-[0_0_30px_rgba(226,192,106,0.5)] scale-110" 
                        : "bg-[#2A0E00] border-[#4A2E10] text-white/30 scale-100"
                    }`}>
                      {step.num}
                    </div>

                    {/* Content Wrapper (Icon + Text side-by-side with circle on mobile) */}
                    <div className="flex flex-col items-start md:items-center flex-1 pt-1 md:pt-0">
                      {/* Step Icon */}
                      <div className={`text-3xl md:text-4xl mb-2 md:mb-4 transition-all duration-700 transform ${
                        isActive ? "opacity-100 translate-y-0 scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "opacity-20 translate-y-4 scale-90 grayscale"
                      }`}>
                        {step.icon}
                      </div>

                      {/* Text Content */}
                      <h3 className={`fraunces text-base md:text-lg font-bold mb-1 md:mb-2 transition-colors duration-500 ${
                        isActive ? "text-[#F5D98A]" : "text-white/40"
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs font-medium leading-relaxed transition-colors duration-500 px-0 md:px-2 ${
                        isActive ? "text-white/80" : "text-white/20"
                      }`}>
                        {step.desc}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}