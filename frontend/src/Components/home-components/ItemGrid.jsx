import React from 'react';
import { Link } from 'react-router';
import { FaLocationArrow, FaDirections, FaMapMarkerAlt, FaBoxOpen, FaSync } from 'react-icons/fa';

const SkeletonCard = () => (
    <div className="bg-white rounded-[1rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
        <div className="h-52 bg-slate-100 w-full"></div>
        <div className="p-6 space-y-4">
            <div className="h-3 bg-slate-200 rounded-full w-20"></div>
            <div className="h-5 bg-slate-300 rounded-full w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded-full w-1/2"></div>
            <div className="h-10 bg-slate-200 rounded-2xl w-full mt-4"></div>
        </div>
    </div>
);

const ItemGrid = ({ filteredItems, userCoords, calculateDistance, resetFilters, loading, handleManualRefresh, isRefreshing }) => {
    
    // 1. Loading State
    if (loading && !isRefreshing) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <SkeletonCard key={n} />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    Available Near You ({filteredItems.length})
                </h2>
                <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95"
                >
                    <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Items'}
                </button>
            </div>

            {/* 2. No Items Found State */}
            {filteredItems.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBoxOpen className="text-4xl text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No items found</h3>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 px-6">
                        <button onClick={resetFilters} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-colors">
                            Clear Filters
                        </button>
                        <button onClick={handleManualRefresh} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100">
                            Try Again
                        </button>
                    </div>
                </div>
            ) : (
                /* 3. The Actual Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredItems.map((item) => {
                        // FIX: Ensure we check location.coordinates correctly
                        const coords = item.location?.coordinates || item.coordinates;
                        const itemLat = coords ? coords[1] : null;
                        const itemLng = coords ? coords[0] : null;
                        
                        // FIX: Better distance check
                        const distance = (userCoords && itemLat && itemLng) 
                            ? calculateDistance(userCoords[0], userCoords[1], itemLat, itemLng) 
                            : null;

                        return (
                            <div key={item._id} className="bg-white rounded-[1rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                                <div className="relative h-52 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg ${item.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{item.status}</span>
                                        
                                        {/* Distance Tag */}
                                        {distance !== null && (
                                            <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                                                <FaLocationArrow className="text-indigo-500 text-[8px]" /> {distance} KM Away
                                            </span>
                                        )}
                                    </div>

                                    {/* Maps Link Fix: removed the '0' before {itemLat} */}
                                    {itemLat && itemLng && (
                                        <a 
                                            href={`https://www.google.com/maps?q=${itemLat},${itemLng}`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-indigo-600 shadow-md hover:bg-indigo-600 hover:text-white transition-colors"
                                        >
                                            <FaDirections size={14} />
                                        </a>
                                    )}

                                    <div className="absolute bottom-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-black shadow-lg">
                                        ৳{item.price} / {item.priceType}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase mb-2">{item.category}</div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-6">
                                        <FaMapMarkerAlt className="text-indigo-400" />
                                        <span className="truncate">{item.address || "Area details hidden"}</span>
                                    </div>
                                    <Link to={`/item/${item._id}`} className={`w-full block text-center py-3 rounded-2xl font-black text-xs uppercase transition-all ${item.status === 'available' ? 'bg-green-300 text-slate-800 hover:bg-indigo-600 hover:text-white' : 'bg-red-400 hover:bg-red-600 text-white'}`}>
                                        {item.status === 'available' ? 'View Details' : 'Currently Booked'}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ItemGrid;