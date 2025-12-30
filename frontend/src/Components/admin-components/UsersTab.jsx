import React, { useState } from 'react'; // Added useState
import { FaUserShield, FaEnvelope, FaMapMarkerAlt, FaStar, FaTrash, FaSearch } from 'react-icons/fa';

const UsersTab = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Logic: Matches name or email
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-800/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-md animate-fadeIn">
      
      {/* HEADER & SEARCH BAR */}
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-3">
            <FaUserShield className="text-indigo-500" /> Community Members
          </h3>
          <p className="text-xs text-slate-500 mt-1">Manage network neighbors and trust protocols</p>
        </div>

        {/* Search Input Area */}
        <div className="relative w-full xl:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-8 py-4">Neighbor</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Karma / Deals</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-700 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-slate-400">{user.name?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate"><FaEnvelope size={10}/> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <FaMapMarkerAlt className="text-indigo-500 shrink-0" size={12} />
                      <span className="truncate max-w-[150px]">{user.address || "No Address"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1">
                        <FaStar size={10} /> {user.karma || 0}
                      </div>
                      <span className="text-slate-500 text-xs font-bold">{user.totalDeals || 0} Deals</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {user.isAdmin ? (
                      <span className="bg-indigo-600 text-[9px] font-black px-3 py-1 rounded-full text-white uppercase tracking-tighter shadow-lg shadow-indigo-500/20">Admin</span>
                    ) : (
                      <span className="bg-slate-700 text-[9px] font-black px-3 py-1 rounded-full text-slate-400 uppercase tracking-tighter">Neighbor</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-right">
                     {!user.isAdmin && (
                       <button className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          <FaTrash size={14} />
                       </button>
                     )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                  No neighbors found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden p-4 space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id} className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-700 flex items-center justify-center border border-white/10 shrink-0">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400">{user.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-white text-base truncate">{user.name}</h4>
                    {user.isAdmin && <span className="text-[8px] bg-indigo-600 px-2 py-0.5 rounded-md font-black uppercase">Admin</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Trust Metrics</p>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-black text-xs flex items-center gap-1"><FaStar size={10}/> {user.karma || 0}</span>
                    <span className="text-slate-400 font-bold text-[10px]">{user.totalDeals || 0} Deals</span>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  {!user.isAdmin && (
                    <button className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-active active:scale-95">
                      <FaTrash size={10} /> Purge
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg">
                  <FaMapMarkerAlt className="text-indigo-500 shrink-0" size={10} />
                  <span className="text-[10px] text-slate-400 truncate">{user.address || "Address not provided"}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
            No matches found
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTab;