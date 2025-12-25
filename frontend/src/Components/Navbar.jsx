import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaUserCircle, FaSignOutAlt, FaSearch, FaHandsHelping } from 'react-icons/fa';
import { useNavigate, NavLink, Link } from 'react-router';
import axios from 'axios';
import { SiGooglemessages } from "react-icons/si";
import { LuHandHelping } from "react-icons/lu";


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

  // FANCY NAV LINK STYLE
  const getLinkStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 ${isActive
      ? 'bg-main-blue text-white shadow-[0_0_20px_rgba(9,71,226,0.4)] scale-105'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* DESKTOP NAV */}
      <nav className="w-full bg-main-dark border-b border-white/5 sticky top-0 z-[1000] px-4 md:px-6 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-main-blue p-1.5 rounded-lg rotate-3 group-hover:rotate-0 transition-transform">
              <FaHandsHelping className="text-white text-xl" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white">
              Dhar<span className="text-main-blue">Now</span>
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={getLinkStyle}><FaSearch /><span>Browse</span></NavLink>

              {userEmail && (
                <>
                  <NavLink to="/inbox" className={getLinkStyle}>
                    <div className="relative">
                      <SiGooglemessages className="text-xl" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-main-dark animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span>Inbox</span>
                  </NavLink>
                  <NavLink to="/lend" className={getLinkStyle}><FaPlusCircle /><span>Lend</span></NavLink>
                  <NavLink to="/requestBoard" className={getLinkStyle}><LuHandHelping></LuHandHelping><span>Request Board</span></NavLink>
                  <NavLink to="/profile" className={getLinkStyle}><FaUserCircle /><span>Profile</span></NavLink>
                </>
              )}
            </div>

            {userEmail ? (
              <div className="flex items-center">
                <div className="hidden md:block h-6 w-px bg-white/10 mx-2"></div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-slate-400 hover:text-rose-400 font-black text-xs uppercase tracking-widest px-3 py-2 transition-all"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/register" className="bg-main-blue text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-main-blue/20">
                <FaUserCircle className="text-lg" />
                <span>Join Now</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION - GLASSMORPHISM STYLE */}
      {userEmail && (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-main-dark/80 backdrop-blur-xl border border-white/10 px-4 py-3 z-[1000] flex justify-around items-center rounded-[2rem] shadow-2xl">
          <NavLink to="/" className={getLinkStyle}><FaSearch className="text-xl" /></NavLink>

          <NavLink to="/inbox" className={getLinkStyle}>
            <div className="relative">
              <SiGooglemessages className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-main-dark">{unreadCount}</span>
              )}
            </div>
          </NavLink>

          <NavLink to="/lend" className={getLinkStyle}><FaPlusCircle className="text-xl" /></NavLink>
          <NavLink to="/requestBoard" className={getLinkStyle}><LuHandHelping className="text-xl" /></NavLink>
          <NavLink to="/profile" className={getLinkStyle}><FaUserCircle className="text-xl" /></NavLink>
        </div>
      )}
    </>
  );
};

export default Navbar;