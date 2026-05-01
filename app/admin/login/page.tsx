"use client";
import { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real high-security app, you'd send this to a Server Action.
    // For this static approach, we format the cookie for the proxy to read.
    const credentialString = `${userId}:${password}`;
    
    document.cookie = `admin_auth=${credentialString}; path=/; max-age=86400; SameSite=Strict; Secure`;
    
    window.location.href = "/admin/chats"; 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        {/* Decorative Shield Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <ShieldCheck className="text-amber-500" size={40} />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Gateway</h1>
            <p className="text-zinc-400 text-sm mt-2">Enter credentials to access the secure terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold ml-1">Identity ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)} 
                  placeholder="e.g. system_admin"
                  className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
            >
              Authorize Access
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-600 text-[10px] uppercase tracking-tighter">
              Authorized Personnel Only • Encrypted Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}