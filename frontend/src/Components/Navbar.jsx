import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaUserCircle, FaSignOutAlt, FaSearch, FaHandsHelping, FaBullhorn } from 'react-icons/fa'; // Added FaBullhorn
import { useNavigate, NavLink, Link } from 'react-router';
import axios from 'axios';
import { SiGooglemessages } from "react-icons/si";

const Navbar = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchUnread = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    try {
      const res = await axios.get(`http://localhost:8000/api/messages/${email}`);
      const unread = res.data.filter(m => m.receiverEmail === email && m.isRead === false).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Badge fetch error:", err);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
    fetchUnread();
    window.addEventListener('messagesRead', fetchUnread);
    const sync = () => {
      setUserEmail(localStorage.getItem('userEmail'));
      fetchUnread();
    };
    window.addEventListener('storage', sync);
    const interval = setInterval(fetchUnread, 10000);
    return () => {
      window.removeEventListener('messagesRead', fetchUnread);
      window.removeEventListener('storage', sync);
      clearInterval(interval);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    setUserEmail(null);
    setUnreadCount(0);
    navigate('/register');
  };

  const getLinkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-sm transition-all duration-200 ${isActive
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-[1000] px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <Link to="/" className="flex items-center gap-2 group">
            <FaHandsHelping className="text-indigo-600 text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-800">
              Dhar<span className="text-indigo-600">Now</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={getLinkStyle}><FaSearch className="text-lg" /><span>Browse</span></NavLink>



              {userEmail && (
                <>
                  <NavLink to="/inbox" className={getLinkStyle}>
                    <div className="relative">
                      <SiGooglemessages className="text-xl" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>
                      )}
                    </div>
                    <span>Messages</span>
                  </NavLink>
                  <NavLink to="/lend" className={getLinkStyle}><FaPlusCircle className="text-xl" /><span>Lend</span></NavLink>
                  <NavLink to="/profile" className={getLinkStyle}><FaUserCircle className="text-xl" /><span>Profile</span></NavLink>
                </>
              )}
            </div>

            {userEmail ? (
              <div className="flex items-center">
                <div className="hidden md:block h-6 w-px bg-slate-200 mx-2"></div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-slate-400 hover:text-rose-500 font-bold text-sm px-3 py-2 transition-colors"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/register" className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-600 transition-all font-bold text-sm shadow-sm">
                <FaUserCircle className="text-lg" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      {userEmail && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-[1000] flex justify-around items-center">
          <NavLink to="/" className={getLinkStyle}><FaSearch className="text-xl" /></NavLink>



          <NavLink to="/inbox" className={getLinkStyle}>
            <div className="relative">
              <SiGooglemessages className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>
              )}
            </div>
          </NavLink>

          <NavLink to="/lend" className={getLinkStyle}><FaPlusCircle className="text-xl" /></NavLink>
          <NavLink to="/profile" className={getLinkStyle}><FaUserCircle className="text-xl" /></NavLink>
        </div>
      )}
    </>
  );
};

export default Navbar;