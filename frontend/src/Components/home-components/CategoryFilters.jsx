import React, { useState } from 'react';
import { FaRedo, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

const CategorySkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-10 bg-slate-200 rounded-[1.2rem]"></div>
    ))}
  </div>
);

const CategoryFilters = ({ categories, selectedCategory, setSelectedCategory, resetFilters, hasActiveFilters, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) return <CategorySkeleton />;

  // 1. PROPER SORTING: Alphabetical order makes finding items easier
  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));

  const filteredCategories = sortedCategories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSearching = searchTerm.length > 0;
  // On mobile, we show 4 (even number) for symmetry in 2-column grid
  const sliceCount = 6; 
  const visibleCategories = isExpanded || isSearching ? filteredCategories : filteredCategories.slice(0, sliceCount);

  return (
    <div className="space-y-4 w-full">
      
      {/* TOP BAR: Search & Reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative group w-full sm:w-64">
          <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-indigo-500' : 'text-slate-300'}`} size={12} />
          <input 
            type="text"
            placeholder="Search protocols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-[1.2rem] text-[11px] font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500">
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {(hasActiveFilters || isSearching) && (
          <button 
            onClick={() => { resetFilters(); setSearchTerm(""); }} 
            className="w-full sm:w-auto text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 px-4 py-2 hover:bg-rose-50 rounded-xl transition-all"
          >
            <FaRedo size={10} /> Reset System
          </button>
        )}
      </div>

      {/* CATEGORY GRID: 2 Columns on Mobile, Flex on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3">
        {visibleCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-3 rounded-[1.2rem] text-[10px] sm:text-[11px] font-black uppercase tracking-tight transition-all duration-300 border ${
              selectedCategory === cat 
              ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 scale-[1.02]" 
              : "bg-white text-slate-500 border-slate-100 hover:border-indigo-400 hover:text-indigo-600 shadow-sm"
            }`}
          >
            {cat}
          </button>
        ))}

        {/* VIEW ALL TOGGLE: Now fits into the grid flow */}
        {!isSearching && filteredCategories.length > sliceCount && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="col-span-2 sm:col-span-1 lg:w-auto px-6 py-3 rounded-[1.2rem] bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            {isExpanded ? 'Minimize' : `+${filteredCategories.length - sliceCount} More`}
            <FaChevronDown className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* NO RESULTS FOUND */}
      {isSearching && filteredCategories.length === 0 && (
        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No matching categories found</p>
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;