"use client";
import { useEffect, useState } from "react";
import { 
  Package, Send, FileText, User, Phone, X, Loader2, 
  Download, Search, Filter, ArrowUpRight, CheckCircle2,
  Clock, CreditCard
} from "lucide-react";
import Papa from "papaparse";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [msgData, setMsgData] = useState({ message: "Radhe Radhe! Your report is ready 🙏", pdfUrl: "" });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Search Logic ---
  useEffect(() => {
    const filtered = orders.filter((o: any) => 
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm) ||
      o.reportType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  // --- CSV Export Logic ---
  const exportToCSV = () => {
    const csvData = orders.map((o: any) => ({
      Date: new Date(o.createdAt).toLocaleString(),
      Customer: o.customer.name,
      Phone: o.customer.phone,
      Email: o.customer.email,
      Service: o.reportType,
      Amount: o.amount,
      PaymentID: o.paymentId,
      OrderID: o.orderId,
      Status: o.status
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Astro_Orders_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  const convertToDirectLink = (url: string) => {
    const fileIdMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    return fileIdMatch ? `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}` : url;
  };

  const handleSendReport = async () => {
    if (!msgData.pdfUrl) return;
    setSending(true);
    let phone = selectedOrder.customer.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = `91${phone}`;

    try {
      const res = await fetch("/api/admin/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          userName: selectedOrder.customer.name,
          pdfUrl: convertToDirectLink(msgData.pdfUrl),
          fileName: `${selectedOrder.customer.name.replace(/\s+/g, '_')}_Report.pdf`
        })
      });
      if (res.ok) {
        alert("Success! Report dispatched.");
        setSelectedOrder(null);
      }
    } catch (error) {
      alert("Dispatch failed.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
      <Loader2 className="animate-spin text-[#8B1E1E]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans text-slate-900">
      
      {/* Top Professional Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-[100] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2 uppercase italic">
               <Package className="text-[#8B1E1E]" /> Order <span className="text-[#8B1E1E]">Vault</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Surabhi Astrology Fulfillment Center</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#8B1E1E]/20 outline-none w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#8B1E1E] transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
              <p className="text-2xl font-black text-slate-800 mt-1">₹{orders.reduce((acc: any, o: any) => acc + o.amount, 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#8B1E1E] transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Orders</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{orders.length}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-[#8B1E1E] transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Ticket</p>
              <p className="text-2xl font-black text-slate-800 mt-1">₹{orders.length ? Math.round(orders.reduce((acc: any, o: any) => acc + o.amount, 0) / orders.length) : 0}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>

        {/* Orders Table-Grid Hybrid */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:border-[#8B1E1E]/30 transition-all flex flex-col lg:flex-row lg:items-center gap-6 relative overflow-hidden group">
              
              {/* Service Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="h-14 w-14 shrink-0 bg-[#FFFBF0] rounded-2xl flex items-center justify-center text-[#8B1E1E] group-hover:bg-[#8B1E1E] group-hover:text-white transition-colors duration-300 shadow-inner">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter italic">Order #{order.orderId.slice(-6)}</span>
                    <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">PAID</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mt-1 truncate">{order.reportType}</h3>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 lg:px-10 lg:border-x lg:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <User size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{order.customer.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">Customer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Phone size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">+{order.customer.phone}</p>
                    <p className="text-[10px] font-bold text-slate-400">WhatsApp</p>
                  </div>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-6 min-w-[200px]">
                <div className="text-right">
                  <div className="text-xl font-black text-slate-800 tracking-tighter">₹{order.amount}</div>
                  <div className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1">
                    <Clock size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-[#8B1E1E] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#5C1414] hover:scale-105 transition-all shadow-lg shadow-[#8B1E1E]/20 active:scale-95"
                >
                  <Send size={14} /> Dispatch
                </button>
              </div>
            </div>
          )) : (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
               <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <Filter size={32} className="text-slate-200" />
               </div>
               <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">No matching orders found</p>
            </div>
          )}
        </div>
      </main>

      {/* Modern Modal Overlays */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[500] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setSelectedOrder(null)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                  <X size={20}/>
                </button>
              </div>
              <p className="text-[10px] font-black text-[#C8A84B] uppercase tracking-[0.3em] mb-1">Dispatch Protocol</p>
              <h2 className="text-2xl font-black italic tracking-tight">MANUAL DISPATCH <span className="text-[#C8A84B]">API</span></h2>
              <div className="mt-6 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="h-10 w-10 rounded-xl bg-[#8B1E1E] flex items-center justify-center font-bold">{selectedOrder.customer.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold">{selectedOrder.customer.name}</p>
                  <p className="text-[10px] font-bold text-white/40">Verified WhatsApp: +{selectedOrder.customer.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Report PDF Storage Link</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#C8A84B] group-focus-within:bg-[#8B1E1E] group-focus-within:text-white transition-all">
                      <FileText size={18} />
                    </div>
                    <input 
                      type="url" 
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-16 pr-6 text-sm font-medium outline-none focus:ring-4 focus:ring-[#8B1E1E]/5 transition-all placeholder:text-slate-300"
                      value={msgData.pdfUrl}
                      onChange={(e) => setMsgData({...msgData, pdfUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSendReport}
                disabled={sending || !msgData.pdfUrl}
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] flex justify-center items-center gap-3 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
              >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {sending ? "TRANSMITTING..." : "EXECUTE DISPATCH"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for aesthetic polish */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}}/>
    </div>
  );
}