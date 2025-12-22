// src/components/admin-components/CategoriesTab.jsx
import { FaPlus, FaTags, FaTrashAlt } from 'react-icons/fa';

const CategoriesTab = ({ categories, newCategoryName, setNewCategoryName, handleAddCategory, handleDeleteCategory }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
    <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md h-fit">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaPlus className="text-indigo-400" /> Protocol: New Category
        </h3>
        <form onSubmit={handleAddCategory} className="space-y-4">
            <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name..."
                className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-indigo-500 transition font-bold"
            />
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-xs">
                Inject Category
            </button>
        </form>
    </div>

    <div className="lg:col-span-2 bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaTags className="text-indigo-400" /> Active Categories ({categories.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
                <div key={cat._id} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/50 transition">
                    <span className="font-black uppercase tracking-widest text-xs text-slate-300">{cat.name}</span>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="text-slate-500 hover:text-rose-500 transition-colors p-2">
                        <FaTrashAlt />
                    </button>
                </div>
            ))}
        </div>
    </div>
  </div>
);

export default CategoriesTab;