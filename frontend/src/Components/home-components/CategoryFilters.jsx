import React from 'react';
import { FaRedo } from 'react-icons/fa';

const CategoryFilters = ({ categories, selectedCategory, setSelectedCategory, resetFilters, hasActiveFilters }) => (
  <div className="flex flex-wrap items-center gap-2">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => setSelectedCategory(cat)}
        className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${selectedCategory === cat ? "bg-slate-900 text-white shadow-xl scale-105" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"}`}
      >
        {cat}
      </button>
    ))}
    {hasActiveFilters && (
      <button onClick={resetFilters} className="text-rose-500 text-xs font-black uppercase tracking-widest flex items-center gap-1 ml-auto px-4 py-2 hover:bg-rose-50 rounded-xl transition">
        <FaRedo /> Reset
      </button>
    )}
  </div>
);

export default CategoryFilters;