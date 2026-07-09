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
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = clientWidth >= 768 ? clientWidth / 2 : clientWidth * 0.85;
          carouselRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }
    }, 3500); 

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

  // --- Mouse Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current!.offsetLeft);
    setScrollLeft(carouselRef.current!.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current!.offsetLeft;
    const walk = (x - startX) * 2; 
    carouselRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-4 md:py-10 bg-[#FCF7EE] relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C5A880] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="max-w-[1300px] mx-auto relative z-10 px-4 sm:px-5 lg:px-8">
        
        {/* =========================================
            HEADER & CONTROLS
            ========================================= */}
        {/* FIXED: Removed the 'reveal' class from this div so it renders instantly */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-4 sm:mb-6 shadow-sm border border-[#C5A880]/40 bg-white/60 text-[#84623F] backdrop-blur-sm mx-auto md:mx-0">
              ✦ Client Success Stories
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-[3.6rem] font-medium text-[#2D1B11] leading-[1.15] tracking-tight">
              Real People. <br className="hidden md:block" />
              <em className="italic text-[#84623F]">Real Transformations.</em>
            </h2>
          </div>

          {/* Luxury Arrow Dials */}
          <div className="flex items-center justify-center gap-4 mt-8 md:mt-0">
            <button 
              onClick={scrollPrev} 
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#C5A880]/60 flex items-center justify-center text-[#84623F] bg-[#FDF7EC] hover:bg-[#C5A880] hover:text-white hover:border-[#C5A880] transition-all duration-300 shadow-[0_5px_15px_rgba(132,98,63,0.1)] active:scale-95 group"
              aria-label="Previous Testimonial"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button 
              onClick={scrollNext} 
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#C5A880]/60 flex items-center justify-center text-[#84623F] bg-[#FDF7EC] hover:bg-[#C5A880] hover:text-white hover:border-[#C5A880] transition-all duration-300 shadow-[0_5px_15px_rgba(132,98,63,0.1)] active:scale-95 group"
              aria-label="Next Testimonial"
            >
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        {/* =========================================
            TESTIMONIALS CAROUSEL
            ========================================= */}
        <div 
          ref={carouselRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); handleMouseUpOrLeave(); }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          className={`flex overflow-x-auto pb-12 -mx-4 px-4 sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8 gap-5 md:gap-8 snap-x snap-mandatory hide-scrollbar cursor-grab ${isDragging ? 'cursor-grabbing select-none snap-none' : ''}`}
        >
          {testimonials.map((testimonial, i) => (
            <div 
              key={i} 
              className="relative min-w-[85vw] sm:min-w-[420px] md:min-w-[calc(50%-16px)] lg:min-w-[calc(50%-20px)] snap-center rounded-[2rem] p-8 sm:p-10 border border-[#C5A880]/40 shadow-[0_15px_40px_rgba(45,27,17,0.15)] hover:shadow-[0_25px_60px_rgba(132,98,63,0.25)] hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #2D1B11 0%, #1A0F0A 100%)' }}
            >
              
              {/* Subtle Cosmic Background Pattern inside Card */}
              <div className="absolute -top-10 -right-10 text-[12rem] text-[#C5A880] opacity-5 font-serif leading-none pointer-events-none select-none group-hover:scale-110 transition-transform duration-700">
                ☸
              </div>

              {/* Giant Decorative Quote Mark */}
              <div className="absolute top-6 right-8 text-7xl text-[#C5A880] opacity-20 font-serif leading-none pointer-events-none drop-shadow-md">
                &rdquo;
              </div>

              <div className="relative z-10 pointer-events-none flex-1 flex flex-col">
                
                {/* Top Row: Stars & Verified Badge */}
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className="flex gap-1 text-[#C5A880] text-lg sm:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    ★★★★★
                  </div>
                  <div className="bg-[#1B4D30]/20 border border-[#4ADE80]/30 text-[#4ADE80] text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-widest shrink-0 shadow-sm backdrop-blur-md">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Verified
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-[#FDF7EC]/90 text-base sm:text-lg lg:text-[1.15rem] leading-[1.8] font-light italic mb-8 flex-1">
                  "{testimonial.text}"
                </p>
              </div>

              {/* Bottom Row: Customer Profile */}
              <div className="relative z-10 flex items-center gap-4 pt-6 border-t border-[#C5A880]/20 pointer-events-none mt-auto">
                
                {/* Avatar with Metallic Ring */}
                <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0">
                  <div className="absolute inset-0 rounded-full border border-[#C5A880]/50 scale-[1.15]"></div>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C5A880] to-[#84623F] flex items-center justify-center text-[#2D1B11] font-serif font-bold text-xl md:text-2xl shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-medium text-[#FDF7EC] text-lg leading-tight mb-1">
                    {testimonial.name}
                  </h4>
                  <p className="text-[#C5A880] text-[10px] sm:text-xs font-medium uppercase tracking-widest">
                    {testimonial.loc}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </section>
  );
}