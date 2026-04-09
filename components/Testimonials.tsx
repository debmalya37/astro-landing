"use client";

import { useEffect, useRef, useState } from "react";

export default function TestimonialsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const testimonials = [
    {
      name: "Nisha Sharma",
      loc: "Mumbai, Maharashtra",
      text: "I wasn't sure what to expect, but this report nailed things I've never told anyone. Finally found direction after years of confusion. Surbhi Ji's predictions about my marriage were exact to the month!"
    },
    {
      name: "Suresh Patel",
      loc: "Ahmedabad, Gujarat",
      text: "Tried so many apps — nothing worked. Got this Kundali, followed the remedies for 6 months and landed my dream job! The WhatsApp question feature is unbelievably accurate. Worth 10x the price."
    },
    {
      name: "Priya Mehta",
      loc: "Delhi, NCR",
      text: "Asked about my marriage timing on WhatsApp and Surbhi Ji's answer gave me goosebumps — it was that precise! My relationship has improved so much after following her guidance. Forever grateful!"
    },
    {
      name: "Rajiv Khanna",
      loc: "Bangalore, Karnataka",
      text: "My financial situation has turned around completely. The gemstone recommendation and specific puja guidance changed everything. Best ₹999 I've ever spent — I got back lakhs in return!"
    }
  ];

  // --- Auto Scroll Logic ---
  useEffect(() => {
    if (isHovered || isDragging) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        // If reached the end, snap back to start. Otherwise, scroll one card width.
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll by approx one card width (adjusts dynamically based on screen size)
          const cardWidth = clientWidth >= 768 ? clientWidth / 2 : clientWidth * 0.85;
          carouselRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }
    }, 2000); // Rotates every 4 seconds

    return () => clearInterval(interval);
  }, [isHovered, isDragging]);

  // --- Arrow Navigation ---
  const scrollNext = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth >= 768 ? carouselRef.current.clientWidth / 2 : carouselRef.current.clientWidth * 0.85;
      carouselRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth >= 768 ? carouselRef.current.clientWidth / 2 : carouselRef.current.clientWidth * 0.85;
      carouselRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  // --- Mouse Drag Logic for Desktop ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current!.offsetLeft);
    setScrollLeft(carouselRef.current!.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current!.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    carouselRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-4 md:py-12 bg-white relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8D8B8] to-transparent opacity-50"></div>

      <div className="max-w-[1200px] mx-auto relative z-10 px-4 sm:px-5">
        
        {/* Section Header with Navigation Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 reveal">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-8 md:w-10 h-[1px] bg-[#C8A84B]"></div>
              <span className="text-[#C8A84B] text-[9px] sm:text-xs font-medium tracking-[0.2em] uppercase">
                Our Happy Customers
              </span>
              <div className="hidden md:block w-8 md:w-10 h-[1px] bg-[#C8A84B]"></div>
            </div>
            <h2 className="fraunces text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2A1400] leading-tight">
              Real People. <br className="hidden md:block" />
              <span className="italic text-[#8B1E1E]">Real Transformations.</span>
            </h2>
          </div>

          {/* Desktop & Mobile Arrow Controls */}
          <div className="flex items-center justify-center gap-3 mt-6 md:mt-0">
            <button 
              onClick={scrollPrev} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#C8A84B]/40 flex items-center justify-center text-[#8B1E1E] hover:bg-[#C8A84B]/10 hover:border-[#C8A84B] transition-all shadow-sm active:scale-95"
              aria-label="Previous Testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button 
              onClick={scrollNext} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#C8A84B]/40 flex items-center justify-center text-[#8B1E1E] hover:bg-[#C8A84B]/10 hover:border-[#C8A84B] transition-all shadow-sm active:scale-95"
              aria-label="Next Testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div 
          ref={carouselRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); handleMouseUpOrLeave(); }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className={`flex overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-5 sm:px-5 gap-4 md:gap-6 lg:gap-8 snap-x snap-mandatory hide-scrollbar cursor-grab ${isDragging ? 'cursor-grabbing select-none snap-none' : ''}`}
        >
          {testimonials.map((testimonial, i) => (
            <div 
              key={i} 
              className="relative min-w-[85vw] sm:min-w-[400px] md:min-w-[calc(50%-12px)] lg:min-w-[calc(50%-16px)] snap-center bg-[#FFFBF0] rounded-[1.5rem] md:rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-[#E8D8B8]/60 shadow-[0_8px_30px_rgba(61,22,0,0.04)] hover:shadow-[0_20px_50px_rgba(61,22,0,0.08)] transition-all duration-500 group flex flex-col justify-between"
            >
              {/* Giant Decorative Quote Mark */}
              <div className="absolute top-2 left-4 md:top-4 md:left-6 text-6xl md:text-8xl text-[#E2C06A] opacity-15 font-serif leading-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                &ldquo;
              </div>

              <div className="relative z-10 pointer-events-none">
                {/* Top Row: Stars & Verified Badge */}
                <div className="flex justify-between items-start mb-5 md:mb-8">
                  <div className="flex gap-0.5 md:gap-1 text-[#C8A84B] text-base sm:text-lg md:text-xl drop-shadow-sm">
                    ★★★★★
                  </div>
                  <div className="bg-[#E6F5EE] border border-[#1B4D30]/20 text-[#1B4D30] text-[8px] md:text-[10px] font-medium px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1 md:gap-1.5 uppercase tracking-wider shrink-0 ml-2">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-[#4A2E10] text-sm sm:text-[15px] lg:text-lg leading-relaxed font-medium italic mb-6 md:mb-10">
                  "{testimonial.text}"
                </p>
              </div>

              {/* Bottom Row: Customer Profile */}
              <div className="relative z-10 flex items-center gap-3 md:gap-4 pt-4 md:pt-6 border-t border-[#E8D8B8]/40 pointer-events-none">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#3D1600] to-[#1A0A00] flex items-center justify-center text-[#F5D98A] fraunces font-medium text-lg md:text-xl shadow-inner shrink-0 border-2 border-[#FFFBF0] outline outline-1 outline-[#D8C49A]">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="fraunces font-medium text-[#2A1400] text-base md:text-lg leading-tight mb-0.5">
                    {testimonial.name}
                  </h4>
                  <p className="text-[#6B4423]/70 text-[9px] md:text-[10px] sm:text-xs font-medium uppercase tracking-widest">
                    {testimonial.loc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Styles for hiding scrollbar on the carousel */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </section>
  );
}