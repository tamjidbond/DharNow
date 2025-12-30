import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { FaShieldAlt, FaChartPie, FaCubes, FaBiohazard, FaSync, FaTags, FaUserShield, FaSignOutAlt } from 'react-icons/fa';

// Import our new components
import { NavBtn } from '../Components/admin-components/NavBtn';
import { KPICard } from '../Components/admin-components/KPICard';
import AnalyticsTab from '../Components/admin-components/AnalyticsTab';
import InventoryTab from '../Components/admin-components/InventoryTab';
import CategoriesTab from '../Components/admin-components/CategoriesTab';
import SecurityTab from '../Components/admin-components/SecurityTab';
import UsersTab from '../Components/admin-components/UsersTab';

const Admin = () => {
  const [users, setUsers] = useState([]); // Add this line
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

  const handleLogout = () => {
    Swal.fire({
      title: 'Terminate Session?',
      text: "You will need to re-authenticate to access the Core Interface.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1e293b',
      confirmButtonText: 'Logout',
      background: '#0f172a',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userEmail'); // Clear the session
        window.location.href = "/"; // Redirect to home/login
      }
    });
  };

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [u, i, s, intel, cat] = await Promise.all([
        axios.get('https://dharnow.onrender.com/api/admin/all-users'),
        axios.get('https://dharnow.onrender.com/api/admin/all-items'),
        axios.get('https://dharnow.onrender.com/api/admin/system-stats'),
        axios.get('https://dharnow.onrender.com/api/admin/dashboard-intelligence'),
        axios.get('https://dharnow.onrender.com/api/categories')
      ]);
      setUsers(u.data)
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
      await axios.post('https://dharnow.onrender.com/api/categories/add', { name: newCategoryName });
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
      const checkRes = await axios.get(`https://dharnow.onrender.com/api/items/count-by-category/${categoryName}`);
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
          text: `Type "${categoryName}" to permanently remove "${categoryName}" Category.`,
          input: 'text',
          inputPlaceholder: categoryName,
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          background: '#1e293b',
          color: '#fff',
          inputValidator: (value) => {
            if (value !== categoryName) return `you must enter "${categoryName}"  exactly!`;
          }
        });

        if (confirmText !== categoryName) return;
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
      await axios.delete(`https://dharnow.onrender.com/api/categories/${id}`);
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
        await axios.delete(`https://dharnow.onrender.com/api/items/delete/${id}`);
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* 1. Global Wrapper with Responsive Padding */}
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">

        {/* 2. HEADER: Optimized for all screens */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 md:mb-12 gap-6">
          <div className="flex items-center gap-4">
            {/* ... existing Logo code ... */}
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <FaShieldAlt className="text-2xl md:text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white">
                DHAR-NOW <span className="text-indigo-500 font-light italic text-xl md:text-2xl ml-1">CORE</span>
              </h1>
            </div>
          </div>

          {/* NAV BAR with Logout Integrated */}
          <div className="w-full xl:w-auto overflow-x-auto no-scrollbar">
            <nav className="flex items-center bg-slate-800/40 p-1.5 rounded-[2rem] backdrop-blur-2xl border border-white/5 min-w-max shadow-2xl">
              <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<FaChartPie />} label="Analytics" />
              <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<FaUserShield />} label="Users" />
              <NavBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<FaCubes />} label="Items" />
              <NavBtn active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<FaTags />} label="Tags" />
              <NavBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<FaBiohazard />} label="Security" />

              {/* Divider */}
              <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 pr-2">
                <button
                  onClick={fetchAllAdminData}
                  title="Refresh Data"
                  className={`p-3 text-slate-400 hover:text-indigo-400 transition-all rounded-full hover:bg-white/5 ${loading ? 'animate-spin' : ''}`}
                >
                  <FaSync size={16} />
                </button>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-3 text-rose-500 hover:text-white transition-all rounded-full hover:bg-rose-500/20"
                >
                  <FaSignOutAlt size={18} />
                </button>
              </div>
            </nav>
          </div>
        </header>

        {/* 4. KPI GRID: Smart Scaling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <KPICard label="Network Trust" value="98.4%" trend="+2.1%" color="indigo" />
          <KPICard label="Total Items" value={stats.items} trend="+12%" color="emerald" />
          <KPICard label="Verified Neighbors" value={stats.users} trend="+5.4%" color="amber" />
          <KPICard label="System Requests" value={stats.requests} trend="+18%" color="rose" />
        </div>

        {/* 5. CONTENT AREA: Clean separation */}
        <main className="relative z-10 w-full overflow-hidden rounded-[2.5rem]">
          <div className="transition-all duration-500 ease-in-out">
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
            {activeTab === 'users' && <UsersTab users={users} />}
          </div>
        </main>

        {/* 6. FOOTER: Status Indicator for mobile */}
        <footer className="mt-12 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            System Online: Dharnow-v2.0
          </div>
          <p>© 2025 DharLink Secure Admin</p>
        </footer>
      </div>
    </div>
  );
};

export default Admin;