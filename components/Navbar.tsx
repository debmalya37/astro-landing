export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-ivory border-b px-6 py-4 flex justify-between">
      <div className="font-serif text-xl font-bold">
        Surbhi <span className="italic text-gold">Gupta</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm">
          <del>₹2999</del> ₹999
        </div>
        <a className="bg-dk text-white px-4 py-2 rounded-full">
          Get Kundali
        </a>
      </div>
    </nav>
  );
}