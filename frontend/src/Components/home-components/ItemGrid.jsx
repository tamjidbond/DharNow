import React from 'react';
import { Link } from 'react-router';
import { FaLocationArrow, FaDirections, FaMapMarkerAlt, FaBoxOpen } from 'react-icons/fa';

const ItemGrid = ({ filteredItems, userCoords, calculateDistance, resetFilters }) => {
    if (filteredItems.length === 0) {
        return (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><FaBoxOpen className="text-4xl text-slate-300" /></div>
                <h3 className="text-xl font-bold text-slate-800">No items found</h3>
                <button onClick={resetFilters} className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase">Clear All Filters</button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
                const itemLat = item.location?.coordinates[1];
                const itemLng = item.location?.coordinates[0];
                const distance = userCoords && item.location?.coordinates ? calculateDistance(userCoords[0], userCoords[1], itemLat, itemLng) : null;

                return (
                    <div key={item._id} className="bg-white rounded-[1rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                        <div className="relative h-52 overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg ${item.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{item.status}</span>
                                {distance !== null && (
                                    <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                                        <FaLocationArrow className="text-indigo-500 text-[8px]" /> {distance} KM Away
                                    </span>
                                )}
                            </div>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`} target="_blank" rel="noreferrer" className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-indigo-600 shadow-md hover:bg-indigo-600 hover:text-white transition-colors"><FaDirections size={14} /></a>
                            <div className="absolute bottom-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-black shadow-lg">৳{item.price} / {item.priceType}</div>
                        </div>
                        <div className="p-6">
                            <div className="text-[10px] font-black text-indigo-500 uppercase mb-2">{item.category}</div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-6"><FaMapMarkerAlt className="text-indigo-400" /><span className="truncate">{item.address || "Dhaka"}</span></div>
                            <Link to={`/item/${item._id}`} className={`w-full block text-center py-3 rounded-2xl font-black text-xs uppercase transition-all ${item.status === 'available' ? 'bg-green-300 text-slate-800 hover:bg-indigo-600 hover:text-white' : 'bg-red-400 hover:bg-red-600 text-white'}`}>
                                {item.status === 'available' ? 'View Details' : 'Currently Booked'}
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ItemGrid;