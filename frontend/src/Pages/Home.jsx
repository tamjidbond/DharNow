import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  FaBoxOpen, FaMapMarkerAlt, FaSearch, FaFilter,
  FaRedo, FaList, FaMapMarkedAlt, FaTag, FaLocationArrow, FaDirections
} from 'react-icons/fa';
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
  const [viewMode, setViewMode] = useState("grid");
  const [userCoords, setUserCoords] = useState(null);
  const [isSortingNearest, setIsSortingNearest] = useState(false); // NEW: Distance sorting state

  // Get user location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("Location access denied")
      );
    }
  }, []);

  // Fetch all items
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

  // Distance helper
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // Improved Filtering and Sorting Logic
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesLocation = !locationSearch ||
        (item.address && item.address.toLowerCase().includes(locationSearch.toLowerCase()));
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      if (!isSortingNearest || !userCoords) return 0;
      const distA = a.location?.coordinates ? calculateDistance(userCoords[0], userCoords[1], a.location.coordinates[1], a.location.coordinates[0]) : 9999;
      const distB = b.location?.coordinates ? calculateDistance(userCoords[0], userCoords[1], b.location.coordinates[1], b.location.coordinates[0]) : 9999;
      return distA - distB;
    });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setLocationSearch("");
    setIsSortingNearest(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4 max-w-7xl mx-auto pb-20">

      {/* 1. TOP SEARCH & VIEW TOGGLE */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-grow w-full">
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
          {/* Sort Nearest Button */}
          <button
            onClick={() => setIsSortingNearest(!isSortingNearest)}
            disabled={!userCoords}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${isSortingNearest ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              } ${!userCoords && 'opacity-50 cursor-not-allowed'}`}
          >
            <FaLocationArrow className={isSortingNearest ? 'animate-pulse' : ''} />
            {isSortingNearest ? 'Sorting by Nearest' : 'Sort by Distance'}
          </button>
        </div>

        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}
          >
            <FaList /> Grid
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition ${viewMode === 'map' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}
          >
            <FaMapMarkedAlt /> Map
          </button>
        </div>
      </div>

      {/* 2. CATEGORY FILTERS */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${selectedCategory === cat
              ? "bg-slate-900 text-white shadow-xl scale-105"
              : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-400"
              }`}
          >
            {cat}
          </button>
        ))}
        {(searchTerm || selectedCategory !== "All" || locationSearch || isSortingNearest) && (
          <button onClick={resetFilters} className="text-rose-500 text-xs font-black uppercase tracking-widest flex items-center gap-1 ml-auto px-4 py-2 hover:bg-rose-50 rounded-xl transition">
            <FaRedo /> Reset
          </button>
        )}
      </div>

      {/* 3. GRID OR MAP VIEW */}
      {viewMode === 'map' ? (
        <div className="bg-white p-2 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden h-[600px] z-0">
          <MapContainer center={userCoords || [23.8103, 90.4125]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '2rem' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredItems.map((item) => {
              const pos = item.location?.coordinates
                ? [item.location.coordinates[1], item.location.coordinates[0]]
                : item.coordinates;

              return pos ? (
                <Marker key={item._id} position={pos}>
                  <Popup className="custom-popup">
                    <div className="p-1 w-48">
                      <img src={item.image} className="w-full h-24 object-cover rounded-xl mb-2" alt="" />
                      <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.title}</h3>
                      <p className="text-indigo-600 font-black text-xs mb-3">৳{item.price}/{item.priceType}</p>
                      <div className="flex flex-col gap-2">
                        <Link to={`/item/${item._id}`} className="block text-center bg-indigo-600 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-slate-900 transition">View Details</Link>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-center bg-slate-100 text-slate-700 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-slate-200 transition"
                        >
                          <FaDirections className="inline mr-1" /> Get Directions
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null;
            })}
          </MapContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const itemLat = item.location?.coordinates[1];
              const itemLng = item.location?.coordinates[0];
              const distance = userCoords && item.location?.coordinates
                ? calculateDistance(userCoords[0], userCoords[1], itemLat, itemLng)
                : null;

              return (
                <div key={item._id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-52 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${item.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {item.status}
                      </span>
                      {distance !== null && (
                        <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                          <FaLocationArrow className="text-indigo-500 text-[8px]" />
                          {distance === "0.0" ? "0" : distance} KM Away
                        </span>
                      )}
                    </div>
                    {/* Directions Floating Button */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-indigo-600 shadow-md hover:bg-indigo-600 hover:text-white transition-colors"
                      title="Get Directions"
                    >
                      <FaDirections size={14} />
                    </a>
                    <div className="absolute bottom-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-black shadow-lg">
                      ৳{item.price} / {item.priceType}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.category}</div>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h3>

                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-6">
                      <FaMapMarkerAlt className="text-indigo-400" />
                      <span className="truncate">{item.address || "Dhaka"}</span>
                    </div>

                    <Link
                      to={`/item/${item._id}`}
                      className={`w-full block text-center py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${item.status === 'available'
                          ? 'bg-slate-50 text-slate-800 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      {item.status === 'available' ? 'Check Availability' : 'Currently Booked'}
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBoxOpen className="text-4xl text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No items found</h3>
              <p className="text-slate-400 text-sm mb-6">Try changing your filters or searching another area.</p>
              <button onClick={resetFilters} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Clear All Filters</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;