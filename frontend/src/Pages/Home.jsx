import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FaBoxOpen, FaMapMarkerAlt, FaSearch, FaFilter, FaRedo, FaList, FaMapMarkedAlt } from 'react-icons/fa';
import { Link } from 'react-router';
import 'leaflet/dist/leaflet.css';

// --- FIX FOR LEAFLET MARKERS ---
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const categories = ["All", "Tools", "Electronics", "Books", "Kitchen", "Sports", "Others"];

const Home = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [locationSearch, setLocationSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // New: Toggle between grid and map

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/items/all');
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items", err);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesLocation = !locationSearch ||
      (item.address && item.address.toLowerCase().includes(locationSearch.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(locationSearch.toLowerCase()));

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setLocationSearch("");
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4 max-w-7xl mx-auto">

      {/* 1. TOP SEARCH & VIEW TOGGLE */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow w-full">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <FaSearch className="text-slate-400" />
            <input
              type="text" value={searchTerm}
              placeholder="Search items..."
              className="w-full outline-none bg-transparent"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <FaMapMarkerAlt className="text-indigo-500" />
            <input
              type="text" value={locationSearch}
              placeholder="Enter Area (e.g. Dhanmondi)..."
              className="w-full outline-none bg-transparent"
              onChange={(e) => setLocationSearch(e.target.value)}
            />
          </div>
        </div>

        {/* VIEW MODE TOGGLE */}
        <div className="bg-slate-200 p-1 rounded-xl flex items-center gap-1 self-end md:self-center">
          <button 
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            <FaList /> Grid
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${viewMode === 'map' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            <FaMapMarkedAlt /> Map
          </button>
        </div>
      </div>

      {/* 2. CATEGORY PILLS */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2 text-slate-500 font-bold text-sm">
          <FaFilter /> Filters:
        </div>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"
              }`}
          >
            {cat}
          </button>
        ))}
        {(searchTerm || selectedCategory !== "All" || locationSearch) && (
          <button onClick={resetFilters} className="text-rose-500 text-sm font-bold flex items-center gap-1 ml-auto hover:bg-rose-50 px-3 py-2 rounded-lg transition">
            <FaRedo className="text-xs" /> Reset
          </button>
        )}
      </div>

      {/* 3. CONDITIONAL CONTENT: GRID OR MAP */}
      {viewMode === 'map' ? (
        <div className="bg-white p-2 rounded-3xl shadow-xl border border-slate-100 overflow-hidden h-[500px] relative z-0 animate-in zoom-in duration-300">
          <MapContainer center={[23.8103, 90.4125]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            {filteredItems.map((item) => (
              <Marker key={item._id} position={[item.coordinates[0], item.coordinates[1]]}>
                <Popup>
                  <div className="p-1 w-48">
                    {item.image && <img src={item.image} className="w-full h-24 object-cover rounded-xl mb-2" alt="" />}
                    <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                    <p className="text-xs text-indigo-600 font-bold mb-2">৳{item.price}/{item.priceType}</p>
                    <Link to={`/item/${item._id}`} className="block text-center bg-indigo-600 text-white text-xs py-2 rounded-lg font-bold">View Details</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'available'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white shadow-lg'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mb-1">{item.category}</div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 italic mb-4">"{item.description}"</p>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                      <FaMapMarkerAlt />
                      <span className="truncate w-24">{item.address}</span>
                    </div>
                    <Link to={`/item/${item._id}`} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <FaBoxOpen className="text-6xl text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium text-lg">Nothing found in this area/category.</p>
              <button onClick={resetFilters} className="text-indigo-600 font-bold mt-2">Show all items</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;