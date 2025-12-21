import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FaBoxOpen, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router';

const Home = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SEARCH BAR SECTION */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <FaSearch className="text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Search for tools, books, or kitchenware..." 
          className="w-full outline-none bg-transparent text-slate-700"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MAP SECTION */}
      <div className="bg-white p-2 rounded-3xl shadow-lg border border-slate-100 overflow-hidden h-[400px] z-0">
        <MapContainer center={[23.8103, 90.4125]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredItems.map((item) => (
            <Marker key={item._id} position={[item.coordinates[1], item.coordinates[0]]}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-indigo-600">{item.title}</h3>
                  <p className="text-xs text-slate-600">{item.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ITEM LIST SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer">
              {item.image && <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-md font-black">FREE</span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 italic mb-4">"{item.description}"</p>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <FaMapMarkerAlt />
                    <span>Nearby</span>
                  </div>
                  <Link to={`/item/${item._id}`} className="text-indigo-600 font-bold text-xs hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <FaBoxOpen className="text-5xl text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">No items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;