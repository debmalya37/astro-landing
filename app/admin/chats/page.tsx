"use client";
import { useEffect, useState } from "react";
import { 
  Users, 
  MessageSquare, 
  Clock, 
  MousePointer2, 
  BarChart3, 
  ArrowUpRight,
  RefreshCcw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/chats");
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error("Failed to load chats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Prepare Data for the Chart (Bot Progress Funnel)
  const getChartData = () => {
    const counts: any = {};
    chats.forEach((c: any) => {
      counts[c.step] = (counts[c.step] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key.replace("F2_", "").replace("F1_", ""), // Clean up names
      count: counts[key]
    })).sort((a, b) => b.count - a.count);
  };

  const COLORS = ['#8B1E1E', '#C8A84B', '#3D1600', '#4A2E10', '#A82020'];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <RefreshCcw className="h-8 w-8 animate-spin text-[#8B1E1E]" />
        <p className="text-sm font-medium text-gray-500 tracking-widest">LOADING COMMAND CENTER...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Area */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Astro Command Center</h1>
            <p className="text-slate-500">Real-time WhatsApp flow & customer interactions</p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Interactions", val: chats.length, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Unique Users", val: new Set(chats.map((c: any) => c.phoneNumber)).size, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Today's Active", val: chats.filter((c: any) => new Date(c.timestamp).toDateString() === new Date().toDateString()).length, icon: ArrowUpRight, color: "text-green-600", bg: "bg-green-50" },
            { label: "Conversion Zone", val: chats.filter((c: any) => c.step.includes("CHECKOUT")).length, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-hover hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl p-2.5 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live</span>
              </div>
              <div className="text-2xl font-black text-slate-800">{stat.val}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Charts Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
                <BarChart3 size={16} /> User Flow Distribution
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={10} fontWeight="bold" />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1A0A00] p-6 shadow-xl border border-[#C8A84B]/20 text-white">
               <h4 className="text-[#C8A84B] font-bold text-xs uppercase tracking-[0.2em] mb-2">Pro Insight</h4>
               <p className="text-sm text-white/70 leading-relaxed italic">
                 Most users are dropping off at <strong>{getChartData()[0]?.name || 'N/A'}</strong>. Consider adding a re-engagement hook there.
               </p>
            </div>
          </div>

          {/* Table Column */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100 bg-white p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Recent Activity Feed</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Interaction</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Step Status</th>
                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chats.map((chat: any) => (
                      <tr key={chat._id} className="group border-b border-slate-50 transition-colors hover:bg-slate-50/80">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm shadow-inner group-hover:bg-[#8B1E1E] group-hover:text-white transition-colors uppercase">
                              {chat.waName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{chat.waName}</div>
                              <div className="text-[11px] font-medium text-slate-400">+{chat.phoneNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 max-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              {chat.type === "button_click" || chat.type === "list_selection" ? (
                                <MousePointer2 size={12} className="text-blue-500" />
                              ) : (
                                <MessageSquare size={12} className="text-slate-400" />
                              )}
                              <span className="text-[13px] font-medium text-slate-600 italic">"{chat.message}"</span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-tighter ${chat.type === 'text' ? 'text-slate-300' : 'text-blue-400'}`}>
                               via {chat.type?.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black tracking-tight uppercase ${
                            chat.step.includes("CHECKOUT") 
                            ? "bg-amber-100 text-amber-700" 
                            : chat.step.includes("START") 
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                          }`}>
                            {chat.step}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-[12px] font-bold text-slate-700">
                               <Clock size={12} className="text-slate-300" />
                               {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400">
                              {new Date(chat.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}