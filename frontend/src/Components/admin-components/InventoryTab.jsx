// src/components/admin-components/InventoryTab.jsx
import { FaTrashAlt } from 'react-icons/fa';

const InventoryTab = ({ items, handleDeleteItem }) => (
  <div className="bg-slate-800/40 rounded-[2.5rem] border border-white/5 overflow-hidden animate-in slide-in-from-right-4 duration-500">
    <div className="p-8 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
            <th className="pb-4 px-4">Item Details</th>
            <th className="pb-4">Category</th>
            <th className="pb-4">Owner</th>
            <th className="pb-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map(item => (
            <tr key={item._id} className="group hover:bg-white/5 transition">
              <td className="py-4 px-4">
                <div className="flex items-center gap-4">
                  <img src={item.image} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                  <div>
                    <p className="font-bold text-white leading-none mb-1">{item.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{item._id}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 text-xs font-bold text-indigo-400 uppercase">{item.category}</td>
              <td className="py-4 text-xs text-slate-400">{item.lentBy}</td>
              <td className="py-4">
                <button onClick={() => handleDeleteItem(item._id)} className="text-slate-500 hover:text-rose-500 transition-colors p-2">
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default InventoryTab;