"use client";
import { useEffect, useState } from "react";
import { Package, Send, FileText, CheckCircle, User, Phone, X, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [msgData, setMsgData] = useState({ 
    message: "Radhe Radhe! Your report is ready 🙏", 
    pdfUrl: "" 
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/orders").then(res => res.json()).then(setOrders);
  }, []);

  // --- HELPER: Convert Google Drive Link to Direct Download ---
  const convertToDirectLink = (url: string) => {
    const fileIdMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
    return url;
  };

  const handleSendReport = async () => {
    if (!msgData.pdfUrl) return alert("Please provide a PDF URL");
    
    setSending(true);
    
    // Clean and Format Phone Number
    let phone = selectedOrder.customer.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = `91${phone}`;

    try {
      const res = await fetch("/api/admin/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          userName: selectedOrder.customer.name, // Required for Template {{1}}
          pdfUrl: convertToDirectLink(msgData.pdfUrl), // Auto-fix Google Drive Links
          fileName: `${selectedOrder.customer.name.replace(/\s+/g, '_')}_Astrology_Report.pdf`
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert("🚀 Report dispatched successfully via Template!");
        setSelectedOrder(null);
        setMsgData({ ...msgData, pdfUrl: "" });
      } else {
        throw new Error(result.error || "Failed to send");
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 lg:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-[#2A0E00] italic uppercase tracking-tighter">
            Order <span className="text-[#8B1E1E]">Vault</span>
          </h1>
          <p className="text-slate-500 font-medium">Manage and dispatch personalized reports</p>
        </header>

        <div className="grid gap-6">
          {orders.length > 0 ? orders.map((order: any) => (
            <div key={order._id} className="bg-white border border-[#E8D8B8] rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row justify-between items-center gap-6 group">
              <div className="flex items-center gap-5 w-full lg:w-auto">
                <div className="h-16 w-16 bg-[#FFFBF0] rounded-2xl flex items-center justify-center border border-[#E8D8B8] text-[#8B1E1E] group-hover:bg-[#8B1E1E] group-hover:text-white transition-colors">
                  <Package size={30} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800">{order.reportType}</h3>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5"><User size={14}/> {order.customer.name}</span>
                    <span className="text-sm font-bold text-slate-400 flex items-center gap-1.5"><Phone size={14}/> +{order.customer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-8">
                <div className="text-right">
                  <div className="text-2xl font-black text-[#1B4D30]">₹{order.amount}</div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-[#8B1E1E] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#5C1414] hover:scale-105 transition-all shadow-lg shadow-[#8B1E1E]/20"
                >
                  <Send size={18} /> Send Report
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-[#E8D8B8]">
               <Package size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="font-bold text-slate-400">No paid orders found in the vault.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MANUAL MESSENGER MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-[#C8A84B]/20 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#8B1E1E] p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-[#F5D98A]">Dispatch Report</h2>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">Customer: {selectedOrder.customer.name}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Public PDF URL (Google Drive/Vercel)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A84B]" size={20} />
                  <input 
                    type="url" 
                    autoFocus
                    placeholder="Paste the PDF link here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1E1E]/5 transition-all"
                    value={msgData.pdfUrl}
                    onChange={(e) => setMsgData({...msgData, pdfUrl: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                  <span className="text-[#8B1E1E]">●</span> Ensure Drive file is set to "Anyone with the link"
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSendReport}
                  disabled={sending || !msgData.pdfUrl}
                  className="w-full bg-[#1B4D30] hover:bg-[#143d26] text-white py-5 rounded-[1.5rem] font-black text-lg flex justify-center items-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-[#1B4D30]/20 active:scale-95"
                >
                  {sending ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      PROCESSING DISPATCH...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      CONFIRM & DISPATCH
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}