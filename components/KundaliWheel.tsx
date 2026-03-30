export default function KundaliWheel() {
  return (
    <div className="relative w-[400px] h-[400px]">
      <svg viewBox="0 0 460 460" className="w-full h-full animate-spin-slow">
        <circle cx="230" cy="230" r="220" fill="#2A0E00" />
        <circle cx="230" cy="230" r="200" stroke="#C8A84B" fill="none" />
      </svg>

      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
        🔥 273 spots left
      </div>
    </div>
  );
}