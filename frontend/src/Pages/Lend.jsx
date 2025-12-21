import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { FaPlus, FaCamera, FaMapMarkerAlt, FaCheckCircle, FaPhoneAlt, FaEnvelope, FaTag, FaClock } from 'react-icons/fa';
import L from 'leaflet';
import { useNavigate } from 'react-router';

// Custom Marker Icon for the Map
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle Map Clicks and Location Pinning
const LocationMarker = ({ setCoordinates }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCoordinates([e.latlng.lng, e.latlng.lat]);
    },
  });

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      setCoordinates([e.latlng.lng, e.latlng.lat]);
      map.flyTo(e.latlng, 15);
    });
  }, [map, setCoordinates]);

  return position === null ? null : (
    <Marker position={position} icon={redIcon}>
      <Popup>Neighbors will see this location.</Popup>
    </Marker>
  );
};

const Lend = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tools',
    price: '',         
    priceType: 'Day',  
    phone: '',
    address: '', // Manual Input
  });
  
  const [itemImage, setItemImage] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- AUTO-FILL PHONE & EMAIL ONLY ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userEmail) return;
      
      setFetchingUser(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/users/profile-by-email/${userEmail}`);
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            phone: res.data.phone || '',
            // Address is NOT auto-filled here anymore
          }));
        }
      } catch (err) {
        console.error("Autofill error:", err);
      }
      setFetchingUser(false);
    };

    fetchUserProfile();
  }, [userEmail]);

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
    if (!itemImage || !coordinates || !formData.phone || !formData.address) {
      return alert("Please fill all fields, upload an image, and pin your location on the map.");
    }

    setLoading(true);
    try {
      const base64Image = await convertToBase64(itemImage);

      await axios.post('http://localhost:8000/api/items/add', {
        ...formData,
        image: base64Image,
        coordinates: coordinates,
        lentBy: userEmail, 
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 2500); 

    } catch (err) {
      alert("Error adding item: " + err.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl shadow-2xl text-center border border-emerald-100 animate-fadeIn">
        <FaCheckCircle className="text-6xl text-emerald-500 mb-6 mx-auto" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Item Listed!</h2>
        <p className="text-slate-500 mb-8 font-medium">Your neighbors on DharLink can now find your item.</p>
        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">Back Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 my-10 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 border-b border-slate-100 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FaPlus className="text-indigo-600" /> Lend an Item
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Share your item with the community.</p>
        </div>
        {fetchingUser && (
          <div className="text-xs font-bold text-indigo-500 animate-pulse bg-indigo-50 px-3 py-1 rounded-full">
            Autofilling phone...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ITEM DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Item Title</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500 mt-1 transition"
                placeholder="e.g. Electric Drill"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500 mt-1 transition"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Tools</option><option>Books</option><option>Kitchenware</option>
                <option>Electronics</option><option>Sports</option><option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
            <textarea 
              rows="5"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500 mt-1 resize-none transition"
              placeholder="Condition, rules, or features."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>
        </div>

        {/* PRICE SECTION */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1 flex items-center gap-2">
              <FaTag /> Price (0 for Free)
            </label>
            <input 
              type="number" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500 mt-1 transition"
              placeholder="e.g. 50"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1 flex items-center gap-2">
              <FaClock /> Price Per
            </label>
            <div className="flex gap-2 mt-1">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, priceType: 'Hour'})}
                  className={`flex-1 p-4 rounded-2xl font-bold transition ${formData.priceType === 'Hour' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500'}`}
                >
                  Hour
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, priceType: 'Day'})}
                  className={`flex-1 p-4 rounded-2xl font-bold transition ${formData.priceType === 'Day' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500'}`}
                >
                  Day
                </button>
            </div>
          </div>
        </div>

        {/* CONTACT & MANUAL ADDRESS */}
        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1 flex items-center gap-2">
              <FaPhoneAlt /> Your Phone (Auto)
            </label>
            <input 
              type="text" 
              className="w-full p-4 bg-indigo-100/50 border border-indigo-200 rounded-2xl text-slate-500 mt-1 cursor-not-allowed"
              value={formData.phone || ''}
              disabled
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1 flex items-center gap-2">
              <FaEnvelope /> Your Email (Auto)
            </label>
            <input 
              type="text" 
              className="w-full p-4 bg-indigo-100/50 border border-indigo-200 rounded-2xl text-slate-500 mt-1 cursor-not-allowed"
              value={userEmail || ''}
              disabled
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 ml-1 flex items-center gap-2">
              <FaMapMarkerAlt /> Precise Landmark / House Address (Manual)
            </label>
            <input 
              type="text" 
              className="w-full p-4 bg-white border border-indigo-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500 mt-1 transition"
              placeholder="Type your landmark or address here..."
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>
        </div>

        {/* PHOTO & PIN LOCATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Item Photo</label>
              <div className="mt-1 border-2 border-dashed border-slate-200 p-10 rounded-3xl text-center bg-slate-50 hover:bg-white transition relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setItemImage(e.target.files[0])} />
                <FaCamera className="text-4xl text-indigo-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">{itemImage ? itemImage.name : "Click to Upload Photo"}</p>
              </div>
           </div>

           <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pin Pickup Point</label>
              <div className="h-44 mt-1 rounded-3xl overflow-hidden border-4 border-slate-50 z-0">
                <MapContainer center={[23.8103, 90.4125]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker setCoordinates={setCoordinates} />
                </MapContainer>
              </div>
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post to DharLink"}
        </button>
      </form>
    </div>
  );
};

export default Lend;