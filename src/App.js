import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { 
  BarChart3, LayoutDashboard, Save, ShieldCheck, Users, WalletCards, 
  Search, CheckCircle2, XCircle, Menu, Bell, Briefcase, Building, 
  FileText, Plus, UserPlus, FileSignature, X, LogOut, Lock, Trash2, Power
} from "lucide-react";

import "./style.css";

// Ensure these exist in your src/images folder
import slideSecurity from "./images/slide-security.svg";
import slideSolar from "./images/slide-solar.svg";

const API_BASE_URL = "https://zenith-backend-ozvl.onrender.com"; // Update to http://localhost:8080 for local testing

const dashboardMedia = {
  bannerSlides: [
    { title: "Security Operations", subtitle: "High-trust guarding and surveillance services", image: slideSecurity },
    { title: "Solar Solutions", subtitle: "Sustainable energy infrastructure for enterprises", image: slideSolar },
  ],
  visualCards: [
    { title: "Solar Infrastructure", subtitle: "Clean energy operations", image: slideSolar },
    { title: "Integrated Security", subtitle: "24/7 monitored safety", image: slideSecurity },
  ],
};

const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const calculateFinalServicePrice = (baseCost, margin) => (Number(baseCost) || 0) + ((Number(baseCost) || 0) * (Number(margin) || 0)) / 100;

// --- MODAL WRAPPER ---
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-zoom-in">
        <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/50">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [activeModal, setActiveModal] = useState(null); 
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Database State
  const [rows, setRows] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [newStaff, setNewStaff] = useState({ name: "", role: "", site: "" });
  const [newClient, setNewClient] = useState({ name: "", contractEnd: "", totalMonthly: 0 });
  const [quoteBase, setQuoteBase] = useState("");

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  // --- API HELPER ---
  const apiFetch = async (endpoint, method = "GET", body = null) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API request failed");
    return data;
  };

  // --- ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.email.trim(), password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setToken(data.token);
      setCurrentUser(data.user);
      setActiveTab("dashboard");
      showToast(`Welcome back, ${data.user.name}`, "success");
    } catch (err) { 
      showToast(err.message, "error"); 
    }
  };

  const loadData = async () => {
    try {
      if (currentUser?.role !== "CLIENT") {
        setRows(await apiFetch("/api/v1/pricing"));
        setStaffList(await apiFetch("/api/v1/staff"));
      }
      setClientList(await apiFetch("/api/v1/clients"));
      if (rows.length > 0) setQuoteBase(rows[0].service);
    } catch (err) { 
      showToast("Failed to sync database.", "error"); 
    }
  };

  // Auto-fetch data upon successful login
  useEffect(() => { 
    if (token) loadData(); 
  }, [token, currentUser]);

  const handleSavePricing = async () => {
    try {
      await apiFetch("/api/v1/pricing", "PUT", { rows });
      showToast("Pricing saved to database.", "success");
    } catch (err) { 
      showToast("Failed to save pricing.", "error"); 
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const staff = await apiFetch("/api/v1/staff", "POST", newStaff);
      setStaffList([staff, ...staffList]);
      setActiveModal(null);
      setNewStaff({ name: "", role: "", site: "" });
      showToast(`${staff.name} added.`, "success");
    } catch (err) { 
      showToast("Error adding staff.", "error"); 
    }
  };

  const handleRemoveStaff = async (id, name) => {
    try {
      await apiFetch(`/api/v1/staff/${id}`, "DELETE");
      setStaffList(staffList.filter(s => s.id !== id));
      showToast(`${name} removed from system.`, "info");
    } catch (err) { 
      showToast("Error removing staff.", "error"); 
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await apiFetch(`/api/v1/staff/${id}/status`, "PUT", { status });
      setStaffList(staffList.map(s => s.id === id ? { ...s, status } : s));
      showToast("Status updated successfully.", "success");
    } catch (err) { 
      showToast("Error updating status.", "error"); 
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const client = await apiFetch("/api/v1/clients", "POST", newClient);
      setClientList([client, ...clientList]);
      setActiveModal(null);
      setNewClient({ name: "", contractEnd: "", totalMonthly: 0 });
      showToast(`${client.name} onboarded.`, "success");
    } catch (err) { 
      showToast("Error adding client.", "error"); 
    }
  };

  const generateQuotePdf = () => {
    const serviceData = rows.find(r => r.service === quoteBase);
    if (!serviceData) return;

    const finalPrice = calculateFinalServicePrice(serviceData.baseCost, serviceData.margin);
    
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(234, 179, 8); doc.setFontSize(20); doc.text("ZENITH CONSULTANCY", 15, 25);
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.text("Official Service Quote", 140, 25);
    
    doc.setTextColor(0,0,0); doc.setFontSize(14); doc.text(`Service: ${serviceData.service}`, 15, 60);
    doc.setFontSize(10); doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 60);
    
    doc.setFillColor(241, 245, 249); doc.rect(15, 80, 180, 10, "F");
    doc.setFont("helvetica", "bold"); doc.text("Description", 20, 87); doc.text("Estimated Cost", 160, 87);
    
    doc.setFont("helvetica", "normal"); 
    doc.text(`Base deployment for ${serviceData.service} operations`, 20, 105); 
    doc.text(formatCurrency(finalPrice), 160, 105);
    
    doc.line(15, 120, 195, 120);
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); 
    doc.text(`Total Estimate: ${formatCurrency(finalPrice)}`, 130, 130);
    
    doc.save(`Zenith_Quote_${serviceData.service}.pdf`);
    setActiveModal(null);
    showToast(`Quote PDF generated!`, "info");
  };

  // --- NAVIGATION MAP ---
  const navItems = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "CLIENT") {
      return [
        { id: "dashboard", label: "Client Dashboard", icon: BarChart3 },
        { id: "invoices", label: "My Portfolio", icon: FileText }
      ];
    }
    const items = [
      { id: "dashboard", label: "Operations Dashboard", icon: BarChart3 },
      { id: "pricing", label: "Service Pricing", icon: WalletCards }
    ];
    if (currentUser.role === "ADMIN") {
      items.push({ id: "staff", label: "Staff Management", icon: Users });
    }
    items.push({ id: "invoices", label: "Client Management", icon: Building });
    return items;
  }, [currentUser]);

  // Derived Calculations
  const filteredPricing = rows.filter(r => r.service.toLowerCase().includes(searchQuery.toLowerCase()));
  const totals = {
    base: rows.reduce((s, r) => s + Number(r.baseCost), 0),
    final: rows.reduce((s, r) => s + calculateFinalServicePrice(r.baseCost, r.margin), 0)
  };

  // ==========================================
  // VIEW: LOGIN SCREEN
  // ==========================================
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
           <div className={`px-5 py-3 rounded-full border shadow-xl ${toast.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'}`}>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
        <div className="w-full max-w-md animate-zoom-in">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-slate-900 font-black text-4xl mb-4">Z</div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Zenith Connect</h1>
          </div>
          <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Work Email</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                <input required type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-yellow-500 outline-none"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Password</label>
              <input required type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-yellow-500 outline-none"/>
            </div>
            <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-yellow-400 transition">Secure Login</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: DASHBOARD & APP LAYOUT
  // ==========================================
  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      
      {/* GLOBAL TOAST */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
        <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-800 border border-slate-700 text-white shadow-xl">
          {toast.type === 'error' ? <XCircle size={16} className="text-red-400"/> : <CheckCircle2 size={16} className="text-emerald-400"/>}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      </div>

      {/* DYNAMIC CREATION MODALS */}
      {activeModal === 'staff' && currentUser.role === 'ADMIN' && (
        <Modal title="Deploy New Staff" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <input required placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
            <input required placeholder="Role (e.g. Guard)" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
            <input required placeholder="Assigned Site" value={newStaff.site} onChange={e => setNewStaff({...newStaff, site: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
            <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg">Save Staff</button>
          </form>
        </Modal>
      )}

      {activeModal === 'client' && (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') && (
        <Modal title="Onboard New Client" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddClient} className="space-y-4">
            <input required placeholder="Company Name" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
            <input required type="date" value={newClient.contractEnd} onChange={e => setNewClient({...newClient, contractEnd: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" style={{colorScheme:'dark'}} />
            <input required placeholder="Monthly Value (₹)" type="number" value={newClient.totalMonthly} onChange={e => setNewClient({...newClient, totalMonthly: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" />
            <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg">Save Client</button>
          </form>
        </Modal>
      )}

      {activeModal === 'quote' && (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') && (
        <Modal title="Quick Quote Generator" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Generate a rapid estimate based on active pricing logic.</p>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Select Service Base</label>
              <select value={quoteBase} onChange={e => setQuoteBase(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500">
                {rows.map(r => <option key={r.service} value={r.service}>{r.service} (Base: {formatCurrency(r.baseCost)})</option>)}
              </select>
            </div>
            <button onClick={generateQuotePdf} className="w-full border border-yellow-500 text-yellow-500 font-bold py-3 rounded-lg mt-4 hover:bg-yellow-500 hover:text-slate-950 transition">Draft Quote Document</button>
          </div>
        </Modal>
      )}

      {/* FLOATING ACTION BUTTON (Hidden for Clients) */}
      {currentUser.role !== 'CLIENT' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {isFabOpen && (
            <div className="flex flex-col gap-2 animate-slide-in mb-2">
              {currentUser.role === 'ADMIN' && (
                <button onClick={() => { setIsFabOpen(false); setActiveModal('staff'); }} className="flex items-center gap-3 bg-slate-800 text-white px-4 py-2 rounded-full border border-slate-700 shadow-lg hover:bg-slate-700 transition">
                  <span className="text-sm font-medium">Add Staff</span> <UserPlus size={16} className="text-yellow-500"/>
                </button>
              )}
              <button onClick={() => { setIsFabOpen(false); setActiveModal('client'); }} className="flex items-center gap-3 bg-slate-800 text-white px-4 py-2 rounded-full border border-slate-700 shadow-lg hover:bg-slate-700 transition">
                <span className="text-sm font-medium">Add Client</span> <Building size={16} className="text-yellow-500"/>
              </button>
              <button onClick={() => { setIsFabOpen(false); setActiveModal('quote'); }} className="flex items-center gap-3 bg-slate-800 text-white px-4 py-2 rounded-full border border-slate-700 shadow-lg hover:bg-slate-700 transition">
                <span className="text-sm font-medium">Quick Quote</span> <FileSignature size={16} className="text-yellow-500"/>
              </button>
            </div>
          )}
          <button onClick={() => setIsFabOpen(!isFabOpen)} className={`bg-yellow-500 text-slate-950 p-4 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-transform duration-300 ${isFabOpen ? "rotate-45" : ""}`}>
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center text-slate-900 font-black text-xl">Z</div>
            <div>
              <p className="text-sm font-black uppercase text-yellow-500 tracking-[0.2em]">Zenith</p>
              <p className="text-[10px] uppercase text-slate-400">{currentUser.role} PORTAL</p>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all ${activeTab === item.id ? "bg-slate-800 text-yellow-500 ring-1 ring-yellow-500/40 shadow-lg translate-x-1" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
              >
                <item.icon size={18} className={activeTab === item.id ? "text-yellow-500" : ""} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md p-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-300"><Menu size={24}/></button>
            <div>
              <h1 className="text-lg font-bold text-white capitalize">{activeTab.replace("-", " ")}</h1>
              <p className="text-xs text-slate-400">{currentUser.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            
            <div className="hidden sm:flex flex-col items-end border-r border-slate-800 pr-6">
              <p className="text-xs text-slate-300 font-bold font-mono tracking-widest">{currentTime.toLocaleTimeString()}</p>
              <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5"><ShieldCheck size={12}/> System Active</p>
            </div>

            {/* STAFF SELF-STATUS SELECTOR */}
            {currentUser.role === 'STAFF' && (
              <div className="hidden sm:flex items-center gap-2 border-r border-slate-800 pr-6">
                <Power size={14} className="text-slate-400" />
                <select 
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none focus:border-yellow-500" 
                  value={staffList.find(s => s.name === currentUser.name)?.status || "Active"} 
                  onChange={e => handleStatusChange(staffList.find(s => s.name === currentUser.name)?.id, e.target.value)}
                >
                  <option value="Active">Active Duty</option>
                  <option value="Inactive">Off Shift</option>
                  <option value="On Holiday">On Holiday</option>
                </select>
              </div>
            )}

            <button onClick={() => { setToken(null); setCurrentUser(null); }} className="p-2 text-slate-400 hover:text-red-400 transition bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50" title="Logout">
              <LogOut size={18} />
            </button>

          </div>
        </header>

        {/* SCROLLABLE VIEW PORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            
            {/* ---------------------------------------------------- */}
            {/* VIEW 1: DASHBOARD */}
            {/* ---------------------------------------------------- */}
            {activeTab === "dashboard" && (
              <div className="animate-fade-in grid gap-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to Zenith, {currentUser.name.split(' ')[0]}</h2>
                  <p className="text-slate-400">Authenticated as {currentUser.role}. All systems are nominal.</p>
                </div>
                
                {currentUser.role === 'ADMIN' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Total Base Spend</p>
                      <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(totals.base)}</p>
                    </div>
                    <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
                      <p className="text-xs uppercase tracking-wide text-yellow-500/90">Projected Revenue</p>
                      <p className="mt-1 text-2xl font-bold text-yellow-500">{formatCurrency(totals.final)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 2: PRICING (ADMIN EDIT, STAFF READ) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "pricing" && (
              <div className="animate-slide-in rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search services..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      className="bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-yellow-500 outline-none w-64 transition"
                    />
                  </div>
                  {currentUser.role === 'ADMIN' ? (
                    <button onClick={handleSavePricing} className="flex items-center gap-2 bg-yellow-500 text-slate-950 px-5 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition">
                      <Save size={16}/> Save Pricing
                    </button>
                  ) : (
                    <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">Read Only Access</span>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-medium">Service</th>
                        <th className="px-5 py-4 font-medium">Base Cost</th>
                        <th className="px-5 py-4 font-medium">Profit Margin (%)</th>
                        <th className="px-5 py-4 font-medium text-yellow-500">Final Client Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredPricing.map(row => (
                        <tr key={row.service} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-4 font-medium text-white">{row.service}</td>
                          
                          {/* EDITABLE FOR ADMIN, STATIC TEXT FOR STAFF */}
                          {currentUser.role === 'ADMIN' ? (
                            <>
                              <td className="px-5 py-4">
                                <div className="relative w-32">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                                  <input 
                                    type="number" 
                                    value={row.baseCost} 
                                    onChange={(e) => setRows(rows.map(r => r.service === row.service ? {...r, baseCost: e.target.value} : r))} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md py-1.5 pl-7 pr-2 text-white outline-none focus:border-yellow-500/70 transition"
                                  />
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="relative w-24">
                                  <input 
                                    type="number" 
                                    value={row.margin} 
                                    onChange={(e) => setRows(rows.map(r => r.service === row.service ? {...r, margin: e.target.value} : r))} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md py-1.5 pl-3 pr-7 text-white outline-none focus:border-yellow-500/70 transition"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-4 text-slate-300">{formatCurrency(row.baseCost)}</td>
                              <td className="px-5 py-4 text-slate-300">{row.margin}%</td>
                            </>
                          )}

                          <td className="px-5 py-4 font-bold text-emerald-400">{formatCurrency(calculateFinalServicePrice(row.baseCost, row.margin))}</td>
                        </tr>
                      ))}
                      {filteredPricing.length === 0 && (
                        <tr><td colSpan="4" className="text-center p-8 text-slate-500">No services match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 3: STAFF ROSTER (ADMIN ONLY) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "staff" && currentUser.role === 'ADMIN' && (
              <div className="animate-slide-in grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffList.map(staff => (
                  <div key={staff.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Briefcase size={64}/></div>
                    
                    {/* ADMIN DELETE BUTTON */}
                    <button 
                      onClick={() => handleRemoveStaff(staff.id, staff.name)} 
                      className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <Trash2 size={16}/>
                    </button>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-500 font-bold">
                        {staff.name.charAt(0)}
                      </div>
                      <div className="max-w-[70%]">
                        <p className="text-white font-bold truncate">{staff.name}</p>
                        <p className="text-xs text-yellow-500 truncate">{staff.role}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between items-center relative z-10">
                      <p className="text-xs text-slate-400 truncate pr-2 flex items-center gap-1.5">
                        <Building size={12} /> {staff.site}
                      </p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded whitespace-nowrap ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : staff.status === 'On Holiday' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                        {staff.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 4: CLIENT PORTFOLIO (ALL ROLES) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "invoices" && (
              <div className="animate-slide-in bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 font-medium">Client Name</th>
                        <th className="px-6 py-4 font-medium">Monthly Value</th>
                        <th className="px-6 py-4 font-medium">Contract End</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {clientList
                        // Security filter: Clients only see themselves
                        .filter(c => currentUser.role !== 'CLIENT' || c.name === currentUser.name)
                        .map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-white font-bold"><Building size={14} className="inline mr-2 text-slate-500"/>{c.name}</td>
                          <td className="px-6 py-4 font-bold text-yellow-500">{formatCurrency(c.totalMonthly)}</td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{new Date(c.contractEnd).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {clientList.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center p-8 text-slate-500">No active clients found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
