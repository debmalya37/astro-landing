"use client";

import React, { useEffect, useRef, useState } from "react";

/* ─── COMPARISON SLIDER COMPONENT ─── */
function ComparisonSlider2() {
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
      className="relative w-full h-[600px] lg:h-[700px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none border-4 border-[#C8A84B]/20"
      onMouseDown={(e) => { setIsDragging(true); handleMove(e); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e); }}
      style={{ '--pos': `${sliderPos}%` } as React.CSSProperties}
    >
      
      {/* ==========================================
          AFTER IMAGE (Background Layer - Right Side) 
          ========================================== */}
      <div className="absolute inset-0 bg-[#0A1A10]">
        {/* Happy/Prosperous Background Image */}
        <img 
          src="/life-after.jpeg" 
          alt="Life After Kundali" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = "https://images.unsplash.com/photo-1571260899304-42507011ec6a?auto=format&fit=crop&q=80&w=1200&h=800"; // Fallback happy image
          }} 
        />
        
        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-12">
          
          {/* Top Right: After Text */}
          <div className="text-right max-w-sm ml-auto z-10 pl-12">
            <h3 className="fraunces text-2xl lg:text-4xl font-bold text-[#A0F0C8] mb-4 lg:mb-6">AFTER Premium Surbhi Kundali</h3>
            <ul className="space-y-4 lg:space-y-5">
              {[
                { t: "Crystal Clarity", d: "Understand exactly WHY things happen" },
                { t: "Wealth Aligned", d: "Know your lucky periods and remedies" },
                { t: "Love Restored", d: "Compatibility insights & planetary fixes" },
              ].map((l, i) => (
                <li key={i} className="flex flex-col items-end border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3"><h4 className="text-white font-bold text-base lg:text-lg">{l.t}</h4><span className="text-xl">✨</span></div>
                  <p className="text-white/70 text-xs lg:text-sm mt-1">{l.d}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Right: Floating Satisfied Review */}
          <div className="w-[280px] lg:w-[340px] ml-auto bg-white/10 backdrop-blur-md border border-[#A0F0C8]/30 rounded-2xl p-4 lg:p-5 shadow-2xl z-10 transform transition-transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex-shrink-0 border-2 border-white/20 flex items-center justify-center text-white font-bold fraunces text-lg shadow-inner">
                R
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm lg:text-base leading-none">Rahul V.</div>
                <div className="text-[#E2C06A] text-xs lg:text-sm mt-1 tracking-widest">★★★★★</div>
              </div>
            </div>
            <p className="text-white/90 text-xs lg:text-sm font-medium italic text-left leading-relaxed">
              "Everything finally makes sense. I followed the Gemstone remedies and within 3 months, my stalled promotion came through. Absolute magic!"
            </p>
          </div>

        </div>
      </div>

      {/* ==========================================
          BEFORE IMAGE (Foreground Clipped Layer - Left) 
          ========================================== */}
      <div className="absolute inset-0 bg-[#1A0505] clip-before border-r-[3px] border-[#C8A84B] z-20 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
        {/* Stressed/Gloomy Background Image */}
        <img 
          src="/life-before.jpeg" 
          alt="Life Before Kundali" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale"
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = "https://images.unsplash.com/photo-1541888062923-8686d13bdde7?auto=format&fit=crop&q=80&w=1200&h=800"; // Fallback stressed image
          }} 
        />
        
        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-12">
          
          {/* Top Left: Before Text */}
          <div className="text-left max-w-sm z-10 pr-12">
            <h3 className="fraunces text-2xl lg:text-4xl font-bold text-[#FF8080] mb-4 lg:mb-6">BEFORE Premium Surbhi Kundali </h3>
            <ul className="space-y-4 lg:space-y-5">
              {[
                { t: "Constant Confusion", d: "Not knowing why bad things happen" },
                { t: "Money Slipping Away", d: "Working hard but can't save wealth" },
                { t: "Relationship Struggles", d: "Arguments, loneliness, no understanding" },
              ].map((l, i) => (
                <li key={i} className="flex flex-col items-start border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3"><span className="text-xl">😰</span><h4 className="text-white font-bold text-base lg:text-lg">{l.t}</h4></div>
                  <p className="text-white/50 text-xs lg:text-sm mt-1">{l.d}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Left: Floating Frustrated Review */}
          <div className="w-[280px] lg:w-[340px] bg-black/40 backdrop-blur-md border border-[#FF8080]/30 rounded-2xl p-4 lg:p-5 shadow-2xl z-10 transform transition-transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-[#3A1010] to-black flex-shrink-0 border-2 border-white/10 flex items-center justify-center text-white/50 font-bold fraunces text-lg shadow-inner grayscale">
                A
              </div>
              <div className="text-left">
                <div className="text-white/80 font-bold text-sm lg:text-base leading-none">Anonymous</div>
                <div className="text-white/30 text-xs lg:text-sm mt-1 tracking-widest">★☆☆☆☆</div>
              </div>
            </div>
            <p className="text-white/60 text-xs lg:text-sm font-medium italic text-left leading-relaxed">
              "I was working so hard but nothing was clicking. Money kept draining, relationships were failing. I felt cursed and completely stuck in life..."
            </p>
          </div>

        </div>
      </div>

      {/* SLIDER HANDLE */}
      <div 
        className="absolute top-0 bottom-0 z-30 flex items-center justify-center slider-handle"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-10 h-10 lg:w-14 lg:h-14 bg-[#C8A84B] rounded-full shadow-[0_0_20px_rgba(200,168,75,0.6)] flex items-center justify-center text-[#2A0E00] font-bold border-4 border-white/90">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 lg:w-6 lg:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" transform="rotate(90 12 12)" />
          </svg>
        </div>
      </div>
    </div>
  );
}



export default ComparisonSlider2;