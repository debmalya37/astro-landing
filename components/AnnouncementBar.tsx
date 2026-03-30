export default function AnnouncementBar() {
  return (
    <div className="bg-dk text-white text-sm py-2 flex justify-center gap-2">
      🔥 Launch: <strong>273 spots left</strong> at ₹999
      <a href="#offer" className="ml-2 bg-gold px-3 py-1 rounded-full text-xs">
        Claim →
      </a>
    </div>
  );
}