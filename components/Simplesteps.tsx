"use client";

import { useEffect, useRef, useState } from "react";

/* ─── 5 STEPS HORIZONTAL SCROLL TIMELINE COMPONENT ─── */
export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll listener to draw the horizontal golden line as user scrolls down the page
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Start animating when the section enters the bottom 75% of the screen
      const startOffset = windowHeight * 0.75;
      // Finish animating when the section reaches the top 25% of the screen
      const endOffset = windowHeight * 0.25;

      if (rect.top > startOffset) {
        setScrollProgress(0);
      } else if (rect.top < endOffset) {
        setScrollProgress(100);
      } else {
        const range = startOffset - endOffset;
        const current = startOffset - rect.top;
        setScrollProgress((current / range) * 100);
      }
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
    <section className="py-24 relative overflow-hidden" style={{ background: '#1A0A00' }}>
      
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
          <h2 className="fraunces text-4xl lg:text-5xl font-bold text-white">
            Your Kundali in <span className="italic text-[#E2C06A]">5 Simple Steps</span>
          </h2>
        </div>

        {/* Mobile Scroll Wrapper 
            On mobile, this allows horizontal swiping if the screen is too narrow, 
            keeping the premium wide layout intact. 
        */}
        <div className="w-full overflow-x-auto hide-scrollbar pb-10 -mx-5 px-5 md:mx-0 md:px-0 md:overflow-visible">
          
          <div ref={containerRef} className="relative min-w-[800px] md:min-w-full pt-4">
            
            {/* THE TRACK: Faint background line */}
            <div className="absolute left-[5%] right-[5%] top-10 h-[2px] bg-white/10 rounded-full"></div>
            
            {/* THE FILL: Glowing golden line that draws horizontally on scroll */}
            <div 
              className="absolute left-[5%] top-10 h-[2px] bg-gradient-to-r from-[#C8A84B] to-[#F5D98A] rounded-full shadow-[0_0_15px_#C8A84B] transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress * 0.9}%` }} // 0.9 matches the 5% to 95% track width
            >
              {/* Glowing "laser" point at the leading edge of the line */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FFF] rounded-full shadow-[0_0_20px_10px_rgba(226,192,106,0.6)]"></div>
            </div>

            {/* Timeline Items (Horizontal Flex) */}
            <div className="flex justify-between relative z-10">
              {steps.map((step, index) => {
                // Calculate at what percentage this step lights up
                const activationPoint = (index / (steps.length - 1)) * 100;
                const isActive = scrollProgress >= activationPoint - 5; // -5 gives a slight early activation

                return (
                  <div key={index} className="flex flex-col items-center text-center w-48 relative group">
                    
                    {/* Circle Node */}
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-500 delay-75 shadow-lg mb-6 relative z-10 ${
                      isActive 
                        ? "bg-[#D89F3C] border-[#F5D98A] text-[#2A0E00] shadow-[0_0_30px_rgba(226,192,106,0.5)] scale-110" 
                        : "bg-[#2A0E00] border-[#4A2E10] text-white/30 scale-100"
                    }`}>
                      {step.num}
                    </div>

                    {/* Step Icon */}
                    <div className={`text-3xl mb-4 transition-all duration-700 transform ${
                      isActive ? "opacity-100 translate-y-0 scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "opacity-20 translate-y-4 scale-90 grayscale"
                    }`}>
                      {step.icon}
                    </div>

                    {/* Text Content */}
                    <h3 className={`fraunces text-lg font-bold mb-2 transition-colors duration-500 ${
                      isActive ? "text-[#F5D98A]" : "text-white/40"
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs font-medium leading-relaxed transition-colors duration-500 px-2 ${
                      isActive ? "text-white/80" : "text-white/20"
                    }`}>
                      {step.desc}
                    </p>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
      
      {/* Hide Scrollbar CSS for the mobile swipe container */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

/* ─── HELPER CARD COMPONENT ─── */
function StepCard({ step, isActive, align }: { step: any, isActive: boolean, align: "left" | "right" }) {
  return (
    <div 
      className={`relative bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 w-full max-w-[400px] transition-all duration-700 ease-out transform ${
        isActive 
          ? "opacity-100 translate-y-0 shadow-[0_20px_40px_rgba(0,0,0,0.4)]" 
          : "opacity-30 translate-y-12 shadow-none"
      } ${
        // Adds a glowing border to the active card
        isActive ? "border-[#C8A84B]/40" : "border-white/5"
      }`}
    >
      <div className={`flex flex-col md:flex-row gap-5 items-start ${align === "right" ? "md:text-right md:flex-row-reverse" : "text-left"}`}>
        
        {/* Step Icon */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-[#2A0E00] to-[#1A0A00] border border-[#C8A84B]/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner transition-transform duration-500 ${isActive ? "scale-110" : "scale-100"}`}>
          <span className={isActive ? "opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "opacity-50 grayscale"}>
            {step.icon}
          </span>
        </div>

        {/* Text Content */}
        <div className="flex-1 mt-1">
          <h3 className={`fraunces text-xl lg:text-2xl font-bold mb-2 transition-colors duration-500 ${isActive ? "text-[#F5D98A]" : "text-white/50"}`}>
            {step.title}
          </h3>
          <p className="text-white/60 text-sm lg:text-base font-medium leading-relaxed">
            {step.desc}
          </p>
        </div>

      </div>
    </div>
  );
}