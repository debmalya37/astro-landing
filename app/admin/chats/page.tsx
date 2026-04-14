"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Users, MessageSquare, Clock, MousePointer2, BarChart3, 
  ArrowUpRight, RefreshCcw, X, Search, MessageCircle, ExternalLink
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function AdminDashboard() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/chats");
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, []);

  // --- Intelligent Data Aggregation ---
  const userStats = useMemo(() => {
    const users: Record<string, any> = {};
    chats.forEach((c: any) => {
      if (!users[c.phoneNumber]) {
        users[c.phoneNumber] = {
          name: c.waName || "Unknown",
          phone: c.phoneNumber,
          messages: 0,
          firstSeen: c.timestamp,
          lastActive: c.timestamp,
          currentStep: c.step,
          isLead: c.step?.includes("CHECKOUT"),
          isPaid: c.step?.includes("F1_"),
        };
      }
      users[c.phoneNumber].messages += 1;
      if (new Date(c.timestamp) > new Date(users[c.phoneNumber].lastActive)) {
        users[c.phoneNumber].lastActive = c.timestamp;
        users[c.phoneNumber].currentStep = c.step;
        if (c.step?.includes("CHECKOUT")) users[c.phoneNumber].isLead = true;
        if (c.step?.includes("F1_")) users[c.phoneNumber].isPaid = true;
      }
    });
    return Object.values(users).sort((a: any, b: any) => 
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }, [chats]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    chats.forEach((c: any) => {
      const stepName = c.step?.replace("F2_", "").replace("F1_", "") || "Unknown";
      counts[stepName] = (counts[stepName] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [chats]);

  const filteredUsers = userStats.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.phone.includes(userSearch)
  );

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8F9FA]">
      <div className="flex flex-col items-center gap-4">
        <RefreshCcw className="h-10 w-10 animate-spin text-[#8B1E1E]" />
        <p className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">Synchronizing Command Center</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans text-slate-900 selection:bg-[#8B1E1E] selection:text-white">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-[100] border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8B1E1E] flex items-center justify-center shadow-lg shadow-[#8B1E1E]/20">
              <BarChart3 size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">
              Astro<span className="text-[#8B1E1E]">Dashboard</span> <span className="text-slate-300 font-light">v2.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">System Live</span>
            </div>
            <button 
              onClick={fetchData} 
              className={`p-2 rounded-xl transition-all ${refreshing ? 'bg-slate-100' : 'hover:bg-slate-100 text-slate-500 hover:text-[#8B1E1E]'}`}
            >
              <RefreshCcw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pt-8">
        
        {/* Statistics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Events" val={chats.length} icon={MessageSquare} color="text-blue-600" bg="bg-blue-50" />
          
          <button 
            onClick={() => setShowUserModal(true)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-[#8B1E1E] hover:shadow-2xl hover:shadow-[#8B1E1E]/10 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600 transition-colors group-hover:bg-[#8B1E1E] group-hover:text-white">
                <Users size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-300 transition-colors group-hover:text-[#8B1E1E]" />
            </div>
            <div className="mt-6">
              <div className="text-3xl font-black text-slate-900">{userStats.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Unique Contacts</div>
            </div>
            <div className="absolute bottom-0 right-0 p-2 text-[8px] font-black uppercase tracking-widest text-[#8B1E1E] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              Click for CRM View
            </div>
          </button>

          <StatCard label="Active Today" val={chats.filter((c: any) => new Date(c.timestamp).toDateString() === new Date().toDateString()).length} icon={Clock} color="text-green-600" bg="bg-green-50" />
          <StatCard label="Checkouts" val={chats.filter((c: any) => c.step?.includes("CHECKOUT")).length} icon={ArrowUpRight} color="text-amber-600" bg="bg-amber-50" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Analytics */}
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#8B1E1E]" /> Funnel Insights
                </h3>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#8B1E1E' : '#C8A84B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#1A0A00] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] h-40 w-40 rounded-full bg-[#C8A84B] opacity-10 blur-3xl transition-all group-hover:opacity-20" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A84B] mb-4">Strategic Insight</h4>
              <p className="text-base font-medium leading-relaxed italic text-white/80">
                "{userStats.length > 0 ? `${(chats.filter((c: any) => c.step?.includes("CHECKOUT")).length / userStats.length * 100).toFixed(1)}% of users are reaching the checkout zone.` : 'Start collecting data to see conversion insights.'}"
              </p>
            </div>
          </div>

          {/* Right Column: Live Feed */}
          <div className="lg:col-span-2">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
              <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Live Interaction Feed</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing last 50 events</span>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">User</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Message</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Step</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {chats.slice(0, 50).map((chat: any) => (
                      <tr key={chat._id} className="group transition-colors hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm transition-all group-hover:bg-[#8B1E1E] group-hover:text-white">
                              {chat.waName?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate text-sm">{chat.waName}</div>
                              <div className="text-[11px] font-bold text-slate-400 tracking-tighter">+{chat.phoneNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {chat.type?.includes("button") || chat.type?.includes("list") ? 
                              <MousePointer2 size={12} className="text-blue-500" /> : 
                              <MessageSquare size={12} className="text-slate-300" />
                            }
                            <span className="text-[13px] font-medium text-slate-600 line-clamp-1 italic italic-font tracking-tight">
                              "{chat.message}"
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-tight ${
                            chat.step?.includes("CHECKOUT") ? "bg-amber-100 text-amber-700" : 
                            chat.step?.includes("F1") ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {chat.step?.replace("F2_", "").substring(0, 15)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-[11px] font-black text-slate-700">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[9px] font-bold text-slate-400">{new Date(chat.timestamp).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- UNIQUE USERS CRM SLIDE-OVER --- */}
      {showUserModal && (
        <div className="fixed inset-0 z-[300] flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all duration-500">
          <div className="h-full w-full max-w-2xl animate-slide-left bg-white shadow-2xl flex flex-col border-l border-slate-200">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 bg-[#FCF7EE]/30 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">User <span className="text-[#8B1E1E]">Vault</span></h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Directory of {userStats.length} celestial souls</p>
              </div>
              <button onClick={() => setShowUserModal(false)} className="h-12 w-12 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X size={28} className="text-slate-400" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-4 border-b border-slate-50">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or phone number..." 
                  className="w-full rounded-2xl border-none bg-slate-100 py-3.5 pl-12 pr-4 text-sm font-medium outline-none ring-2 ring-transparent transition-all focus:ring-[#8B1E1E]/20"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredUsers.length > 0 ? filteredUsers.map((u: any, i) => (
                <div key={i} className="group relative flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-[#8B1E1E] hover:shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-[#1A0A00] flex items-center justify-center text-[#C8A84B] font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight">{u.name}</h4>
                      <p className="text-xs font-bold text-slate-400">+{u.phone}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                          u.isPaid ? 'bg-green-100 text-green-700' : u.isLead ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {u.isPaid ? 'Paid Client' : u.isLead ? 'Warm Lead' : 'Explorer'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">• {u.messages} Interactions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a 
                      href={`https://wa.me/${u.phone}`} 
                      target="_blank" 
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-all hover:bg-green-600 hover:text-white shadow-sm"
                      title="Direct WhatsApp"
                    >
                      <MessageCircle size={22} />
                    </a>
                    <div className="hidden sm:block text-right border-l border-slate-100 pl-4 ml-2">
                      <div className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Last Interaction</div>
                      <div className="text-xs font-black text-slate-700">{new Date(u.lastActive).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex h-64 flex-col items-center justify-center text-slate-300">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">No cosmic souls found matching your search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left { animation: slide-left 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .italic-font { font-family: 'Times New Roman', serif; }
      `}}/>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color, bg }: any) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <div className="text-3xl font-black tracking-tight text-slate-900">{val}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{label}</div>
    </div>
  );
}