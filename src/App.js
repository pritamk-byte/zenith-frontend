import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { 
  BarChart3, Download, LayoutDashboard, Save, ShieldCheck, Users, WalletCards, 
  Search, FileX, CheckCircle2, XCircle, Clock, Menu, Bell, Briefcase, Building, FileText, ArrowUpDown
} from "lucide-react";

// --- MOCK DATABASES & MEDIA ---
const dashboardMedia = {
  bannerSlides: [
    { title: "Security Operations", subtitle: "High-trust guarding and surveillance services", image: "/images/slide-security.svg" },
    { title: "Solar Solutions", subtitle: "Sustainable energy infrastructure for enterprises", image: "/images/slide-solar.svg" },
    { title: "Housekeeping Excellence", subtitle: "Premium facility cleanliness and compliance", image: "/images/slide-housekeeping.svg" },
    { title: "Skilled Manpower", subtitle: "Reliable workforce deployment on demand", image: "/images/slide-manpower.svg" },
    { title: "Electrical & Audit", subtitle: "Safety-first electrical support and governance audits", image: "/images/slide-electrical-audit.svg" },
  ],
  visualCards: [
    { title: "Solar Infrastructure", subtitle: "Clean energy operations", image: "/images/slide-solar.svg" },
    { title: "Integrated Security", subtitle: "24/7 monitored safety", image: "/images/slide-security.svg" },
    { title: "Workforce Excellence", subtitle: "Skilled teams on demand", image: "/images/slide-manpower.svg" },
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

const staffDb = [
  { id: "E001", name: "Ramesh Kumar", role: "Security Supervisor", site: "TechPark Alpha", status: "Active" },
  { id: "E002", name: "Priya Singh", role: "Housekeeping Lead", site: "Oasis Mall", status: "Active" },
  { id: "E003", name: "Amit Patel", role: "Electrical Tech", site: "Zenith HQ", status: "On Leave" },
  { id: "E004", name: "Sarah Khan", role: "Audit Specialist", site: "Roaming", status: "Active" },
];

const clientsDb = [
  { id: "C01", name: "TechPark Alpha", contractEnd: "2026-11-01", totalMonthly: 125000 },
  { id: "C02", name: "Oasis Mall", contractEnd: "2026-05-15", totalMonthly: 85000 },
];

const alertsDb = [
  { id: 1, text: "Oasis Mall contract expires in 30 days.", type: "warning", time: "2h ago" },
  { id: 2, text: "System backup completed.", type: "success", time: "5h ago" },
];

const navItems = [
  { id: "dashboard", label: "Revenue Analytics", icon: BarChart3 },
  { id: "pricing", label: "Service Margins", icon: WalletCards },
  { id: "staff", label: "Staff Management", icon: Users },
  { id: "invoices", label: "Client Invoices", icon: FileText },
];

const API_BASE_URL = "https://zenith-backend-ozvl.onrender.com";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const calculateFinalServicePrice = (baseCost, margin) => {
  const base = Number(baseCost) || 0;
  const marginPct = Number(margin) || 0;
  return base + (base * marginPct) / 100;
};

// --- SUB-COMPONENTS ---

function HeroSlider({ slides, activeSlide, onSlideChange }) {
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

function KpiCounters({ animatedTotals, formatCurrency }) {
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

function VisualCards({ cards, parallaxOffset, onCardMouseMove, onCardMouseLeave }) {
  return (
    <section className="visual-hero mb-6 overflow-hidden rounded-xl border border-slate-800 p-5 sm:p-6 shadow-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent pointer-events-none" />
      <div className="relative z-10 mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">Zenith Visual Showcase</p>
        <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">Solar, Security, and Workforce Operations</h2>
        <p className="mt-1 text-sm text-slate-400">Brand-focused visual cards with subtle motion effects.</p>
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
  // QoL: Table Sorting
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
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-white transition" onClick={() => handleSort('service')}>
                Service <ArrowUpDown size={12} className="inline ml-1 opacity-50"/>
              </th>
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-white transition" onClick={() => handleSort('baseCost')}>
                Base Cost <ArrowUpDown size={12} className="inline ml-1 opacity-50"/>
              </th>
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-white transition" onClick={() => handleSort('margin')}>
                Profit Margin (%) <ArrowUpDown size={12} className="inline ml-1 opacity-50"/>
              </th>
              <th className="px-5 py-4 font-medium sm:px-6 cursor-pointer hover:text-yellow-500 text-yellow-500/80 transition" onClick={() => handleSort('final')}>
                Final Client Price <ArrowUpDown size={12} className="inline ml-1 opacity-50"/>
              </th>
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
                    <p className="text-sm text-slate-500">We couldn't find any services matching "{searchQuery}".</p>
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
  // Global State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  
  // Data State
  const [rows, setRows] = useState(initialPricing);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [clientService, setClientService] = useState(initialPricing[0].service);

  // Animation & Visual State
  const [activeSlide, setActiveSlide] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(dashboardMedia.visualCards.map(() => ({ x: 0, y: 0 })));
  const [animatedTotals, setAnimatedTotals] = useState({ totalBase: 0, totalFinal: 0, avgMargin: 0 });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    window.setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const updateRow = (serviceName, field, value) => {
    setRows((current) => current.map((row) => row.service === serviceName ? { ...row, [field]: value === "" ? "" : Number(value) } : row));
  };

  const totals = useMemo(() => {
    const totalBase = rows.reduce((sum, row) => sum + (Number(row.baseCost) || 0), 0);
    const totalFinal = rows.reduce((sum, row) => sum + calculateFinalServicePrice(row.baseCost, row.margin), 0);
    return { totalBase, totalFinal };
  }, [rows]);

  // Tab 1 Specific Calcs
  const revenueTrend = useMemo(() => rows.map((row) => ({ service: row.service, revenue: calculateFinalServicePrice(row.baseCost, row.margin) })), [rows]);
  const marginTrend = useMemo(() => rows.map((row) => ({ service: row.service, margin: Number(row.margin) || 0 })), [rows]);
  const maxRevenue = useMemo(() => Math.max(...revenueTrend.map((item) => item.revenue), 1), [revenueTrend]);
  const maxMargin = useMemo(() => Math.max(...marginTrend.map((item) => item.margin), 1), [marginTrend]);

  // Tab 1 Effects
  useEffect(() => {
    if (activeTab !== "dashboard") return;
    const timer = window.setInterval(() => setActiveSlide((c) => (c + 1) % dashboardMedia.bannerSlides.length), 3500);
    return () => window.clearInterval(timer);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "dashboard") return;
    const targetBase = totals.totalBase;
    const targetFinal = totals.totalFinal;
    const targetAvgMargin = rows.reduce((sum, row) => sum + (Number(row.margin) || 0), 0) / rows.length;
    let frame = 0; const totalFrames = 28; const start = animatedTotals;
    const timer = window.setInterval(() => {
      frame += 1; const progress = Math.min(frame / totalFrames, 1); const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedTotals({
        totalBase: Math.round(start.totalBase + (targetBase - start.totalBase) * eased),
        totalFinal: Math.round(start.totalFinal + (targetFinal - start.totalFinal) * eased),
        avgMargin: Number((start.avgMargin + (targetAvgMargin - start.avgMargin) * eased).toFixed(2)),
      });
      if (progress >= 1) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [totals, rows, activeTab]);

  // API Actions
  const handleSave = async () => {
    showToast("Saving to database...", "info");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/pricing`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: rows.map((row) => ({ service: row.service, baseCost: Number(row.baseCost) || 0, margin: Number(row.margin) || 0 })) }),
      });
      if (!response.ok) throw new Error(`Save failed`);
      showToast("✅ Pricing saved successfully!", "success");
      setLastUpdated(new Date().toLocaleString());
    } catch {
      showToast("❌ Could not reach API.", "error");
    }
  };

  const handleExportCsv = () => {
    const csv = ["Service,Base Cost,Profit Margin (%),Final Client Price", ...rows.map((row) => `${row.service},${Number(row.baseCost) || 0},${Number(row.margin) || 0},${calculateFinalServicePrice(row.baseCost, row.margin).toFixed(2)}`)].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `zenith-pricing-${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    link.click();
    showToast("📄 CSV Exported Successfully!", "success");
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFillColor(8, 27, 58); doc.rect(0, 0, 595, 95, "F");
    doc.setTextColor(234, 179, 8); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("Zenith Consultancy - Pricing Report", 40, 45);
    doc.setFontSize(11); doc.setTextColor(225, 232, 240); doc.text("Admin ERP | Dynamic Service Pricing", 40, 66);
    doc.setTextColor(31, 41, 55); doc.setFontSize(10);
    const startY = 120; const rowHeight = 28; const colX = [40, 190, 300, 420];
    doc.setFillColor(226, 232, 240); doc.rect(40, startY - 18, 515, 20, "F");
    doc.text("Service", colX[0], startY - 4); doc.text("Base Cost", colX[1], startY - 4); doc.text("Margin (%)", colX[2], startY - 4); doc.text("Final Price", colX[3], startY - 4);
    doc.setFont("helvetica", "normal");
    let currentY = startY + 12;
    rows.forEach((row, idx) => {
      const base = Number(row.baseCost) || 0; const margin = Number(row.margin) || 0; const final = calculateFinalServicePrice(base, margin);
      if (idx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(40, currentY - 13, 515, rowHeight - 2, "F"); }
      doc.text(row.service, colX[0], currentY + 4); doc.text(formatCurrency(base), colX[1], currentY + 4); doc.text(`${margin}%`, colX[2], currentY + 4); doc.text(formatCurrency(final), colX[3], currentY + 4);
      currentY += rowHeight;
    });
    doc.setDrawColor(148, 163, 184); doc.line(40, currentY + 8, 555, currentY + 8);
    doc.setFont("helvetica", "bold"); doc.setTextColor(8, 27, 58);
    doc.text(`Total Base: ${formatCurrency(totals.totalBase)}`, 40, currentY + 30); doc.text(`Total Client Price: ${formatCurrency(totals.totalFinal)}`, 280, currentY + 30);
    doc.save("zenith-pricing-report.pdf");
    showToast("📋 PDF Generated Successfully!", "success");
  };

  const handleCardMouseMove = (index, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    setParallaxOffset((current) => current.map((item, i) => (i === index ? { x, y } : item)));
  };
  const resetCardParallax = (index) => setParallaxOffset((current) => current.map((item, i) => (i === index ? { x: 0, y: 0 } : item)));

  // Generate Official Invoice PDF
  const generateInvoice = (client) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(234, 179, 8); doc.setFontSize(20); doc.text("ZENITH ERP", 15, 25);
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.text("Official Invoice", 150, 25);
    doc.setTextColor(0,0,0); doc.setFontSize(14); doc.text(`Billed To: ${client.name}`, 15, 60);
    doc.setFontSize(10); doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 60);
    doc.text(`Contract ID: ${client.id}`, 15, 70);
    doc.setFillColor(241, 245, 249); doc.rect(15, 90, 180, 10, "F");
    doc.setFont("helvetica", "bold"); doc.text("Description", 20, 97); doc.text("Amount (INR)", 160, 97);
    doc.setFont("helvetica", "normal"); doc.text("Monthly Facility Management & Manpower Services", 20, 115); doc.text(formatCurrency(client.totalMonthly), 160, 115);
    doc.line(15, 130, 195, 130);
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text(`Total Due: ${formatCurrency(client.totalMonthly)}`, 130, 140);
    doc.save(`Zenith_Invoice_${client.name.replace(/\s+/g, "_")}.pdf`);
    showToast(`🧾 Invoice generated for ${client.name}`);
  };

  const selectedClientService = rows.find((row) => row.service === clientService) || rows[0];
  const selectedClientFinalPrice = calculateFinalServicePrice(selectedClientService?.baseCost, selectedClientService?.margin);

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      
      {/* QoL: GLOBAL TOAST NOTIFICATION */}
      <div className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ease-out ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}`}>
        <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border backdrop-blur-md ${toast.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' : toast.type === 'info' ? 'bg-blue-950/90 border-blue-800 text-blue-200' : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'}`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* RESPONSIVE SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-800 bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center text-slate-900 font-black text-xl">Z</div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500">Zenith</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Admin Portal</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><XCircle size={24}/></button>
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

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md p-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-300 hover:text-white transition"><Menu size={24}/></button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="rounded-md bg-slate-800/80 p-2 text-yellow-500 border border-slate-700/50"><LayoutDashboard size={18} /></div>
              <div>
                <h1 className="text-lg font-bold text-white capitalize">{activeTab.replace("-", " ")}</h1>
                <p className="text-xs text-slate-400">Zenith Enterprise System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">System Status</p>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><ShieldCheck size={14}/> DB Linked</p>
            </div>
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 text-slate-400 hover:text-white transition bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50">
                <Bell size={18} />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-950 animate-pulse" />
              </button>
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-slate-700 bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl">
                  <div className="bg-slate-900/90 p-4 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300">2 New</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alertsDb.map(a => (
                      <div key={a.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/50 transition cursor-pointer">
                        <p className={`text-sm font-medium ${a.type === 'warning' ? 'text-yellow-500' : 'text-emerald-400'}`}>{a.text}</p>
                        <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1"><Clock size={10}/> {a.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEW PORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            
            {/* VIEW: 1. DASHBOARD & ANALYTICS */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <HeroSlider slides={dashboardMedia.bannerSlides} activeSlide={activeSlide} onSlideChange={setActiveSlide} />
                <KpiCounters animatedTotals={animatedTotals} formatCurrency={formatCurrency} />
                <VisualCards cards={dashboardMedia.visualCards} parallaxOffset={parallaxOffset} onCardMouseMove={handleCardMouseMove} onCardMouseLeave={resetCardParallax} />
                
                <section className="grid gap-6 xl:grid-cols-2">
                  <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
                    <h3 className="text-base font-bold text-white">Revenue Trend by Service</h3>
                    <p className="mt-1 text-xs text-slate-400">Calculated from base cost + margin pricing.</p>
                    <div className="mt-5 space-y-4">
                      {revenueTrend.map((item) => (
                        <div key={item.service}>
                          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-300">
                            <span>{item.service}</span><span className="text-white">{formatCurrency(item.revenue)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-yellow-500 transition-all duration-1000 ease-out relative" style={{ width: `${Math.max(5, (item.revenue / maxRevenue) * 100).toFixed(2)}%` }}>
                              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                  <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
                    <h3 className="text-base font-bold text-white">Margin Trend by Service</h3>
                    <p className="mt-1 text-xs text-slate-400">Current profit margin percentages.</p>
                    <div className="mt-5 space-y-4">
                      {marginTrend.map((item) => (
                        <div key={item.service}>
                          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-300">
                            <span>{item.service}</span><span className="text-white">{item.margin}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${Math.max(5, (item.margin / maxMargin) * 100).toFixed(2)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>
              </div>
            )}

            {/* VIEW: 2. PRICING ENGINE */}
            {activeTab === "pricing" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-lg">
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={handleSave} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                      <Save size={16} /> Save Pricing to DB
                    </button>
                    <button type="button" onClick={handleExportCsv} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
                      <Download size={16} /> CSV
                    </button>
                    <button type="button" onClick={handleExportPdf} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
                      <FileText size={16} /> PDF
                    </button>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-lg">
                  <h2 className="text-lg font-bold text-white">Client Booking Preview</h2>
                  <p className="mt-1 text-sm text-slate-400">Uses the live margin values and updates instantly.</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Select Service</label>
                      <select value={clientService} onChange={(e) => setClientService(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 appearance-none cursor-pointer">
                        {rows.map((row) => <option key={row.service} value={row.service}>{row.service}</option>)}
                      </select>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Base Cost</p>
                      <p className="mt-1 text-xl font-bold text-white">{formatCurrency(Number(selectedClientService?.baseCost) || 0)}</p>
                    </div>
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full pointer-events-none"/>
                      <p className="text-xs font-bold uppercase tracking-wide text-yellow-500/90">Final Client Price</p>
                      <p className="mt-1 text-xl font-bold text-yellow-500">{formatCurrency(selectedClientFinalPrice)}</p>
                      <p className="mt-1 text-xs font-medium text-slate-400">Margin Applied: <span className="text-white">{Number(selectedClientService?.margin) || 0}%</span></p>
                    </div>
                  </div>
                </section>

                <PricingTable rows={rows} onUpdateRow={updateRow} calculateFinalServicePrice={calculateFinalServicePrice} formatCurrency={formatCurrency} totals={totals} searchQuery={searchQuery} setSearchQuery={setSearchQuery} lastUpdated={lastUpdated} />
              </div>
            )}

            {/* VIEW: 3. STAFF ROSTER */}
            {activeTab === "staff" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Operations & Deployment</h2>
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{staffDb.length} Active Staff</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {staffDb.map(staff => (
                    <div key={staff.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg hover:border-slate-700 transition group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase size={64}/></div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-500 font-bold">{staff.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="text-white font-bold truncate">{staff.name}</p>
                          <p className="text-xs font-medium text-yellow-500 mt-0.5">{staff.role}</p>
                          <div className="mt-3 pt-3 border-t border-slate-800/80">
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 truncate"><Building size={12} className="text-slate-500"/> {staff.site}</p>
                          </div>
                          <div className="mt-3">
                            <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{staff.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: 4. INVOICING */}
            {activeTab === "invoices" && (
              <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Client Invoicing Engine</h2>
                    <p className="text-sm text-slate-400 mt-1">Generate official PDF invoices for active contracts.</p>
                  </div>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-6 py-4 font-bold">Client / Site Name</th>
                          <th className="px-6 py-4 font-bold">Monthly Value</th>
                          <th className="px-6 py-4 font-bold">Contract End</th>
                          <th className="px-6 py-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {clientsDb.map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 text-white font-bold"><Building size={14} className="inline mr-2 text-slate-500"/>{c.name}</td>
                            <td className="px-6 py-4 font-bold text-yellow-500">{formatCurrency(c.totalMonthly)}</td>
                            <td className="px-6 py-4 text-slate-300 font-medium">{c.contractEnd}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => generateInvoice(c)} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm border border-slate-700 hover:border-transparent">
                                <FileText size={14}/> Generate PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
