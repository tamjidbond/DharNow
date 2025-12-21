import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaPlusCircle, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import {useNavigate, Link} from 'react-router'

const Navbar = () => {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUserEmail(localStorage.getItem('userEmail'));
    const sync = () => setUserEmail(localStorage.getItem('userEmail'));
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const logout = () => {
    localStorage.removeItem('userEmail');
    setUserEmail(null);
    navigate('/register');
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-[1000] shadow-sm">
      <Link festivals to="/" className="flex items-center gap-2">
        <FaMapMarkedAlt className="text-indigo-600 text-2xl" />
        <span className="text-2xl font-black">Dhar<span className="text-indigo-600">Now</span></span>
      </Link>
      <div className="flex items-center gap-6 font-bold text-slate-600">
        <Link to="/" className="hover:text-indigo-600">Browse</Link>
        {userEmail ? (
          <>
            <Link to="/lend" className="flex items-center gap-2 hover:text-indigo-600"><FaPlusCircle /> Lend</Link>
            <Link to="/profile" className="hover:text-indigo-600">Profile</Link>
            {userEmail === 'youradmin@gmail.com' && <Link to="/admin" className="text-orange-500">Admin</Link>}
            <button onClick={logout} className="text-slate-400 hover:text-red-500 text-xl"><FaSignOutAlt /></button>
          </>
        ) : (
          <Link to="/register" className="bg-slate-800 text-white px-5 py-2 rounded-full flex items-center gap-2"><FaUserCircle /> Sign In</Link>
        )}
      </div>
    </nav>
  );
};
export default Navbar;