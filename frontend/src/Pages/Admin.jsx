import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
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

  // Custom Toast configuration for quick "Success" messages
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#fff'
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
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
    } catch (err) {
      console.error("Admin Fetch Error:", err);
    }
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
      Toast.fire({ icon: 'success', title: 'Category added successfully' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not add category', background: '#0f172a', color: '#fff' });
    }
  };

  const handleDeleteCategory = async (id) => {
    // Find the category name from the ID for our check
    const categoryToProcess = categories.find(c => c._id === id);
    const categoryName = categoryToProcess ? categoryToProcess.name : "";

    try {
      // STEP 1: Check if items are currently using this category
      const checkRes = await axios.get(`http://localhost:8000/api/items/count-by-category/${categoryName}`);
      const itemCount = checkRes.data.count;

      if (itemCount > 0) {
        // STEP 2: First Warning (If items exist)
        const warningResult = await Swal.fire({
          title: 'DANGER: Category in Use!',
          text: `There are ${itemCount} items listed under "${categoryName}". Deleting this will leave these items without a category.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'I understand, proceed',
          background: '#1e293b',
          color: '#fff',
          customClass: { popup: 'rounded-[2rem]' }
        });

        if (!warningResult.isConfirmed) return;

        // STEP 3: Second Step - Typed Confirmation
        const { value: confirmText } = await Swal.fire({
          title: 'Final Protocol',
          text: `Type "DELETE" to permanently remove "${categoryName}"`,
          input: 'text',
          inputPlaceholder: 'DELETE',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          background: '#1e293b',
          color: '#fff',
          inputValidator: (value) => {
            if (value !== 'DELETE') return 'You must type DELETE exactly!';
          }
        });

        if (confirmText !== 'DELETE') return;
      } else {
        // Standard Confirmation for empty categories
        const simpleConfirm = await Swal.fire({
          title: 'Delete Category?',
          text: `Are you sure you want to remove "${categoryName}"?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#6366f1',
          background: '#1e293b',
          color: '#fff'
        });
        if (!simpleConfirm.isConfirmed) return;
      }

      // STEP 4: Execution
      await axios.delete(`http://localhost:8000/api/categories/${id}`);
      fetchAllAdminData();
      Toast.fire({ icon: 'success', title: 'Category permanently purged' });

    } catch (err) {
      console.error("Deletion Error:", err);
      Swal.fire({ icon: 'error', title: 'Action Failed', text: 'Error communicating with database.' });
    }
  };

  const handleDeleteItem = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Item?',
      text: "This item will be removed from the public map.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      background: '#1e293b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/api/items/delete/${id}`);
        fetchAllAdminData();
        Toast.fire({ icon: 'success', title: 'Item deleted' });
      } catch (err) {
        Swal.fire('Error!', 'Delete failed.', 'error');
      }
    }
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