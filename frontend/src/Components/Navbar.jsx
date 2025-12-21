import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaPlusCircle, FaSignOutAlt, FaPersonBooth, FaGripfire, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';

const Navbar = () => {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  // This effect runs when the component loads
  useEffect(() => {
    // 1. Check if user is logged in
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    // 2. Listen for login/logout events from other tabs/actions
    const handleAuthChange = () => {
      setUserEmail(localStorage.getItem('userEmail'));
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail'); // Delete the session
    setUserEmail(null);
    navigate('/register');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-[1000] px-4 py-3 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
            <FaMapMarkedAlt className="text-white text-xl" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">
            Dhar<span className="text-indigo-600">Link</span>
          </span>
        </Link>

        {/* LINKS */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-600 font-bold hover:text-indigo-600 transition text-sm uppercase tracking-wider">Browse</Link>
          
          {/* Check userEmail instead of Firebase user */}
          {userEmail ? (
            <div className="flex items-center gap-4">
              <Link to="/lend" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-indigo-700 transition shadow-md">
                <FaPlusCircle /> Lend
              </Link>
              <Link to="/profile" className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition hover:text-indigo-600">
                <FaPersonBooth /> Profile
              </Link>
              {/* Optional: Add logic to show Admin only for your email */}
              <Link to="/admin" className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition hover:text-orange-500">
                <FaGripfire /> Admin
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition text-xl border-l pl-4 border-slate-200">
                <FaSignOutAlt title="Logout" />
              </button>
            </div>
          ) : (
            <Link to="/register" className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-full font-bold hover:bg-slate-900 transition">
              <FaUserCircle /> Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;