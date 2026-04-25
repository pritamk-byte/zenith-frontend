import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { 
  BarChart3, Download, LayoutDashboard, Save, ShieldCheck, Users, WalletCards, 
  Search, FileX, CheckCircle2, XCircle, Clock, Menu, Bell, Briefcase, Building, 
  FileText, ArrowUpDown, Plus, UserPlus, FileSignature, X, LogOut, Lock
} from "lucide-react";

// ==========================================
// 1. IMAGE IMPORTS
// ==========================================
import slideSecurity from "./images/slide-security.svg";
import slideSolar from "./images/slide-solar.svg";
import slideHousekeeping from "./images/slide-housekeeping.svg";
import slideManpower from "./images/slide-manpower.svg";
import slideElectricalAudit from "./images/slide-electrical-audit.svg";

// --- MOCK DATABASES & MEDIA ---
const dashboardMedia = {
  bannerSlides: [
    { title: "Security Operations", subtitle: "High-trust guarding and surveillance services", image: slideSecurity },
    { title: "Solar Solutions", subtitle: "Sustainable energy infrastructure for enterprises", image: slideSolar },
    { title: "Housekeeping Excellence", subtitle: "Premium facility cleanliness and compliance", image: slideHousekeeping },
    { title: "Skilled Manpower", subtitle: "Reliable workforce deployment on demand", image: slideManpower },
    { title: "Electrical & Audit", subtitle: "Safety-first electrical support and governance audits", image: slideElectricalAudit },
  ],
  visualCards: [
    { title: "Solar Infrastructure", subtitle: "Clean energy operations", image: slideSolar },
    { title: "Integrated Security", subtitle: "24/7 monitored safety", image: slideSecurity },
    { title: "Workforce Excellence", subtitle: "Skilled teams on demand", image: slideManpower },
  ],
};

const initialPricing = [
  { service: "Housekeeping", baseCost: 18000, margin: 18 },
  { service: "Security", baseCost: 28000, margin: 22 },
  { service: "Manpower", baseCost: 24000, margin: 20 },
  { service: "Electrical", baseCost: 21000, margin: 19 },
  { service: "Solar", baseCost: 36000, margin: 25 },
  { service: "Audit", baseCost: 16000, margin: 17 },
];

const initialStaffDb = [
  { id: "E001", name: "Ramesh Kumar", role: "Security Supervisor", site: "TechPark Alpha", status: "Active" },
  { id: "E002", name: "Priya Singh", role: "Housekeeping Lead", site: "Oasis Mall", status: "Active" },
  { id: "E003", name: "Amit Patel", role: "Electrical Tech", site: "Zenith HQ", status: "On Leave" },
  { id: "E004", name: "Sarah Khan", role: "Audit Specialist", site: "Roaming", status: "Active" },
];

const initialClientsDb = [
  { id: "C01", name: "TechPark Alpha", contractEnd: "2026-11-01", totalMonthly: 125000 },
  { id: "C02", name: "Oasis Mall", contractEnd: "2026-05-15", totalMonthly: 85000 },
];

const alertsDb = [
  { id: 1, text: "Oasis Mall contract expires in 30 days.", type: "warning", time: "2h ago" },
  { id: 2, text: "System backup completed.", type: "success", time: "5h ago" },
];

const API_BASE_URL = "https://zenith-backend-ozvl.onrender.com";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const calculateFinalServicePrice = (baseCost, margin) => {
  const base = Number(baseCost) || 0;
  const marginPct = Number(margin) || 0;
  return base + (base * marginPct) / 100;
};

// --- MODAL COMPONENT ---
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/50">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (Unchanged Logic, Truncated for Brevity where identical) ---
function HeroSlider({ slides, activeSlide, onSlideChange }) { /* Same as previous */ 
  return (
    <section className="hero-slider mb-6 overflow-hidden rounded-xl border border-slate-800">
      <div className="hero-slider-track flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)`, width: `${slides.length * 100}%` }}>
        {slides.map((slide) => (
          <article key={slide.title} className="hero-slide relative min-h-[250px] sm:min-h-[300px] w-full bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">Zenith Service Highlight</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-4xl">{slide.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-lg">{slide.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button key={index} type="button" onClick={() => onSlideChange(index)} className={`h-2 w-2 rounded-full transition-all ${activeSlide === index ? "w-6 bg-yellow-500" : "bg-slate-500"}`} />
        ))}
      </div>
    </section>
  );
}

function KpiCounters({ animatedTotals, formatCurrency }) { /* Same as previous */ 
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-3">
      <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
        <p className="text-xs uppercase tracking-wide text-slate-400">Live Total Base</p>
        <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(animatedTotals.totalBase)}</p>
      </article>
      <article className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-5 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
        <p className="text-xs uppercase tracking-wide text-yellow-500/90">Live Client Revenue</p>
        <p className="mt-1 text-2xl font-bold text-yellow-500">{formatCurrency(animatedTotals.totalFinal)}</p>
      </article>
      <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
        <p className="text-xs uppercase tracking-wide text-slate-400">Average Margin</p>
        <p className="mt-1 text-2xl font-bold text-white">{animatedTotals.avgMargin}%</p>
      </article>
    </section>
  );
}

function VisualCards({ cards, parallaxOffset, onCardMouseMove, onCardMouseLeave }) { /* Same as previous */ 
  return (
    <section className="visual-hero mb-6 overflow-hidden rounded-xl border border-slate-800 p-5 sm:p-6 shadow-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent pointer-events-none" />
      <div className="relative z-10 mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">Zenith Visual Showcase</p>
        <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">Solar, Security, and Workforce Operations</h2>
      </div>
      <div className="relative z-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((card, index) => (
          <article
            key={card.title}
            className="rounded-xl border border-slate-700/50 p-5 min-h-[160px] bg-cover bg-center transition-transform duration-200 ease-out flex flex-col justify-end"
            onMouseMove={(event) => onCardMouseMove(index, event)}
            onMouseLeave={() => onCardMouseLeave(index)}
            style={{
              transform: `perspective(700px) rotateX(${(-parallaxOffset[index].y).toFixed(2)}deg) rotateY(${parallaxOffset[index].x.toFixed(2)}deg) scale(1.02)`,
              backgroundImage: `linear-gradient(to top, rgba(15,23,42,0.9), transparent), url(${card.image})`,
            }}
          >
            <p className="text-base font-bold text-white">{card.title}</p>
            <p className="text-xs font-medium text-slate-300">{card.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PricingTable({ rows, onUpdateRow, calculateFinalServicePrice, formatCurrency, totals, searchQuery, setSearchQuery, lastUpdated }) { 
  /* Same as previous fixed version */ 
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredRows = useMemo(() => {
    let sortableRows = rows.filter((row) => row.service.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortConfig.key !== null) {
      sortableRows.sort((a, b) => {
        let aVal = sortConfig.key === 'final' ? calculateFinalServicePrice(a.baseCost, a.margin) : a[sortConfig.key];
        let bVal = sortConfig.key === 'final' ? calculateFinalServicePrice(b.baseCost, b.margin) : b[sortConfig.key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableRows;
  }, [rows, searchQuery, sortConfig]);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
      <div className="border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Dynamic Pricing Table</h2>
            <p className="mt-1 text-sm text-slate-400">Enter base cost and profit margin to auto-calculate final client pricing.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
            <Clock size={12} />
            <span>Last saved: <span className="text-slate-200">{lastUpdated}</span></span>
          </div>
        </div>
        <div className="mt-4 relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" placeholder="Search services (e.g., Solar)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-4 text-sm text-white focus:border-yellow-500 outline-none transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-white transition" onClick={() => handleSort('service')}>Service <ArrowUpDown size={12} className="inline ml-1 opacity-50"/></th>
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-white transition" onClick={() => handleSort('baseCost')}>Base Cost <ArrowUpDown size={12} className="inline ml-1 opacity-50"/></th>
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-white transition" onClick={() => handleSort('margin')}>Profit Margin (%) <ArrowUpDown size={12} className="inline ml-1 opacity-50"/></th>
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-yellow-500 text-yellow-500/80 transition" onClick={() => handleSort('final')}>Final Client Price <ArrowUpDown size={12} className="inline ml-1 opacity-50"/></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sortedAndFilteredRows.length > 0 ? (
              sortedAndFilteredRows.map((row) => {
                const base = Number(row.baseCost) || 0;
                const margin = Number(row.margin) || 0;
                const final = calculateFinalServicePrice(base, margin);
                return (
                  <tr key={row.service} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-white sm:px-6">{row.service}</td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                        <input
                          type="number" min="0" value={row.baseCost}
                          onChange={(event) => onUpdateRow(row.service, "baseCost", event.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 pl-7 pr-2 py-1.5 text-slate-100 outline-none transition focus:border-yellow-500/70"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <div className="relative w-24">
                        <input
                          type="number" min="0" max="1000" value={row.margin}
                          onChange={(event) => onUpdateRow(row.service, "margin", event.target.value)}
                          className="w-full rounded-md border border-slate-700 bg-slate-950 pl-3 pr-7 py-1.5 text-slate-100 outline-none transition focus:border-yellow-500/70"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400 sm:px-6">{formatCurrency(final)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-5 py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="rounded-full bg-slate-800/50 p-4 text-slate-500"><FileX size={32} /></div>
                    <p className="text-lg font-bold text-slate-300">No services found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 border-t border-slate-800 px-4 py-4 sm:grid-cols-2 sm:px-6 bg-slate-950/30 rounded-b-xl">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Base Cost</p>
          <p className="mt-1 text-xl font-bold text-white">{formatCurrency(totals.totalBase)}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-500/90">Total Client Pricing</p>
          <p className="mt-1 text-xl font-bold text-yellow-500">{formatCurrency(totals.totalFinal)}</p>
        </div>
      </div>
    </section>
  );
}

// --- MAIN APP (ULTIMATE WRAPPER) ---
function App() {
  // Authentication & Access State
  const [currentUser, setCurrentUser] = useState(null); // null = not logged in
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Global UI State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  
  // Modals State
  const [activeModal, setActiveModal] = useState(null); // 'client', 'staff', 'quote', null

  // Data State
  const [rows, setRows] = useState(initialPricing);
  const [staffList, setStaffList] = useState(initialStaffDb);
  const [clientList, setClientList] = useState(initialClientsDb); // NEW: Dynamic Client State
  
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [clientService, setClientService] = useState(initialPricing[0].service);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form States for Modals
  const [newStaff, setNewStaff] = useState({ name: "", role: "Security Guard", site: "HQ" });
  const [newClient, setNewClient] = useState({ name: "", contractEnd: "", totalMonthly: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    window.setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  // --- MOCK LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email.includes("admin")) {
      setCurrentUser({ name: "Admin Zenith", role: "ADMIN" });
      setActiveTab("dashboard");
      showToast("Logged in as Admin");
    } else if (loginForm.email.includes("staff")) {
      setCurrentUser({ name: "Staff Member", role: "STAFF" });
      setActiveTab("dashboard");
      showToast("Logged in as Staff");
    } else {
      showToast("Try admin@zenith.com or staff@zenith.com", "error");
    }
  };

  // --- ACTIONS ---
  const handleAddStaff = (e) => {
    e.preventDefault();
    setStaffList([...staffList, { id: `E00${staffList.length + 1}`, ...newStaff, status: "Active" }]);
    setActiveModal(null);
    showToast(`${newStaff.name} added to roster!`);
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    setClientList([...clientList, { id: `C0${clientList.length + 1}`, ...newClient }]);
    setActiveModal(null);
    showToast(`${newClient.name} onboarded successfully!`);
  };

  // Derived Access Rights
  const navItems = useMemo(() => {
    const items = [{ id: "dashboard", label: "Revenue Analytics", icon: BarChart3 }];
    if (currentUser?.role === "ADMIN") {
      items.push({ id: "pricing", label: "Service Margins", icon: WalletCards });
      items.push({ id: "staff", label: "Staff Management", icon: Users });
    }
    items.push({ id: "invoices", label: "Client Invoices", icon: FileText });
    return items;
  }, [currentUser]);

  // If NOT logged in, show Login Screen
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 selection:bg-yellow-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ease-out">
           <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border backdrop-blur-md ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"} ${toast.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'}`}>
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-slate-900 font-black text-4xl shadow-[0_0_40px_rgba(234,179,8,0.3)] mb-4">Z</div>
            <h1 className="text-2xl font-black text-white tracking-wider uppercase">Zenith Portal</h1>
            <p className="text-slate-400 text-sm mt-2">Sign in to manage operations</p>
          </div>

          <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                  <input required type="email" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} placeholder="admin@zenith.com or staff..." className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-yellow-500 outline-none transition"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Password</label>
                <input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-yellow-500 outline-none transition"/>
              </div>
            </div>
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-lg mt-6 transition shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              Secure Login
            </button>
            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
              Mock login: Use <b>admin@zenith.com</b> or <b>staff@zenith.com</b>. Password doesn't matter.
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Helper logic for calculations & state processing 
  const updateRow = (serviceName, field, value) => setRows((current) => current.map((row) => row.service === serviceName ? { ...row, [field]: value === "" ? "" : Number(value) } : row));
  const toggleStaffStatus = (id) => {
    setStaffList(curr => curr.map(staff => staff.id === id ? { ...staff, status: staff.status === 'Active' ? 'On Leave' : staff.status === 'On Leave' ? 'Inactive' : 'Active' } : staff));
    showToast("Staff status updated", "info");
  };

  const totals = useMemo(() => {
    const totalBase = rows.reduce((sum, row) => sum + (Number(row.baseCost) || 0), 0);
    const totalFinal = rows.reduce((sum, row) => sum + calculateFinalServicePrice(row.baseCost, row.margin), 0);
    return { totalBase, totalFinal };
  }, [rows]);

  const revenueTrend = useMemo(() => rows.map((row) => ({ service: row.service, revenue: calculateFinalServicePrice(row.baseCost, row.margin) })), [rows]);
  const marginTrend = useMemo(() => rows.map((row) => ({ service: row.service, margin: Number(row.margin) || 0 })), [rows]);
  const maxRevenue = useMemo(() => Math.max(...revenueTrend.map((item) => item.revenue), 1), [revenueTrend]);
  const maxMargin = useMemo(() => Math.max(...marginTrend.map((item) => item.margin), 1), [marginTrend]);

  // Main UI Render (If Logged In)
  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      
      {/* GLOBAL TOAST */}
      <div className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ease-out ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}`}>
        <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border backdrop-blur-md ${toast.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' : toast.type === 'info' ? 'bg-blue-950/90 border-blue-800 text-blue-200' : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'}`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      </div>

      {/* DYNAMIC MODALS */}
      {activeModal === 'staff' && currentUser.role === 'ADMIN' && (
        <Modal title="Deploy New Staff" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
              <input required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Role</label>
              <input required type="text" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Assigned Site</label>
              <input required type="text" value={newStaff.site} onChange={e => setNewStaff({...newStaff, site: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            </div>
            <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-yellow-400">Add Staff Member</button>
          </form>
        </Modal>
      )}

      {activeModal === 'client' && (
        <Modal title="Onboard New Client" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Company Name</label>
              <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Contract End Date</label>
              <input required type="date" value={newClient.contractEnd} onChange={e => setNewClient({...newClient, contractEnd: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" style={{colorScheme: 'dark'}}/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Agreed Monthly Value (₹)</label>
              <input required type="number" value={newClient.totalMonthly} onChange={e => setNewClient({...newClient, totalMonthly: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            </div>
            <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg mt-4 hover:bg-yellow-400">Save Client</button>
          </form>
        </Modal>
      )}

      {activeModal === 'quote' && (
        <Modal title="Quick Quote Generator" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Generate a rapid estimate based on active pricing logic.</p>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Select Service Base</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500">
                {rows.map(r => <option key={r.service}>{r.service} (Base: {formatCurrency(r.baseCost)})</option>)}
              </select>
            </div>
            <button onClick={() => { setActiveModal(null); showToast("Quote PDF generated!", "info"); }} className="w-full border border-yellow-500 text-yellow-500 font-bold py-3 rounded-lg mt-4 hover:bg-yellow-500 hover:text-slate-950 transition">Draft Quote Document</button>
          </div>
        </Modal>
      )}

      {/* QUICK ACTION FAB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isFabOpen && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200 mb-2">
            {currentUser.role === 'ADMIN' && (
              <button onClick={() => { setIsFabOpen(false); setActiveModal('staff'); }} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full border border-slate-700 shadow-lg transition">
                <span className="text-sm font-medium">Add Staff</span> <UserPlus size={16} className="text-yellow-500"/>
              </button>
            )}
            <button onClick={() => { setIsFabOpen(false); setActiveModal('client'); }} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full border border-slate-700 shadow-lg transition">
              <span className="text-sm font-medium">Add Client</span> <Building size={16} className="text-yellow-500"/>
            </button>
            <button onClick={() => { setIsFabOpen(false); setActiveModal('quote'); }} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full border border-slate-700 shadow-lg transition">
              <span className="text-sm font-medium">Quick Quote</span> <FileSignature size={16} className="text-yellow-500"/>
            </button>
          </div>
        )}
        <button onClick={() => setIsFabOpen(!isFabOpen)} className={`bg-yellow-500 hover:bg-yellow-400 text-slate-950 p-4 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-transform duration-300 ${isFabOpen ? "rotate-45" : ""}`}>
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* SIDEBAR & MAIN CONTENT (Remaining Logic is largely unchanged, just uses dynamic navItems and clientList) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-800 bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center text-slate-900 font-black text-xl">Z</div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500">Zenith</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">{currentUser.role} PORTAL</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive ? "bg-slate-800 text-yellow-500 ring-1 ring-yellow-500/40 shadow-lg translate-x-1" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-yellow-500" : ""} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md p-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-300 hover:text-white transition"><Menu size={24}/></button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="rounded-md bg-slate-800/80 p-2 text-yellow-500 border border-slate-700/50"><LayoutDashboard size={18} /></div>
              <div>
                <h1 className="text-lg font-bold text-white capitalize">{activeTab.replace("-", " ")}</h1>
                <p className="text-xs text-slate-400">Welcome back, {currentUser.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end border-r border-slate-800 pr-6">
              <p className="text-xs text-slate-300 font-bold font-mono tracking-widest">{currentTime.toLocaleTimeString()}</p>
              <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5"><ShieldCheck size={12}/> System Active</p>
            </div>
            
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 text-slate-400 hover:text-white transition bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50">
              <Bell size={18} />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-950 animate-pulse" />
            </button>

            <button onClick={() => setCurrentUser(null)} className="p-2.5 text-slate-400 hover:text-red-400 transition bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            {/* VIEW 1: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <HeroSlider slides={dashboardMedia.bannerSlides} activeSlide={0} onSlideChange={() => {}} />
                {currentUser.role === 'ADMIN' && (
                  <>
                    <KpiCounters animatedTotals={totals} formatCurrency={formatCurrency} />
                    <VisualCards cards={dashboardMedia.visualCards} parallaxOffset={dashboardMedia.visualCards.map(()=>({x:0,y:0}))} onCardMouseMove={()=>{}} onCardMouseLeave={()=>{}} />
                  </>
                )}
              </div>
            )}

            {/* VIEW 2: PRICING (ADMIN ONLY) */}
            {activeTab === "pricing" && currentUser.role === 'ADMIN' && (
              <PricingTable rows={rows} onUpdateRow={updateRow} calculateFinalServicePrice={calculateFinalServicePrice} formatCurrency={formatCurrency} totals={totals} searchQuery={searchQuery} setSearchQuery={setSearchQuery} lastUpdated={lastUpdated} />
            )}

            {/* VIEW 3: STAFF (ADMIN ONLY) */}
            {activeTab === "staff" && currentUser.role === 'ADMIN' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Operations & Deployment</h2>
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{staffList.length} Total Staff</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {staffList.map(staff => (
                    <div key={staff.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Briefcase size={64}/></div>
                      <div className="flex flex-col relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-500 font-bold">{staff.name.charAt(0)}</div>
                          <div>
                            <p className="text-white font-bold truncate">{staff.name}</p>
                            <p className="text-xs font-medium text-yellow-500 mt-0.5">{staff.role}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/80">
                          <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><Building size={12}/> {staff.site}</p>
                          <button onClick={() => toggleStaffStatus(staff.id)} className={`mt-3 w-full inline-flex justify-center px-2 py-1.5 text-xs font-black uppercase tracking-wider rounded-md cursor-pointer transition-colors ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                            Status: {staff.status}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 4: INVOICES & CLIENTS */}
            {activeTab === "invoices" && (
              <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Client Portfolio</h2>
                  <button onClick={() => setActiveModal('client')} className="bg-yellow-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg"> + New Client</button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4 font-bold">Client Name</th>
                        <th className="px-6 py-4 font-bold">Monthly Value</th>
                        <th className="px-6 py-4 font-bold">Contract End</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {clientList.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-white font-bold"><Building size={14} className="inline mr-2 text-slate-500"/>{c.name}</td>
                          <td className="px-6 py-4 font-bold text-yellow-500">{formatCurrency(c.totalMonthly)}</td>
                          <td className="px-6 py-4 text-slate-300 font-medium">{c.contractEnd}</td>
                        </tr>
                      ))}
                      {clientList.length === 0 && (
                        <tr><td colSpan="3" className="text-center p-8 text-slate-500">No active clients.</td></tr>
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

export default App;
