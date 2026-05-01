"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, ShoppingCart, LogOut, LayoutDashboard, Menu, ChevronLeft } from "lucide-react";

// Accept props from the client layout
const AdminNavbar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => {
  const pathname = usePathname();

  const navLinks = [
    // { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Chats", href: "/admin/chats", icon: MessageSquare },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  const handleLogout = () => {
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Toggle Button - Shows ONLY when nav is closed */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-amber-500 shadow-2xl"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <nav className={`
        flex flex-col w-64 h-screen bg-zinc-900 text-white border-r border-zinc-800 p-4 fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="mb-8 px-2 flex items-center justify-between">
          <h1 className="text-xl font-bold text-amber-500">Admin Panel</h1>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500">
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-grow">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                pathname === link.href ? "bg-amber-500/10 text-amber-500" : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <link.icon size={20} />
              {link.name}
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-zinc-400 mt-auto hover:bg-red-400/10 rounded-lg">
          <LogOut size={20} /> Logout
        </button>
      </nav>
    </>
  );
};

export default AdminNavbar;