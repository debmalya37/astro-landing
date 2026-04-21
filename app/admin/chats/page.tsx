"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Users, MessageSquare, Clock, MousePointer2, BarChart3, 
  ArrowUpRight, RefreshCcw, X, Search, MessageCircle, ExternalLink,
  ChevronDown, History, Zap, Target, TrendingUp, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from "recharts";

interface ChatMessage {
  _id: string;
  phoneNumber: string;
  waName: string;
  message: string;
  type: string;
  step: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

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
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  const toggleUser = (phone: string) => {
    setExpandedUsers(prev => ({ ...prev, [phone]: !prev[phone] }));
  };

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
          intents: new Set(),
          history: [] 
        };
      }
      users[c.phoneNumber].messages += 1;
      users[c.phoneNumber].history.push(c);
      
      const msg = c.message?.toLowerCase() || "";
      if (msg.includes("career")) users[c.phoneNumber].intents.add("Career");
      if (msg.includes("love") || msg.includes("match")) users[c.phoneNumber].intents.add("Love");
      if (msg.includes("health")) users[c.phoneNumber].intents.add("Health");

      if (new Date(c.timestamp) > new Date(users[c.phoneNumber].lastActive)) {
        users[c.phoneNumber].lastActive = c.timestamp;
        users[c.phoneNumber].currentStep = c.step;
        if (c.step?.includes("CHECKOUT")) users[c.phoneNumber].isLead = true;
        if (c.step?.includes("F1_")) users[c.phoneNumber].isPaid = true;
      }
    });
    // FIX: Clone array before sorting
    return Object.values(users).sort((a: any, b: any) => 
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }, [chats]);

  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0).map((_, i) => ({ hour: `${i}:00`, count: 0 }));
    chats.forEach((c: any) => {
      const h = new Date(c.timestamp).getHours();
      hours[h].count++;
    });
    return hours;
  }, [chats]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    chats.forEach((c: any) => {
      const stepName = c.step?.replace("F2_", "").replace("F1_", "") || "Unknown";
      counts[stepName] = (counts[stepName] || 0) + 1;
    });
    // FIX: Creating a fresh array to avoid read-only errors
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
      
      <nav className="sticky top-0 z-[100] border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8B1E1E] flex items-center justify-center shadow-lg shadow-[#8B1E1E]/20">
              <BarChart3 size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">
              Astro<span className="text-[#8B1E1E]">Dashboard</span> <span className="text-slate-300 font-light">v3.0</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
                <Activity size={14} className="text-green-400 animate-pulse" />
                <p className="text-[10px] font-bold text-white/70 uppercase truncate max-w-[200px]">
                  Latest: {chats[0]?.message}
                </p>
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
        
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Interactions" val={chats.length} icon={MessageSquare} color="text-blue-600" bg="bg-blue-50" />
          
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
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Audience</div>
            </div>
          </button>

          <StatCard label="Retention Rate" val={`${userStats.length > 0 ? ((userStats.filter(u => u.messages > 3).length / userStats.length) * 100).toFixed(0) : 0}%`} icon={Target} color="text-green-600" bg="bg-green-50" />
          <StatCard label="Sales Intent" val={chats.filter((c: any) => c.step?.includes("CHECKOUT")).length} icon={Zap} color="text-amber-600" bg="bg-amber-50" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#8B1E1E]" /> Conversion Steps
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={9} fontWeight="800" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#8B1E1E' : '#C8A84B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Hourly Engagement
              </h3>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B1E1E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B1E1E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" fontSize={8} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="count" stroke="#8B1E1E" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-br from-[#1A0A00] to-[#3D1600] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] h-32 w-32 rounded-full bg-[#C8A84B] opacity-20 blur-2xl" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A84B] mb-4">Market Prediction</h4>
              <p className="text-sm font-medium leading-relaxed italic text-white/90">
                {/* FIX: Use spread operator [...hourlyData] to avoid read-only sort error */}
                Peak activity detected at {[...hourlyData].sort((a,b) => b.count - a.count)[0]?.hour || "N/A"}. 
                Conversion rate is holding at {userStats.length > 0 ? ((chats.filter((c: any) => c.step?.includes("F1")).length / userStats.length) * 100).toFixed(1) : 0}%.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
              <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Audience Interaction Vault</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">Real-time synchronized with WhatsApp Meta API</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-slate-600">LIVE</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[1000px] divide-y divide-slate-50">
                {userStats.slice(0, 40).map((user: any) => (
                  <div key={user.phone} className="group transition-all">
                    <div 
                      onClick={() => toggleUser(user.phone)}
                      className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm group-hover:bg-[#8B1E1E] group-hover:text-white transition-all shadow-sm">
                            {user.name?.charAt(0)}
                          </div>
                          {user.isPaid && <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                            {user.isPaid ? (
                              <span className="bg-green-50 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-green-100 uppercase">Paid Client</span>
                            ) : user.isLead ? (
                              <span className="bg-amber-50 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-100 uppercase">Lead</span>
                            ) : null}
                          </div>
                          <div className="text-[11px] font-bold text-slate-400 tracking-tighter">+{user.phone} • {user.messages} Messages</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden md:flex gap-1">
                          {Array.from(user.intents).map((tag: any) => (
                            <span key={tag} className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{tag}</span>
                          ))}
                        </div>
                        <div className={`p-2 rounded-full bg-slate-100 text-slate-400 transition-all ${expandedUsers[user.phone] ? 'rotate-180 bg-[#8B1E1E] text-white' : ''}`}>
                          <ChevronDown size={16} />
                        </div>
                      </div>
                    </div>

                    {expandedUsers[user.phone] && (
                      <div className="bg-[#FDFBF7] border-t border-slate-100 p-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-[#8B1E1E]" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Full Interaction History</span>
                            </div>
                            <a href={`https://wa.me/${user.phone}`} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black text-green-600 hover:underline">
                              <MessageCircle size={14} /> Open WhatsApp
                            </a>
                        </div>
                        
                        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                          {[...user.history].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((msg: any) => (
                            <div key={msg._id} className="relative pl-8">
                                <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full border-4 border-[#FDFBF7] shadow-sm ${
                                    msg.step?.includes("CHECKOUT") ? "bg-amber-400" : msg.step?.includes("F1") ? "bg-green-500" : "bg-slate-300"
                                }`} />
                                
                                <div className="bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Event:</span>
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                              msg.type?.includes("button") ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                                          }`}>
                                              {msg.type}
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-base font-medium text-slate-800 italic italic-font leading-relaxed">"{msg.message}"</p>
                                    <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-50">
                                        <div className="text-[9px] font-black text-slate-300 uppercase">Lifecycle Step</div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl">
                                          <div className="h-1.5 w-1.5 rounded-full bg-[#C8A84B]" />
                                          <span className="text-[10px] font-bold text-slate-700">{msg.step || "START"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showUserModal && (
        <div className="fixed inset-0 z-[300] flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all duration-500">
          <div className="h-full w-full max-w-2xl animate-slide-left bg-white shadow-2xl flex flex-col border-l border-slate-200">
            <div className="p-8 border-b border-slate-100 bg-[#FCF7EE]/30 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">User <span className="text-[#8B1E1E]">Vault</span></h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">CRM View • {userStats.length} Contacts</p>
              </div>
              <button onClick={() => setShowUserModal(false)} className="h-12 w-12 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <X size={28} className="text-slate-400" />
              </button>
            </div>

            <div className="px-8 py-4 border-b border-slate-50">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search CRM..." 
                  className="w-full rounded-2xl border-none bg-slate-100 py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#8B1E1E]/20"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredUsers.map((u: any, i) => (
                <div key={i} className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-[#8B1E1E] hover:shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-[#1A0A00] flex items-center justify-center text-[#C8A84B] font-black text-xl">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg leading-tight">{u.name}</h4>
                      <p className="text-xs font-bold text-slate-400">+{u.phone}</p>
                      <div className="mt-3 flex gap-2">
                         {u.isPaid && <span className="bg-green-100 text-green-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Client</span>}
                         <span className="text-[10px] font-bold text-slate-300">{u.messages} Interactions</span>
                      </div>
                    </div>
                  </div>
                  <a href={`https://wa.me/${u.phone}`} target="_blank" className="h-12 w-12 flex items-center justify-center rounded-2xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                    <MessageCircle size={22} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
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