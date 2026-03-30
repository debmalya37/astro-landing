import StarCanvas from "./StarCanvas";
import KundaliWheel from "./KundaliWheel";

export default function Hero() {
  return (
    <section className="bg-dk text-white min-h-screen flex items-center relative overflow-hidden">
      <StarCanvas />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-6 py-20 relative z-10">

        {/* LEFT */}
        <div>
          <p className="uppercase text-gold text-xs tracking-widest mb-6">
            India's Most Trusted Vedic Astrologer
          </p>

          <h1 className="font-serif text-5xl leading-tight mb-6">
            Your Stars Have a
            <span className="block text-gold2 italic">
              Story to Tell.
            </span>
          </h1>

          <div className="bg-white/10 border border-gold/30 p-5 rounded-xl mb-6">
            <p className="font-serif">Surbhi Gupta</p>
            <p className="text-sm text-white/70">
              18+ years experience · 15K+ readings
            </p>
          </div>

          <div className="bg-green-900/30 border border-green-500 p-4 rounded mb-6">
            🎁 Free WhatsApp Consultation Included
          </div>

          <div className="flex gap-4 items-center mb-6">
            <span className="line-through text-white/50">₹2999</span>
            <span className="text-4xl font-serif">₹999</span>
            <span className="bg-red-600 px-2 py-1 text-xs rounded">
              67% OFF
            </span>
          </div>

          <a className="bg-gradient-to-r from-gold to-gold2 px-6 py-3 rounded-full font-semibold">
            Get My Kundali →
          </a>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center">
          <KundaliWheel />
        </div>
      </div>
    </section>
  );
}