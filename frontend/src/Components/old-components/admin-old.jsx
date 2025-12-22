import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    FaShieldAlt, FaChartPie, FaChartLine, FaUserSlash, FaBiohazard,
    FaMapMarkedAlt, FaCubes, FaArrowUp, FaSync, FaExclamationTriangle, FaTrashAlt, FaTags, FaPlus
} from 'react-icons/fa';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]); // NEW STATE
    const [newCategoryName, setNewCategoryName] = useState(""); // NEW STATE
    const [stats, setStats] = useState({ users: 0, items: 0, requests: 0 });
    const [intelligence, setIntelligence] = useState({ categoryData: [], growthData: [], securityThreats: [] });
    const [loading, setLoading] = useState(true);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const fetchAllAdminData = async () => {
        setLoading(true);
        try {
            // Fetching everything including new categories endpoint
            const [u, i, s, intel, cat] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/all-users'),
                axios.get('http://localhost:8000/api/admin/all-items'),
                axios.get('http://localhost:8000/api/admin/system-stats'),
                axios.get('http://localhost:8000/api/admin/dashboard-intelligence'),
                axios.get('http://localhost:8000/api/categories') // NEW FETCH
            ]);

            setUsers(u.data);
            setItems(i.data);
            setStats(s.data);
            setIntelligence(intel.data);
            setCategories(cat.data); // SET CATEGORIES
        } catch (err) {
            console.error("Admin Fetch Error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllAdminData();
    }, []);

    // --- NEW CATEGORY FUNCTIONS ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await axios.post('http://localhost:8000/api/categories/add', { name: newCategoryName });
            setNewCategoryName("");
            fetchAllAdminData();
        } catch (err) { alert("Failed to add category"); }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Remove this category?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/categories/${id}`);
            fetchAllAdminData();
        } catch (err) { alert("Delete failed"); }
    };

    // --- EXISTING DELETE FUNCTION ---
    const handleDeleteItem = async (id) => {
        if (!window.confirm("Permanently delete this item?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/items/delete/${id}`);
            fetchAllAdminData();
        } catch (err) { alert("Delete failed"); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-10 font-sans selection:bg-indigo-500/30">
            <div className="max-w-[1600px] mx-auto">

                {/* --- HOLO-HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black tracking-tighter text-white flex items-center gap-4">
                            <span className="bg-indigo-600 p-3 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                                <FaShieldAlt />
                            </span>
                            DHAR-NOW <span className="text-indigo-500 text-2xl font-light italic">CORE</span>
                        </h1>
                        <p className="text-slate-400 font-mono text-sm uppercase tracking-[0.2em]">Real-Time Protocol Management</p>
                    </div>

                    <div className="flex bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-xl border border-white/5">
                        <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<FaChartPie />} label="Analytics" />
                        <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<FaCubes />} label="Inventory" />
                        <NavBtn active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<FaTags />} label="Categories" />
                        <NavBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<FaBiohazard />} label="Security" />
                        <button onClick={fetchAllAdminData} className="px-4 text-slate-400 hover:text-white transition"><FaSync className={loading ? 'animate-spin' : ''} /></button>
                    </div>
                </header>

                {/* --- KPI STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <KPICard label="Network Trust" value="98.4%" trend="+2.1%" color="indigo" />
                    <KPICard label="Real Items" value={stats.items} trend="+12%" color="emerald" />
                    <KPICard label="Verified Users" value={stats.users} trend="+5.4%" color="amber" />
                    <KPICard label="Total Requests" value={stats.requests} trend="+18%" color="rose" />
                </div>

                {/* --- CATEGORIES VIEW (NEW) --- */}
                {activeTab === 'categories' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                        {/* Add Category Form */}
                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md h-fit">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FaPlus className="text-indigo-400" /> Protocol: New Category
                            </h3>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Enter category name..."
                                    className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 transition font-bold"
                                />
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-xs">
                                    Inject Category
                                </button>
                            </form>
                        </div>

                        {/* Category List */}
                        <div className="lg:col-span-2 bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FaTags className="text-indigo-400" /> Active Categories ({categories.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categories.map((cat) => (
                                    <div key={cat._id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/50 transition">
                                        <span className="font-black uppercase tracking-widest text-xs text-slate-300">{cat.name}</span>
                                        <button
                                            onClick={() => handleDeleteCategory(cat._id)}
                                            className="text-slate-500 hover:text-rose-500 transition-colors p-2"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ANALYTICS VIEW --- */}
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
                        {/* AREA CHART: GROWTH */}
                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FaChartLine className="text-indigo-400" /> Listing Velocity (Real)
                            </h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={intelligence.growthData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                        <Area type="monotone" dataKey="items" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={4} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* PIE CHART: CATEGORIES */}
                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FaChartPie className="text-indigo-400" /> Community Supply Mix
                            </h3>
                            <div className="h-[350px] flex flex-col md:flex-row items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={intelligence.categoryData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                                            {intelligence.categoryData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-3 w-full md:w-48 max-h-[300px] overflow-y-auto pr-2">
                                    {intelligence.categoryData.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{c.name}</span>
                                            </div>
                                            <span className="text-xs font-black">{c.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- INVENTORY TAB --- */}
                {activeTab === 'inventory' && (
                    <div className="bg-slate-800/40 rounded-[2.5rem] border border-white/5 overflow-hidden animate-in slide-in-from-right-4 duration-500">
                        <div className="p-8 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                                        <th className="pb-4 px-4">Item Details</th>
                                        <th className="pb-4">Category</th>
                                        <th className="pb-4">Owner</th>
                                        <th className="pb-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {items.map(item => (
                                        <tr key={item._id} className="group hover:bg-white/5 transition">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                                                    <div>
                                                        <p className="font-bold text-white leading-none mb-1">{item.title}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono">{item._id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-xs font-bold text-indigo-400 uppercase">{item.category}</td>
                                            <td className="py-4 text-xs text-slate-400">{item.lentBy}</td>
                                            <td className="py-4">
                                                <button onClick={() => handleDeleteItem(item._id)} className="text-slate-500 hover:text-rose-500 transition-colors p-2">
                                                    <FaTrashAlt />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="lg:col-span-2 bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-2xl font-black mb-6 text-rose-500 flex items-center gap-3">
                                <FaUserSlash /> Behavioral Anomaly Detection
                            </h3>
                            <div className="space-y-4">
                                {intelligence.securityThreats.length === 0 ? (
                                    <div className="text-center py-20 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                                        <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm">System Integrity Nominal: 0 Threats</p>
                                    </div>
                                ) : (
                                    intelligence.securityThreats.map((u, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500"><FaExclamationTriangle /></div>
                                                <div>
                                                    <p className="font-bold text-white">{u.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-500 uppercase">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-rose-500 font-black text-xl">{u.pendingCount}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">Overdue Returns</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-indigo-600/10 p-8 rounded-[2.5rem] border border-indigo-500/20">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FaShieldAlt className="text-indigo-400" /> Trust Ledger</h3>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6">Autonomous monitoring of borrow-return cycles.</p>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[92%] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                </div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase mt-4 tracking-widest">Global Integrity: 92%</p>
                            </div>
                            <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><FaMapMarkedAlt className="text-emerald-400" /> Area Clusters</h3>
                                <p className="text-3xl font-black text-white">4 Active Nodes</p>
                                <p className="text-[10px] text-slate-500 uppercase mt-2 font-bold tracking-tighter">Banani • Dhanmondi • Gulshan • Uttara</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NavBtn = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{icon} {label}</button>
);

const KPICard = ({ label, value, trend, color }) => (
    <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md group transition-all hover:border-white/20">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
        <div className="flex justify-between items-end">
            <h2 className="text-4xl font-black text-white tracking-tighter">{value}</h2>
            <span className={`text-${color}-400 text-xs font-black flex items-center gap-1 bg-${color}-400/10 px-2 py-1 rounded-lg`}>
                <FaArrowUp className="text-[8px]" /> {trend}
            </span>
        </div>
    </div>
);

export default Admin;