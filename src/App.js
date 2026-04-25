import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { BarChart3, Download, LayoutDashboard, Save, ShieldCheck, Users, WalletCards } from "lucide-react";

// --- CONTENT MEDIA (From content/media.js) ---
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

// --- INITIAL DATA ---
const initialPricing = [
  { service: "Housekeeping", baseCost: 18000, margin: 18 },
  { service: "Security", baseCost: 28000, margin: 22 },
  { service: "Manpower", baseCost: 24000, margin: 20 },
  { service: "Electrical", baseCost: 21000, margin: 19 },
  { service: "Solar", baseCost: 36000, margin: 25 },
  { service: "Audit", baseCost: 16000, margin: 17 },
];

const navItems = [
  { label: "Revenue Analytics", icon: BarChart3 },
  { label: "Staff Management", icon: Users },
  { label: "Service Margins", icon: WalletCards },
];

const API_BASE_URL = "https://zenith-backend-ozvl.onrender.com/"; // Changed to local backend

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const calculateFinalServicePrice = (baseCost, margin) => {
  const base = Number(baseCost) || 0;
  const marginPct = Number(margin) || 0;
  return base + (base * marginPct) / 100;
};

// --- COMPONENTS ---

function HeroSlider({ slides, activeSlide, onSlideChange }) {
  return (
    <section className="hero-slider mb-6 overflow-hidden rounded-xl border border-slate-800">
      <div className="hero-slider-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
        {slides.map((slide) => (
          <article key={slide.title} className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
            <div className="hero-slide-overlay" />
            <div className="hero-slide-content">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Zenith Service Highlight</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-3xl">{slide.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">{slide.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="hero-slider-dots">
        {slides.map((_, index) => (
          <button key={index} type="button" onClick={() => onSlideChange(index)} className={`hero-dot ${activeSlide === index ? "active" : ""}`} />
        ))}
      </div>
    </section>
  );
}

function KpiCounters({ animatedTotals, formatCurrency }) {
  return (
    <section className="mb-6 grid gap-4 md:grid-cols-3">
      <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Live Total Base</p>
        <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(animatedTotals.totalBase)}</p>
      </article>
      <article className="rounded-xl border border-gold/40 bg-gold/10 p-4">
        <p className="text-xs uppercase tracking-wide text-gold/90">Live Client Revenue</p>
        <p className="mt-1 text-2xl font-semibold text-gold">{formatCurrency(animatedTotals.totalFinal)}</p>
      </article>
      <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Average Margin</p>
        <p className="mt-1 text-2xl font-semibold text-white">{animatedTotals.avgMargin}%</p>
      </article>
    </section>
  );
}

function PricingTable({ rows, onUpdateRow, calculateFinalServicePrice, formatCurrency, totals }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-white">Dynamic Pricing Table</h2>
        <p className="mt-1 text-sm text-slate-400">Enter base cost and profit margin to auto-calculate final client pricing.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium sm:px-6">Service</th>
              <th className="px-5 py-3 font-medium sm:px-6">Base Cost</th>
              <th className="px-5 py-3 font-medium sm:px-6">Profit Margin (%)</th>
              <th className="px-5 py-3 font-medium sm:px-6">Final Client Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const base = Number(row.baseCost) || 0;
              const margin = Number(row.margin) || 0;
              const final = calculateFinalServicePrice(base, margin);
              return (
                <tr key={row.service} className="border-t border-slate-800/80 text-slate-200">
                  <td className="px-5 py-4 font-medium sm:px-6">{row.service}</td>
                  <td className="px-5 py-4 sm:px-6">
                    <input
                      type="number" min="0" value={row.baseCost}
                      onChange={(event) => onUpdateRow(index, "baseCost", event.target.value)}
                      className="w-36 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-gold/70"
                    />
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <input
                      type="number" min="0" max="1000" value={row.margin}
                      onChange={(event) => onUpdateRow(index, "margin", event.target.value)}
                      className="w-32 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-gold/70"
                    />
                  </td>
                  <td className="px-5 py-4 font-semibold text-gold sm:px-6">{formatCurrency(final)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 border-t border-slate-800 px-5 py-4 sm:grid-cols-2 sm:px-6">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Base Cost</p>
          <p className="mt-1 text-xl font-semibold text-white">{formatCurrency(totals.totalBase)}</p>
        </div>
        <div className="rounded-lg border border-gold/30 bg-gold/10 p-4">
          <p className="text-xs uppercase tracking-wide text-gold/90">Total Client Pricing</p>
          <p className="mt-1 text-xl font-semibold text-gold">{formatCurrency(totals.totalFinal)}</p>
        </div>
      </div>
    </section>
  );
}

function VisualCards({ cards, parallaxOffset, onCardMouseMove, onCardMouseLeave }) {
  return (
    <section className="visual-hero mb-6 overflow-hidden rounded-xl border border-slate-800 p-5 sm:p-6">
      <div className="visual-glow" />
      <div className="relative z-10 mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Zenith Visual Showcase</p>
        <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Solar, Security, and Workforce Operations</h2>
        <p className="mt-1 text-sm text-slate-300">Brand-focused visual cards with subtle motion effects for a premium dashboard feel.</p>
      </div>
      <div className="relative z-10 grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <article
            key={card.title}
            className="visual-card rounded-lg border border-white/15 p-4"
            onMouseMove={(event) => onCardMouseMove(index, event)}
            onMouseLeave={() => onCardMouseLeave(index)}
            style={{
              transform: `perspective(700px) rotateX(${(-parallaxOffset[index].y).toFixed(2)}deg) rotateY(${parallaxOffset[index].x.toFixed(2)}deg)`,
              backgroundImage: `url(${card.image})`,
            }}
          >
            <p className="text-sm font-semibold text-white">{card.title}</p>
            <p className="mt-1 text-xs text-slate-200">{card.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// --- MAIN APP (The original 450-line component body) ---

function App() {
  const [rows, setRows] = useState(initialPricing);
  const [saveMessage, setSaveMessage] = useState("");
  const [clientService, setClientService] = useState(initialPricing[0].service);
  const [activeSlide, setActiveSlide] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(
    dashboardMedia.visualCards.map(() => ({ x: 0, y: 0 }))
  );
  const [animatedTotals, setAnimatedTotals] = useState({
    totalBase: 0,
    totalFinal: 0,
    avgMargin: 0,
  });

  const updateRow = (index, field, value) => {
    setRows((current) =>
      current.map((row, i) =>
        i === index ? { ...row, [field]: value === "" ? "" : Number(value) } : row
      )
    );
  };

  const totals = useMemo(() => {
    const totalBase = rows.reduce((sum, row) => sum + (Number(row.baseCost) || 0), 0);
    const totalFinal = rows.reduce(
      (sum, row) => sum + calculateFinalServicePrice(row.baseCost, row.margin),
      0
    );
    return { totalBase, totalFinal };
  }, [rows]);

  const revenueTrend = useMemo(
    () =>
      rows.map((row) => ({
        service: row.service,
        revenue: calculateFinalServicePrice(row.baseCost, row.margin),
      })),
    [rows]
  );
  const marginTrend = useMemo(
    () => rows.map((row) => ({ service: row.service, margin: Number(row.margin) || 0 })),
    [rows]
  );
  const maxRevenue = useMemo(
    () => Math.max(...revenueTrend.map((item) => item.revenue), 1),
    [revenueTrend]
  );
  const maxMargin = useMemo(
    () => Math.max(...marginTrend.map((item) => item.margin), 1),
    [marginTrend]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % dashboardMedia.bannerSlides.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const targetBase = totals.totalBase;
    const targetFinal = totals.totalFinal;
    const targetAvgMargin =
      rows.reduce((sum, row) => sum + (Number(row.margin) || 0), 0) / rows.length;

    let frame = 0;
    const totalFrames = 28;
    const start = animatedTotals;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedTotals({
        totalBase: Math.round(start.totalBase + (targetBase - start.totalBase) * eased),
        totalFinal: Math.round(start.totalFinal + (targetFinal - start.totalFinal) * eased),
        avgMargin: Number((start.avgMargin + (targetAvgMargin - start.avgMargin) * eased).toFixed(2)),
      });
      if (progress >= 1) window.clearInterval(timer);
    }, 18);

    return () => window.clearInterval(timer);
  }, [totals.totalBase, totals.totalFinal, rows]);

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/pricing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: rows.map((row) => ({
            service: row.service,
            baseCost: Number(row.baseCost) || 0,
            margin: Number(row.margin) || 0,
          })),
        }),
      });
      if (!response.ok) throw new Error(`Save failed with status ${response.status}`);
      setSaveMessage("Pricing saved to backend.");
      fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "MARGIN_UPDATED", metadata: { source: "dashboard_save" } }),
      }).catch(() => {});
    } catch {
      setSaveMessage("Could not reach API. Check backend endpoint.");
    } finally {
      window.setTimeout(() => setSaveMessage(""), 2500);
    }
  };

  const handleExportCsv = () => {
    const header = "Service,Base Cost,Profit Margin (%),Final Client Price";
    const body = rows
      .map((row) => {
        const base = Number(row.baseCost) || 0;
        const margin = Number(row.margin) || 0;
        const final = calculateFinalServicePrice(base, margin);
        return `${row.service},${base},${margin},${final.toFixed(2)}`;
      })
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zenith-pricing-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "EXPORT_CSV", metadata: { rows: rows.length } }),
    }).catch(() => {});
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFillColor(8, 27, 58);
    doc.rect(0, 0, 595, 95, "F");
    doc.setTextColor(200, 164, 77);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Zenith Consultancy - Pricing Report", 40, 45);
    doc.setFontSize(11);
    doc.setTextColor(225, 232, 240);
    doc.text("Admin ERP | Dynamic Service Pricing", 40, 66);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const startY = 120;
    const rowHeight = 28;
    const colX = [40, 190, 300, 420];
    doc.setFillColor(226, 232, 240);
    doc.rect(40, startY - 18, 515, 20, "F");
    doc.text("Service", colX[0], startY - 4);
    doc.text("Base Cost", colX[1], startY - 4);
    doc.text("Margin (%)", colX[2], startY - 4);
    doc.text("Final Price", colX[3], startY - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    let currentY = startY + 12;
    rows.forEach((row, idx) => {
      const base = Number(row.baseCost) || 0;
      const margin = Number(row.margin) || 0;
      const final = calculateFinalServicePrice(base, margin);
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(40, currentY - 13, 515, rowHeight - 2, "F");
      }
      doc.text(row.service, colX[0], currentY + 4);
      doc.text(formatCurrency(base), colX[1], currentY + 4);
      doc.text(`${margin}%`, colX[2], currentY + 4);
      doc.text(formatCurrency(final), colX[3], currentY + 4);
      currentY += rowHeight;
    });
    doc.setDrawColor(148, 163, 184);
    doc.line(40, currentY + 8, 555, currentY + 8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 27, 58);
    doc.text(`Total Base: ${formatCurrency(totals.totalBase)}`, 40, currentY + 30);
    doc.text(`Total Client Price: ${formatCurrency(totals.totalFinal)}`, 280, currentY + 30);
    doc.save("zenith-pricing-report.pdf");
    fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "EXPORT_PDF", metadata: { rows: rows.length } }),
    }).catch(() => {});
  };

  const selectedClientService = rows.find((row) => row.service === clientService) || rows[0];
  const selectedClientFinalPrice = calculateFinalServicePrice(
    selectedClientService?.baseCost,
    selectedClientService?.margin
  );

  const handleCardMouseMove = (index, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    setParallaxOffset((current) => current.map((item, i) => (i === index ? { x, y } : item)));
  };
  const resetCardParallax = (index) => {
    setParallaxOffset((current) => current.map((item, i) => (i === index ? { x: 0, y: 0 } : item)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden min-h-screen w-72 border-r border-slate-800 bg-slate-900/70 p-6 lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="zenith-logo" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold text-yellow-500">
                Zenith Consultancy
              </p>
              <p className="text-xs text-slate-400">Admin ERP</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === 2;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-slate-800 text-yellow-500 ring-1 ring-yellow-500/40"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-5 sm:p-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-800 p-2 text-yellow-500">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  Admin ERP Dashboard
                </h1>
                <p className="text-sm text-slate-400">
                  Dynamic pricing control for facility services
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-900/30 px-3 py-1 text-xs text-emerald-300">
              <ShieldCheck size={14} />
              Secure Internal View
            </div>
          </header>

          <HeroSlider
            slides={dashboardMedia.bannerSlides}
            activeSlide={activeSlide}
            onSlideChange={setActiveSlide}
          />

          <KpiCounters animatedTotals={animatedTotals} formatCurrency={formatCurrency} />

          <VisualCards
            cards={dashboardMedia.visualCards}
            parallaxOffset={parallaxOffset}
            onCardMouseMove={handleCardMouseMove}
            onCardMouseLeave={resetCardParallax}
          />

          <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-500 transition hover:bg-yellow-500/20"
              >
                <Save size={16} />
                Save Pricing
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
              >
                <Download size={16} />
                Export PDF
              </button>
              <span className="text-xs text-emerald-300">{saveMessage}</span>
            </div>
          </section>

          <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-white">Client Booking Preview</h2>
            <p className="mt-1 text-sm text-slate-400">
              Uses the same margin values set by Admin and updates instantly.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
                  Service Type
                </label>
                <select
                  value={clientService}
                  onChange={(event) => setClientService(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-yellow-500/70"
                >
                  {rows.map((row) => (
                    <option key={row.service} value={row.service}>
                      {row.service}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Base Cost</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {formatCurrency(Number(selectedClientService?.baseCost) || 0)}
                </p>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <p className="text-xs uppercase tracking-wide text-yellow-500/90">Final Client Price</p>
                <p className="mt-1 text-lg font-semibold text-yellow-500">
                  {formatCurrency(selectedClientFinalPrice)}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Margin: {Number(selectedClientService?.margin) || 0}%
                </p>
              </div>
            </div>
          </section>

          <PricingTable
            rows={rows}
            onUpdateRow={updateRow}
            calculateFinalServicePrice={calculateFinalServicePrice}
            formatCurrency={formatCurrency}
            totals={totals}
          />

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-base font-semibold text-white">Revenue Trend by Service</h3>
              <p className="mt-1 text-xs text-slate-400">
                Calculated from base cost + margin pricing.
              </p>
              <div className="mt-4 space-y-3">
                {revenueTrend.map((item) => (
                  <div key={item.service}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                      <span>{item.service}</span>
                      <span>{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="h-2 rounded bg-slate-800">
                      <div
                        className="h-2 rounded bg-yellow-500"
                        style={{
                          width: `${Math.max(8, (item.revenue / maxRevenue) * 100).toFixed(2)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-base font-semibold text-white">Margin Trend by Service</h3>
              <p className="mt-1 text-xs text-slate-400">
                Current profit margin percentages.
              </p>
              <div className="mt-4 space-y-3">
                {marginTrend.map((item) => (
                  <div key={item.service}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                      <span>{item.service}</span>
                      <span>{item.margin}%</span>
                    </div>
                    <div className="h-2 rounded bg-slate-800">
                      <div
                        className="h-2 rounded bg-blue-400"
                        style={{
                          width: `${Math.max(8, (item.margin / maxMargin) * 100).toFixed(2)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
