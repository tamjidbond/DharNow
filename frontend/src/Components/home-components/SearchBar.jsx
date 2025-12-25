import React from 'react';
import { FaSearch, FaMapMarkerAlt, FaLocationArrow, FaList, FaMapMarkedAlt } from 'react-icons/fa';

const SearchBar = ({ searchTerm, setSearchTerm, locationSearch, setLocationSearch, isSortingNearest, setIsSortingNearest, userCoords, viewMode, setViewMode }) => (
  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-3xl shadow-sm border border-slate-100">
    <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-grow w-full">
      <div className="bg-slate-50 px-4 py-3 rounded-2xl flex items-center gap-3 border border-transparent focus-within:border-indigo-300 transition">
        <FaSearch className="text-slate-400" />
        <input
          type="text" value={searchTerm}
          placeholder="What do you need?"
          className="w-full outline-none bg-transparent font-medium"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="bg-slate-50 px-4 py-3 rounded-2xl flex items-center gap-3 border border-transparent focus-within:border-indigo-300 transition">
        <FaMapMarkerAlt className="text-indigo-500" />
        <input
          type="text" value={locationSearch}
          placeholder="Location (e.g. Banani)..."
          className="w-full outline-none bg-transparent font-medium"
          onChange={(e) => setLocationSearch(e.target.value)}
        />
      </div>
      <button
        onClick={() => setIsSortingNearest(!isSortingNearest)}
        disabled={!userCoords}
        className={`px-4 py-3 rounded-2xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${isSortingNearest ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} ${!userCoords && 'opacity-50 cursor-not-allowed'}`}
      >
        <FaLocationArrow className={isSortingNearest ? 'animate-pulse' : ''} />
        {isSortingNearest ? 'Sorted by Nearest' : 'Sort by Distance'}
      </button>
    </div>

    <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
      <button onClick={() => setViewMode('grid')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}><FaList /> Grid</button>
      <button onClick={() => setViewMode('map')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition ${viewMode === 'map' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}><FaMapMarkedAlt /> Map</button>
    </div>
  </div>
);

export default SearchBar;