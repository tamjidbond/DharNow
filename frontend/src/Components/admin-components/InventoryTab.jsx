import React, { useState } from 'react'; // Added useState
import { FaTrashAlt, FaTag, FaSearch, FaBoxOpen } from 'react-icons/fa';

const InventoryTab = ({ items, handleDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Logic: Matches title, category, or owner email
  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lentBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-800/40 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 overflow-hidden animate-in slide-in-from-right-4 duration-500">
      
      {/* HEADER & SEARCH BAR */}
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <FaBoxOpen size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Global Inventory</h3>
            <p className="text-xs text-slate-500 font-medium">Monitoring {items.length} community assets</p>
          </div>
        </div>
        
        {/* Search Input Area */}
        <div className="relative w-full xl:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Search item, category, or neighbor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* RENDER CONTENT */}
      {filteredItems.length > 0 ? (
        <>
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto p-4 md:p-8 pt-0">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="py-4 px-4 font-black">Item Details</th>
                  <th className="py-4 font-black">Category</th>
                  <th className="py-4 font-black">Owner</th>
                  <th className="py-4 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map(item => (
                  <tr key={item._id} className="group hover:bg-white/5 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" alt="" />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{item.title}</p>
                          <p className="text-[9px] text-slate-500 font-mono uppercase">ID: {item._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-400 font-medium">{item.lentBy}</td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleDeleteItem(item._id)} 
                        className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all p-3 rounded-xl"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden p-4 space-y-4">
            {filteredItems.map(item => (
              <div key={item._id} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                  <img src={item.image} className="w-14 h-14 rounded-xl object-cover border border-white/10" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-sm truncate">{item.title}</h4>
                    <p className="text-indigo-400 text-[10px] font-black uppercase flex items-center gap-1 mt-1">
                      <FaTag size={8}/> {item.category}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-slate-500 uppercase font-black">Lent By</span>
                    <span className="text-[10px] text-slate-300 truncate font-bold">{item.lentBy}</span>
                  </div>
                  <div className="flex justify-end items-center">
                    <button 
                      onClick={() => handleDeleteItem(item._id)} 
                      className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2"
                    >
                      <FaTrashAlt size={10} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-900/50 p-6 rounded-full text-slate-700 mb-4 border border-white/5">
            <FaSearch size={40} />
          </div>
          <h4 className="text-white font-bold">No items found</h4>
          <p className="text-slate-500 text-xs mt-1">Try searching for a different keyword or owner email.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;