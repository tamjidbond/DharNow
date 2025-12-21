import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Add Popup to this list
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { FaPlus, FaCamera, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import L from 'leaflet'; // Import Leaflet library for custom marker
import { useNavigate } from 'react-router';

// Custom Red Marker Icon for "Lend" page
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map Click Handler Component
const LocationMarker = ({ setCoordinates }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCoordinates([e.latlng.lng, e.latlng.lat]); // Store as [longitude, latitude] for MongoDB GeoJSON
    },
  });

  // Set initial position to current location
  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      setCoordinates([e.latlng.lng, e.latlng.lat]);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map, setCoordinates]);


  return position === null ? null : (
    <Marker position={position} icon={redIcon}>
      <Popup>This is where your item will appear.</Popup>
    </Marker>
  );
};


const Lend = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tools', // Default category
  });
  const [itemImage, setItemImage] = useState(null);
  const [coordinates, setCoordinates] = useState(null); // [longitude, latitude]
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Helper to convert image to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemImage || !coordinates || !formData.title || !formData.description) {
      return alert("Please fill all fields, upload an image, and select a location on the map.");
    }

    setLoading(true);
    try {
      const base64Image = await convertToBase64(itemImage);

      await axios.post('http://localhost:8000/api/items/add', {
        ...formData,
        image: base64Image,
        coordinates: coordinates, // Send [longitude, latitude]
        userId: 'some-firebase-uid', // TODO: Replace with actual Firebase UID
      });

      setSuccess(true);
      // Optional: Redirect after a delay
      setTimeout(() => navigate('/'), 3000); 

    } catch (err) {
      alert("Error adding item: " + err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-xl border border-emerald-100 text-center animate-fadeIn">
        <FaCheckCircle className="text-6xl text-emerald-500 mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Item Listed Successfully!</h2>
        <p className="text-slate-600 mb-8">Your item is now visible on the map.</p>
        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-fadeIn">
      <h2 className="text-3xl font-bold text-indigo-700 mb-8 flex items-center gap-3">
        <FaPlus className="text-indigo-500" /> Lend Your Item
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Details */}
        <div>
          <label className="block text-slate-700 font-bold mb-2">Item Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Electric Drill, Cooking Pot, Textbook"
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-2">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="4"
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            placeholder="Tell your neighbors about the item, its condition, and when it's available."
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-2">Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option>Tools</option>
            <option>Books</option>
            <option>Kitchenware</option>
            <option>Electronics</option>
            <option>Sports</option>
            <option>Other</option>
          </select>
        </div>

        {/* Item Image Upload */}
        <div>
          <label className="block text-slate-700 font-bold mb-2">Item Photo</label>
          <div className="border-2 border-dashed border-slate-300 p-8 rounded-2xl text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
            <label className="flex flex-col items-center justify-center space-y-3">
              <FaCamera className="text-4xl text-slate-400" />
              <p className="text-sm font-bold text-slate-600">Drag & Drop or Click to Upload Image</p>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setItemImage(e.target.files[0])} />
            </label>
            {itemImage && (
              <p className="mt-3 text-xs text-indigo-600 font-mono italic">Selected: {itemImage.name}</p>
            )}
          </div>
        </div>

        {/* Location on Map */}
        <div>
          <label className="block text-slate-700 font-bold mb-2 flex items-center gap-2">
            <FaMapMarkerAlt /> Set Item Location
          </label>
          <p className="text-sm text-slate-500 mb-3">Click on the map to pinpoint your item's exact location.</p>
          <div className="h-80 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0">
            <MapContainer center={[23.8103, 90.4125]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker setCoordinates={setCoordinates} />
            </MapContainer>
          </div>
          {coordinates && (
            <p className="mt-2 text-sm text-slate-600 font-mono">Location: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}</p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          {loading ? "Adding Item..." : "List Item for Free"}
        </button>
      </form>
    </div>
  );
};

export default Lend;