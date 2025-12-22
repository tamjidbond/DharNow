import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShieldAlt, FaChartPie, FaCubes, FaBiohazard, FaSync, FaTags } from 'react-icons/fa';

// Import our new components
import { NavBtn } from '../Components/admin-components/NavBtn';
import { KPICard } from '../Components/admin-components/KPICard';
import AnalyticsTab from '../Components/admin-components/AnalyticsTab';
import InventoryTab from '../Components/admin-components/InventoryTab';
import CategoriesTab from '../Components/admin-components/CategoriesTab';
import SecurityTab from '../Components/admin-components/SecurityTab';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [stats, setStats] = useState({ users: 0, items: 0, requests: 0 });
  const [intelligence, setIntelligence] = useState({ categoryData: [], growthData: [], securityThreats: [] });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    // Check the email stored in localStorage
    const storedEmail = localStorage.getItem('userEmail');

    // If it's not your specific admin email, kick them to the home page
    if (storedEmail !== 'bondtamjid02@gmail.com') {
      window.location.href = "/";
    }
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [u, i, s, intel, cat] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/all-users'),
        axios.get('http://localhost:8000/api/admin/all-items'),
        axios.get('http://localhost:8000/api/admin/system-stats'),
        axios.get('http://localhost:8000/api/admin/dashboard-intelligence'),
        axios.get('http://localhost:8000/api/categories')
      ]);
      setItems(i.data);
      setStats(s.data);
      setIntelligence(intel.data);
      setCategories(cat.data);
    } catch (err) { console.error("Admin Fetch Error:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchAllAdminData(); }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await axios.post('http://localhost:8000/api/categories/add', { name: newCategoryName });
      setNewCategoryName("");
      fetchAllAdminData();
    } catch (err) { alert("Add failed"); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Remove category?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/categories/${id}`);
      fetchAllAdminData();
    } catch (err) { alert("Delete failed"); }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Delete item?")) return;
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-white flex items-center gap-4">
              <span className="bg-indigo-600 p-3 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)]"><FaShieldAlt /></span>
              DHAR-NOW <span className="text-indigo-500 text-2xl font-light italic">CORE</span>
            </h1>
          </div>
          <div className="flex bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-xl border border-white/5">
            <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<FaChartPie />} label="Analytics" />
            <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<FaCubes />} label="Inventory" />
            <NavBtn active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<FaTags />} label="Categories" />
            <NavBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<FaBiohazard />} label="Security" />
            <button onClick={fetchAllAdminData} className="px-4 text-slate-400 hover:text-white transition"><FaSync className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard label="Network Trust" value="98.4%" trend="+2.1%" color="indigo" />
          <KPICard label="Real Items" value={stats.items} trend="+12%" color="emerald" />
          <KPICard label="Verified Users" value={stats.users} trend="+5.4%" color="amber" />
          <KPICard label="Total Requests" value={stats.requests} trend="+18%" color="rose" />
        </div>

        {activeTab === 'analytics' && <AnalyticsTab intelligence={intelligence} COLORS={COLORS} />}
        {activeTab === 'inventory' && <InventoryTab items={items} handleDeleteItem={handleDeleteItem} />}
        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            handleAddCategory={handleAddCategory}
            handleDeleteCategory={handleDeleteCategory}
          />
        )}
        {activeTab === 'security' && <SecurityTab intelligence={intelligence} />}
      </div>
    </div>
  );
};

export default Admin;