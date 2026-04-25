import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { 
  BarChart3, Download, LayoutDashboard, Save, ShieldCheck, Users, WalletCards, 
  Search, FileX, CheckCircle2, XCircle, Clock, Menu, Bell, Briefcase, Building, 
  FileText, ArrowUpDown, Plus, UserPlus, FileSignature, X, LogOut, Lock, Trash2, Power
} from "lucide-react";

// Import extracted CSS
import "./style.css";

// ==========================================
// 1. IMAGE IMPORTS
// ==========================================
import slideSecurity from "./images/slide-security.svg";
import slideSolar from "./images/slide-solar.svg";
import slideHousekeeping from "./images/slide-housekeeping.svg";
import slideManpower from "./images/slide-manpower.svg";
import slideElectricalAudit from "./images/slide-electrical-audit.svg";

// ==========================================
// 2. MOCK DATABASE (Mapped to your SQL)
// ==========================================
const mockAuthDb = {
  "admin@zenithconsultancy.com": { id: 1, name: "Rudra Admin", role: "ADMIN" },
  "ops.admin@zenithconsultancy.com": { id: 2, name: "Aisha Operations Admin", role: "ADMIN" },
  "nikhil.guard@zenithconsultancy.com": { id: 3, name: "Nikhil Guard", role: "STAFF" },
  "priya.hk@zenithconsultancy.com": { id: 4, name: "Priya Housekeeper", role: "STAFF" },
  "admin@apexindustries.com": { id: 7, name: "Apex Industries Client", role: "CLIENT" }
};

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

const initialPricing = [
  { service: "Housekeeping", baseCost: 18000, margin: 18 },
  { service: "Security", baseCost: 28000, margin: 22 },
  { service: "Solar", baseCost: 36000, margin: 25 },
];

const initialStaffDb = [
  { id: 3, name: "Nikhil Guard", role: "Security Supervisor", site: "TechPark Alpha", status: "Active" },
  { id: 4, name: "Priya Housekeeper", role: "Housekeeping Lead", site: "Oasis Mall", status: "Active" },
  { id: 5, name: "Arun Electrician", role: "Electrical Tech", site: "Zenith HQ", status: "On Holiday" },
];

const initialClientsDb = [
  { id: 7, name: "Apex Industries Client", contractEnd: "2026-11-01", totalMonthly: 125000 },
  { id: 8, name: "Nova Retail Client", contractEnd: "2026-05-15", totalMonthly: 85000 },
];

const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const calculateFinalServicePrice = (baseCost, margin) => (Number(baseCost) || 0) + ((Number(baseCost) || 0) * (Number(margin) || 0)) / 100;

// ==========================================
// 3. UI COMPONENTS
// ==========================================
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-zoom-in">
        <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/50">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN APP ARCHITECTURE
// ==========================================
function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null); 
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Global UI State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [activeModal, setActiveModal] = useState(null); 

  // Data State
  const [rows, setRows] = useState(initialPricing);
  const [staffList, setStaffList] = useState(initialStaffDb);
  const [clientList, setClientList] = useState(initialClientsDb);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form States for Creation Modals
  const [newStaff, setNewStaff] = useState({ name: "", role: "", site: "" });
  const [newClient, setNewClient] = useState({ name: "", contractEnd: "", totalMonthly: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    window.setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  // --- LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    const formattedEmail = loginForm.email.toLowerCase().trim();
    const user = mockAuthDb[formattedEmail];
    
    if (user) {
      setCurrentUser(user);
      setActiveTab("dashboard");
      showToast(`Logged in as ${user.role}`, "success");
    } else {
      showToast("User not found in system.", "error");
    }
  };

  // --- STAFF & CLIENT DATA ACTIONS ---
  const handleAddStaff = (e) => {
    e.preventDefault();
    setStaffList([...staffList, { id: Date.now(), ...newStaff, status: "Active" }]);
    setActiveModal(null);
    showToast(`${newStaff.name} added!`);
  };

  const handleRemoveStaff = (id, name) => {
    setStaffList(staffList.filter(s => s.id !== id));
    showToast(`${name} removed from system.`, "info");
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    setClientList([...clientList, { id: Date.now(), ...newClient }]);
    setActiveModal(null);
    showToast(`${newClient.name} onboarded!`);
  };

  const handleSelfStatusChange = (newStatus) => {
    setStaffList(curr => curr.map(staff => staff.id === currentUser.id ? { ...staff, status: newStatus } : staff));
    showToast(`Your status updated to ${newStatus}`, "info");
  };

  // --- ROLE-BASED NAVIGATION ---
  const navItems = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.role === "CLIENT") {
      return [
        { id: "dashboard", label: "Client Dashboard", icon: BarChart3 },
        { id: "invoices", label: "My Portfolio", icon: FileText }
      ];
    }

    const items = [{ id: "dashboard", label: "Operations Dashboard", icon: BarChart3 }];
    items.push({ id: "pricing", label: "Service Pricing", icon: WalletCards });
    
    if (currentUser.role === "ADMIN") {
      items.push({ id: "staff", label: "Staff Management", icon: Users });
    }
    
    items.push({ id: "invoices", label: "Client Management", icon: Building });
    return items;
  }, [currentUser]);

  // ==========================================
  // VIEW: LOGIN SCREEN
  // ==========================================
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        
        {/* Toast Notification */}
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
           <div className={`px-5 py-3 rounded-full border shadow-xl ${toast.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'}`}>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-zoom-in">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-slate-900 font-black text-4xl mb-4 shadow-[0_0_40px_rgba(234,179,8,0.3)]">Z</div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest">Zenith Connect</h1>
          </div>

          <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Work Email</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                  <input 
                    required 
                    type="email" 
                    value={loginForm.email} 
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-yellow-500 outline-none"
                    placeholder="e.g. admin@zenithconsultancy.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Password</label>
                <input 
                  required 
                  type="password" 
                  value={loginForm.password} 
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-yellow-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-lg mt-6 transition">
              Login to Portal
            </button>
            
            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800 pt-4 flex flex-col gap-1">
              <p><b>Admin:</b> admin@zenithconsultancy.com</p>
              <p><b>Staff:</b> nikhil.guard@zenithconsultancy.com</p>
              <p><b>Client:</b> admin@apexindustries.com</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN DASHBOARD LAYOUT
  // ==========================================
  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-yellow-500/30">
      
      {/* GLOBAL TOAST */}
      <div className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}`}>
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-slate-800 border border-slate-700 text-white shadow-xl">
          <CheckCircle2 size={18} className="text-emerald-400"/>
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      </div>

      {/* DYNAMIC CREATION MODALS */}
      {activeModal === 'staff' && currentUser.role === 'ADMIN' && (
        <Modal title="Deploy New Staff" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <input required placeholder="Full Name" type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            <input required placeholder="Role (e.g. Guard)" type="text" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            <input required placeholder="Assigned Site" type="text" value={newStaff.site} onChange={e => setNewStaff({...newStaff, site: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg hover:bg-yellow-400">Add Staff</button>
          </form>
        </Modal>
      )}

      {activeModal === 'client' && (currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') && (
        <Modal title="Onboard New Client" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddClient} className="space-y-4">
            <input required placeholder="Company Name" type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            <input required type="date" value={newClient.contractEnd} onChange={e => setNewClient({...newClient, contractEnd: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" style={{colorScheme: 'dark'}}/>
            <input required placeholder="Monthly Value (₹)" type="number" value={newClient.totalMonthly} onChange={e => setNewClient({...newClient, totalMonthly: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
            <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg hover:bg-yellow-400">Save Client</button>
          </form>
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
            </div>
          )}
          <button onClick={() => setIsFabOpen(!isFabOpen)} className={`bg-yellow-500 text-slate-950 p-4 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-transform duration-300 ${isFabOpen ? "rotate-45" : ""}`}>
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center text-slate-900 font-black text-xl">Z</div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500">Zenith</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">{currentUser.role} PORTAL</p>
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
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive ? "bg-slate-800 text-yellow-500 ring-1 ring-yellow-500/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                >
                  <Icon size={18} className={isActive ? "text-yellow-500" : ""} /> {item.label}
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
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-300"><Menu size={24}/></button>
            <div>
              <h1 className="text-lg font-bold text-white capitalize">{activeTab.replace("-", " ")}</h1>
              <p className="text-xs text-slate-400">{currentUser.name} | {currentUser.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* STAFF SELF-STATUS SELECTOR */}
            {currentUser.role === 'STAFF' && (
              <div className="hidden sm:flex items-center gap-2 border-r border-slate-800 pr-6">
                <Power size={14} className="text-slate-400" />
                <select 
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none focus:border-yellow-500"
                  value={staffList.find(s => s.id === currentUser.id)?.status || "Active"}
                  onChange={(e) => handleSelfStatusChange(e.target.value)}
                >
                  <option value="Active">Active Duty</option>
                  <option value="Inactive">Off Shift</option>
                  <option value="On Holiday">On Holiday</option>
                </select>
              </div>
            )}

            <button onClick={() => setCurrentUser(null)} className="p-2 text-slate-400 hover:text-red-400 transition bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50" title="Logout">
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
              <div className="space-y-6 animate-fade-in">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to Zenith, {currentUser.name.split(' ')[0]}</h2>
                  <p className="text-slate-400">Your role provides you access to specific tools and datasets.</p>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 2: PRICING (ADMIN CAN EDIT, STAFF CAN READ) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "pricing" && (
              <div className="space-y-6 animate-slide-in">
                <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Service Catalog & Pricing</h2>
                    {currentUser.role === 'STAFF' && <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">Read Only</span>}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-950/60 text-left text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-5 py-4 font-medium">Service</th>
                          <th className="px-5 py-4 font-medium">Base Cost</th>
                          <th className="px-5 py-4 font-medium">Margin (%)</th>
                          <th className="px-5 py-4 font-medium text-yellow-500">Final Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {rows.map((row) => (
                          <tr key={row.service} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-4 text-white font-medium">{row.service}</td>
                            
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
                                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 pl-7 text-white outline-none focus:border-yellow-500"
                                    />
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="relative w-24">
                                    <input 
                                      type="number" 
                                      value={row.margin} 
                                      onChange={(e) => setRows(rows.map(r => r.service === row.service ? {...r, margin: e.target.value} : r))} 
                                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white outline-none focus:border-yellow-500"
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
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 3: STAFF (ADMIN ONLY) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "staff" && currentUser.role === 'ADMIN' && (
              <div className="space-y-6 animate-slide-in">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {staffList.map(staff => (
                    <div key={staff.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative group">
                      
                      {/* ADMIN DELETE BUTTON */}
                      <button 
                        onClick={() => handleRemoveStaff(staff.id, staff.name)} 
                        className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={16}/>
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-500 font-bold">
                          {staff.name.charAt(0)}
                        </div>
                        <div className="max-w-[70%]">
                          <p className="text-white font-bold truncate">{staff.name}</p>
                          <p className="text-xs text-yellow-500 truncate">{staff.role}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                        <p className="text-xs text-slate-400 truncate pr-2 flex items-center gap-1">
                          <Building size={10} /> {staff.site}
                        </p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded whitespace-nowrap ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : staff.status === 'On Holiday' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                          {staff.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* VIEW 4: CLIENTS/INVOICES (ALL ROLES) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "invoices" && (
              <div className="space-y-6 animate-slide-in">
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-6 py-4 font-medium">Client Name</th>
                          <th className="px-6 py-4 font-medium">Monthly Value</th>
                          <th className="px-6 py-4 font-medium">Contract End</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {clientList
                          // If role is CLIENT, ONLY show their specific row!
                          .filter(c => currentUser.role !== 'CLIENT' || c.name === currentUser.name)
                          .map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 text-white font-bold"><Building size={14} className="inline mr-2 text-slate-500"/>{c.name}</td>
                            <td className="px-6 py-4 font-bold text-yellow-500">{formatCurrency(c.totalMonthly)}</td>
                            <td className="px-6 py-4 text-slate-300">{c.contractEnd}</td>
                          </tr>
                        ))}
                        {clientList.length === 0 && (
                          <tr>
                            <td colSpan="3" className="text-center p-8 text-slate-500">No active clients.</td>
                          </tr>
                        )}
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
