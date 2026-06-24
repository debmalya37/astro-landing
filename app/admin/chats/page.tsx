"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { 
  Users, MessageSquare, Clock, MousePointer2, BarChart3, 
  RefreshCcw, Search, MessageCircle, Play,
  Zap, Target, TrendingUp, Activity, Plus, CheckCheck, Send
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
  const [userSearch, setUserSearch] = useState("");
  
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [inputTexts, setInputTexts] = useState<Record<string, string>>({});
  const [sendingPhone, setSendingPhone] = useState<string | null>(null);
  const [resumingPhone, setResumingPhone] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (isLoadMore = false) => {
    setRefreshing(true);
    const nextPage = isLoadMore ? page + 1 : 1;
    
    try {
      const res = await fetch(`/api/admin/chats?page=${nextPage}&limit=200`);
      const data = await res.json();
      
      const newChats = data.chats || data;
      const pagination = data.pagination;

      if (isLoadMore) {
        setChats(prev => [...prev, ...newChats]);
        setPage(nextPage);
      } else {
        setChats(newChats);
        setPage(1);
      }

      if (pagination) {
        setHasMore(pagination.page < pagination.pages);
      } else {
        setHasMore(newChats.length >= 50); 
      }
    } catch (err) {
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 60000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPhone, chats]);

  const handleSendManualMessage = async (phone: string) => {
    const text = inputTexts[phone]?.trim();
    if (!text) return;

    setSendingPhone(phone);
    try {
      const res = await fetch("/api/admin/chats/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setChats(prev => [data.chat, ...prev]);
        setInputTexts(prev => ({ ...prev, [phone]: "" }));
      } else {
        alert("Failed to send message. Please check Meta API logs.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while sending message.");
    } finally {
      setSendingPhone(null);
    }
  };

  const handleResumeBot = async (phone: string) => {
    setResumingPhone(phone);
    try {
      const res = await fetch("/api/admin/chats/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone })
      });

      if (res.ok) {
        const data = await res.json();
        setChats(prev => [data.chat, ...prev]);
      } else {
        alert("Failed to resume bot.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while resuming bot.");
    } finally {
      setResumingPhone(null);
    }
  };

  const userStats = useMemo(() => {
    const users: Record<string, any> = {};
    chats.forEach((c: any) => {
      if (!users[c.phoneNumber]) {
        users[c.phoneNumber] = {
          name: "Unknown",
          phone: c.phoneNumber,
          messages: 0,
          firstSeen: c.timestamp,
          lastActive: c.timestamp,
          currentStep: c.step,
          isLead: false,
          isPaid: false,
          isPaused: false,
          intents: new Set(),
          history: [] 
        };
      }
      
      // CRITICAL FIX: Ignore any name assigned to Bot, Admin, or System
      if (c.waName && c.waName !== "Admin" && c.waName !== "System" && c.waName !== "Bot") {
        users[c.phoneNumber].name = c.waName;
      }

      // Only count user messages towards the "Total Interactions" stat
      if (c.waName !== "Admin" && c.waName !== "System" && c.waName !== "Bot") {
        users[c.phoneNumber].messages += 1;
      }
      
      users[c.phoneNumber].history.push(c);
      
      const msg = c.message?.toLowerCase() || "";
      if (msg.includes("career")) users[c.phoneNumber].intents.add("Career");
      if (msg.includes("love") || msg.includes("match")) users[c.phoneNumber].intents.add("Love");
      if (msg.includes("health")) users[c.phoneNumber].intents.add("Health");

      if (new Date(c.timestamp) > new Date(users[c.phoneNumber].lastActive)) {
        users[c.phoneNumber].lastActive = c.timestamp;
        users[c.phoneNumber].currentStep = c.step;
      }
      
      if (c.step?.includes("CHECKOUT")) users[c.phoneNumber].isLead = true;
      if (c.step?.includes("F1_")) users[c.phoneNumber].isPaid = true;
    });

    Object.values(users).forEach((user: any) => {
      const sortedHistory = [...user.history].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      user.isPaused = sortedHistory[0]?.step === "PAUSED_BY_ADMIN" || sortedHistory[0]?.type === "admin_manual";
    });

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
    return Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [chats]);

  const filteredUsers = userStats.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.phone.includes(userSearch)
  );

  const selectedUser = userStats.find(u => u.phone === selectedPhone);

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
        <div className="mx-auto max-w-[1400px] px-4 h-16 flex items-center justify-between">
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
              onClick={() => fetchData(false)} 
              className={`p-2 rounded-xl transition-all ${refreshing ? 'bg-slate-100' : 'hover:bg-slate-100 text-slate-500 hover:text-[#8B1E1E]'}`}
            >
              <RefreshCcw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1400px] px-4 pt-8">
        
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Interactions" val={chats.length} icon={MessageSquare} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Unique Audience" val={userStats.length} icon={Users} color="text-purple-600" bg="bg-purple-50" />
          <StatCard label="Retention Rate" val={`${userStats.length > 0 ? ((userStats.filter(u => u.messages > 3).length / userStats.length) * 100).toFixed(0) : 0}%`} icon={Target} color="text-green-600" bg="bg-green-50" />
          <StatCard label="Sales Intent" val={chats.filter((c: any) => c.step?.includes("CHECKOUT")).length} icon={Zap} color="text-amber-600" bg="bg-amber-50" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#8B1E1E]" /> Conversion Steps
            </h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} fontSize={9} fontWeight="800" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8B1E1E' : '#C8A84B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
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
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="count" stroke="#8B1E1E" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-gradient-to-br from-[#1A0A00] to-[#3D1600] p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-[-20%] right-[-10%] h-32 w-32 rounded-full bg-[#C8A84B] opacity-20 blur-2xl" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A84B] mb-3">Market Prediction</h4>
            <p className="text-sm font-medium leading-relaxed italic text-white/90">
              Peak activity detected at {[...hourlyData].sort((a,b) => b.count - a.count)[0]?.hour || "N/A"}. 
              Conversion rate is holding at {userStats.length > 0 ? ((chats.filter((c: any) => c.step?.includes("F1")).length / userStats.length) * 100).toFixed(1) : 0}%.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[750px] rounded-[1.5rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          <div className="w-full lg:w-[35%] flex flex-col h-full border-r border-slate-200 bg-white">
            <div className="h-16 border-b border-slate-100 bg-slate-50/80 px-5 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black text-slate-800">Messages</h3>
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="p-3 bg-white border-b border-slate-100 shrink-0">
              <div className="relative bg-[#F0F2F5] rounded-xl flex items-center px-3 py-2">
                <Search size={16} className="text-slate-500 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search or start new chat" 
                  className="bg-transparent border-none outline-none w-full text-sm ml-3 text-slate-700 placeholder:text-slate-500"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {filteredUsers.map((user: any) => {
                const isActive = selectedPhone === user.phone;
                const lastMsg = [...user.history].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                const timeString = new Date(lastMsg?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div 
                    key={user.phone} 
                    onClick={() => setSelectedPhone(user.phone)}
                    className={`flex items-center gap-3 p-3 px-4 cursor-pointer border-b border-slate-50 transition-colors ${isActive ? 'bg-[#F0F2F5] border-l-4 border-l-[#8B1E1E]' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                  >
                    <div className="relative shrink-0">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${isActive ? 'bg-[#8B1E1E]' : 'bg-slate-300'}`}>
                        {user.name?.charAt(0)}
                      </div>
                      {user.isPaused && <div className="absolute top-0 right-0 h-3.5 w-3.5 bg-amber-400 border-2 border-white rounded-full" title="Bot Paused" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-[15px] font-medium text-slate-900 truncate">{user.name}</h4>
                        <span className="text-[11px] text-slate-500 shrink-0 ml-2">{timeString}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] text-slate-500 truncate mr-2">
                          {(lastMsg?.type === 'admin_manual' || lastMsg?.waName === 'Bot') ? '✓ ' : ''}{lastMsg?.message}
                        </p>
                        {user.isPaused ? (
                          <span className="shrink-0 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">Paused</span>
                        ) : user.isLead && !user.isPaid ? (
                          <span className="shrink-0 bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-blue-100">Lead</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {hasMore && (
                <div className="p-4 flex justify-center">
                  <button 
                    onClick={() => fetchData(true)}
                    className="text-xs font-bold text-[#8B1E1E] hover:underline"
                  >
                    Load Older Chats
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[65%] flex flex-col h-full bg-[#EFEAE2] relative chat-bg-pattern">
            
            {!selectedUser ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/50 backdrop-blur-sm">
                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <MessageSquare size={40} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-light text-slate-600 mb-2">AstroDashboard Web</h2>
                <p className="text-sm text-slate-400 max-w-sm">Select a user from the left panel to view their conversation history and send manual replies.</p>
              </div>
            ) : (
              <>
                <div className="h-16 bg-[#F0F2F5] border-b border-slate-200 px-5 flex items-center justify-between shrink-0 z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#8B1E1E] flex items-center justify-center text-white font-bold shadow-sm">
                      {selectedUser.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-medium text-slate-900 leading-tight">{selectedUser.name}</h3>
                      <p className="text-[12px] text-slate-500">+{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex gap-1 mr-2">
                      {Array.from(selectedUser.intents).map((tag: any) => (
                        <span key={tag} className="text-[9px] font-bold bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md uppercase">{tag}</span>
                      ))}
                    </div>
                    <a href={`https://wa.me/${selectedUser.phone}`} target="_blank" rel="noreferrer" title="Open in actual WhatsApp" className="text-slate-500 hover:text-green-600 transition-colors">
                      <MessageCircle size={20} />
                    </a>
                  </div>
                </div>

                {selectedUser.isPaused && (
                  <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                      AI BOT IS PAUSED. Human control active.
                    </div>
                    <button 
                      onClick={() => handleResumeBot(selectedUser.phone)}
                      disabled={resumingPhone === selectedUser.phone}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      {resumingPhone === selectedUser.phone ? <RefreshCcw size={12} className="animate-spin" /> : <Play size={12} className="fill-white" />}
                      Resume AI
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-3">
                  <div className="flex justify-center mb-4">
                    <span className="bg-[#FFEECD] text-slate-600 text-[11px] px-3 py-1 rounded-lg shadow-sm">
                      Messages are end-to-end synchronized with Meta API
                    </span>
                  </div>

                  {[...selectedUser.history].sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((msg: any) => {
                    const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    const isSystemEvent = msg.type === "system_event";
                    const isBotOrAdmin = msg.waName === "Admin" || msg.waName === "Bot";

                    if (isSystemEvent) {
                      return (
                        <div key={msg._id} className="flex justify-center my-2">
                          <span className="bg-slate-800/80 text-white backdrop-blur-sm text-[10px] px-3 py-1 rounded-full shadow-sm">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg._id} className="flex flex-col gap-2 w-full">
                        
                        {/* User's Message (Left) */}
                        {!isBotOrAdmin && (
                          <div className="flex justify-start w-full">
                            <div className="bg-white text-slate-900 text-[14px] rounded-lg rounded-tl-none px-3 pt-2 pb-1.5 shadow-sm max-w-[85%] sm:max-w-[70%] relative">
                              {msg.type && msg.type !== "text" && (
                                <div className="text-[10px] font-bold text-blue-500 mb-1 flex items-center gap-1">
                                  <MousePointer2 size={12} /> {msg.type.replace("_", " ")}
                                </div>
                              )}
                              <p className="leading-relaxed break-words pr-12 whitespace-pre-wrap">{msg.message}</p>
                              <div className="text-[10px] text-slate-400 absolute bottom-1 right-2">
                                {timeString}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bot or Admin Message (Right) */}
                        {isBotOrAdmin && (
                          <div className="flex justify-end w-full">
                            <div className={`text-[14px] text-slate-900 rounded-lg rounded-tr-none px-3 pt-2 pb-1.5 shadow-sm max-w-[85%] sm:max-w-[70%] relative ${msg.waName === 'Admin' ? 'bg-[#D1F4CC]' : 'bg-[#D9FDD3]'}`}>
                              <span className={`text-[10px] font-bold block mb-1 tracking-tight flex items-center gap-1 ${msg.waName === 'Admin' ? 'text-[#8B1E1E]' : 'text-green-700'}`}>
                                {msg.waName === 'Admin' ? (
                                  <><Users size={12} className="fill-[#8B1E1E]" /> Human Admin</>
                                ) : msg.type === "bot_ai_response" ? (
                                  <><Zap size={12} className="fill-green-700" /> Surbhi AI Generator</>
                                ) : (
                                  <><Zap size={12} className="fill-green-700" /> Automated Flow</>
                                )}
                              </span>
                              <p className="leading-relaxed break-words pr-14 whitespace-pre-wrap">
                                {msg.message}
                              </p>
                              <div className={`text-[10px] absolute bottom-1 right-2 flex items-center gap-1 ${msg.waName === 'Admin' ? 'text-slate-500' : 'text-green-700/70'}`}>
                                {timeString} <CheckCheck size={14} className={msg.waName === 'Admin' ? 'text-blue-500' : 'text-blue-500'} />
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-[#F0F2F5] px-4 py-3 flex items-center gap-3 shrink-0">
                  <div className="flex-1 bg-white rounded-xl flex items-center px-4 py-2 sm:py-3 shadow-sm">
                    <input 
                      type="text" 
                      placeholder="Type a manual message (Pauses the AI bot)..."
                      value={inputTexts[selectedUser.phone] || ""}
                      onChange={(e) => setInputTexts(prev => ({ ...prev, [selectedUser.phone]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendManualMessage(selectedUser.phone); }}
                      className="w-full bg-transparent border-none outline-none text-sm text-slate-700"
                      disabled={sendingPhone === selectedUser.phone}
                    />
                  </div>
                  <button 
                    onClick={() => handleSendManualMessage(selectedUser.phone)}
                    disabled={!inputTexts[selectedUser.phone]?.trim() || sendingPhone === selectedUser.phone}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#00A884] text-white flex items-center justify-center hover:bg-[#008f6f] disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                  >
                    {sendingPhone === selectedUser.phone ? <RefreshCcw size={20} className="animate-spin" /> : <Send size={20} className="-ml-0.5" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .italic-font { font-family: 'Times New Roman', serif; }
        
        .chat-bg-pattern {
           background-image: url("https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QxI0T7QeQ.png");
           background-size: cover;
           background-repeat: repeat;
           background-color: #EFEAE2;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
      `}}/>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color, bg }: any) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-black tracking-tight text-slate-900">{val}</div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color} transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}