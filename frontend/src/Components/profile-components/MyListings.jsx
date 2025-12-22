import React from 'react';
import { FaListUl, FaTrashAlt } from 'react-icons/fa';

const MyListings = ({ items, handleDeleteItem }) => (
  <div className="space-y-4">
    <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2 text-sm md:text-base"><FaListUl className="text-indigo-600" /> My Listings</h2>
    {items.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed text-sm">No items listed.</p> :
      items.map(item => (
        <div key={item._id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src={item.image} alt="" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl bg-slate-100 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">{item.title}</h3>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{item.status}</span>
            </div>
          </div>
          <button onClick={() => handleDeleteItem(item._id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex-shrink-0"><FaTrashAlt /></button>
        </div>
      ))
    }
  </div>
);

export default MyListings;