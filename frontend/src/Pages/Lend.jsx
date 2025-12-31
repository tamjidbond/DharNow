import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { FaPlus, FaCamera, FaMapMarkerAlt, FaCheckCircle, FaPhoneAlt, FaEnvelope, FaTag, FaClock } from 'react-icons/fa';
import L from 'leaflet';
import { useNavigate, useLocation } from 'react-router'; 
import Swal from 'sweetalert2';

// 1. Fix Leaflet Icons (Crucial for the map to show markers correctly)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useData } from '../contexts/DataContext';


 
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 2. Map Interaction Component
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

// 3. Main Lend Component
const Lend = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem('userEmail');

  // Catch data passed from RequestBoard (The "Wish" context)
  const predefinedName = location.state?.predefinedName || '';
  const wishId = location.state?.wishId || null;
  const targetUser = location.state?.targetUser || null;

  const [formData, setFormData] = useState({
    title: predefinedName, // Auto-fills if fulfilling a wish
    description: '',
    category: '',
    price: '',
    priceType: 'Day',
    phone: '',
    address: '',
  });

  const [categories, setCategories] = useState([]);
  const [itemImage, setItemImage] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- FETCH DYNAMIC CATEGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('https://dharnow.onrender.com/api/categories');
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          if(!formData.category) setFormData(prev => ({ ...prev, category: res.data[0].name }));
        } else {
          const defaults = [{ name: 'Tools' }, { name: 'Books' }, { name: 'Electronics' }, { name: 'Other' }];
          setCategories(defaults);
          if(!formData.category) setFormData(prev => ({ ...prev, category: 'Tools' }));
        }
      } catch (err) {
        console.error("Categories fetch failed, using fallbacks.");
        const fallbacks = [{ name: 'Tools' }, { name: 'Books' }, { name: 'Electronics' }, { name: 'Other' }];
        setCategories(fallbacks);
        if(!formData.category) setFormData(prev => ({ ...prev, category: 'Tools' }));
      }
    };
    fetchCategories();
  }, [formData.category]);

  // --- AUTO-FILL USER PROFILE ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userEmail) return;
      setFetchingUser(true);
      try {
        const res = await axios.get(`https://dharnow.onrender.com/api/users/profile-by-email/${userEmail}`);
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            phone: res.data.phone || '',
          }));
        }
      } catch (err) {
        console.error("Autofill error:", err);
      }
      setFetchingUser(false);
    };
    fetchUserProfile();
  }, [userEmail]);

  // --- IMAGE RESIZER (Protects Free DB Storage) ---
  const processImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Resize to reasonable width
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality compression
        };
      };
    });
  };

  const {refreshData} = useData();

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemImage || !coordinates || !formData.phone || !formData.address) {
      return Swal.fire({
        icon: 'info',
        title: 'Missing Information',
        text: 'Please fill all fields, upload an image, and pin your location on the map.',
        confirmButtonColor: '#4f46e5'
      });
    }

    setLoading(true);
    try {
      // Compress image before sending to free MongoDB
      const compressedBase64 = await processImage(itemImage);

      // 1. Add Item to Database
      const itemResponse = await axios.post('https://dharnow.onrender.com/api/items/add', {
        ...formData,
        image: compressedBase64,
        coordinates: coordinates,
        lentBy: userEmail,
        wishId: wishId // Link to wish if applicable
      });

      // 2. Automated Handshake Message to Neighbor
      if (targetUser) {
        // Extract ID from response (handle both MongoDB direct and custom responses)
        const newItemId = itemResponse.data.itemId || itemResponse.data._id;
        
        await axios.post('https://dharnow.onrender.com/api/messages/send', {
          senderEmail: userEmail,
          receiverEmail: targetUser,
          itemId: newItemId,
          itemTitle: formData.title,
          text: `Hi! I saw your wish for "${predefinedName}" and I've just listed it for you. You can view the details and request it here!`
        });
      }

      setSuccess(true);
      refreshData()
      setTimeout(() => navigate('/'), 2500);

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Posting Failed',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#ef4444'
      });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] shadow-2xl text-center border border-emerald-100">
        <FaCheckCircle className="text-6xl text-emerald-500 mb-6 mx-auto" />
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Item Listed!</h2>
        <p className="text-slate-500 mb-8 font-bold text-sm uppercase tracking-widest">Your neighbor has been notified.</p>
        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto  p-10 my-10 bg-white/70 backdrop-blur-2xl mt-6 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_80px_rgba(79,70,229,0.15)] border border-white/40">
      <div className="mb-10 border-b border-slate-50 pb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white"><FaPlus size={20} /></div> 
            {predefinedName ? "Fulfill a Wish" : "Lend an Item"}
          </h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">
            {predefinedName ? `Helping a neighbor with: ${predefinedName}` : "Share your item with the community."}
          </p>
        </div>
        {fetchingUser && (
          <span className="text-xs font-bold text-indigo-500 animate-pulse bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Fetching Profile...</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Item Title</label>
              <input
                type="text"
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 ring-indigo-50 mt-1 font-bold text-slate-700"
                placeholder="e.g. Electric Drill"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Category</label>
              <select
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 ring-indigo-50 mt-1 font-bold text-slate-700 appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Description</label>
            <textarea
              rows="5"
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 ring-indigo-50 mt-1 resize-none font-bold text-slate-700"
              placeholder="Condition, rules, or features."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            ></textarea>
          </div>
        </div>

        <div className="bg-slate-50/50 p-8 rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-2 flex items-center gap-2">
              <FaTag /> Price (0 for Free)
            </label>
            <input
              type="number"
              className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 mt-1 font-black text-slate-700"
              placeholder="e.g. 50"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 ml-2 flex items-center gap-2">
              <FaClock /> Price Per
            </label>
            <div className="flex gap-3 mt-1">
              {['Hour', 'Day'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, priceType: type })}
                  className={`flex-1 p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${formData.priceType === type ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-indigo-50/30 p-8 rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-2 flex items-center gap-2">
              <FaPhoneAlt /> Phone (Auto)
            </label>
            <input type="text" className="w-full p-5 bg-white/50 border border-indigo-100 rounded-[1.5rem] mt-1 text-slate-400 font-bold" value={formData.phone} disabled />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-2 flex items-center gap-2">
              <FaEnvelope /> Email (Auto)
            </label>
            <input type="text" className="w-full p-5 bg-white/50 border border-indigo-100 rounded-[1.5rem] mt-1 text-slate-400 font-bold" value={userEmail || ''} disabled />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-2 flex items-center gap-2">
              <FaMapMarkerAlt /> House Address / Precise Landmark
            </label>
            <input
              type="text"
              className="w-full p-5 bg-white border border-indigo-100 rounded-[1.5rem] outline-none focus:ring-4 ring-indigo-50 mt-1 transition font-bold"
              placeholder="e.g. Green View Apartment, House 4, Road 2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Item Photo</label>
            <div className="mt-2 border-4 border-dashed border-slate-100 p-12 rounded-[3rem] text-center bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all relative overflow-hidden group">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                accept="image/*"
                onChange={(e) => setItemImage(e.target.files[0])}
              />
              <FaCamera className="text-5xl text-indigo-200 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {itemImage ? itemImage.name : "Click to Upload Photo"}
              </p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Pin Pickup Point</label>
            <div className="h-56 mt-2 rounded-[3rem] overflow-hidden border-8 border-slate-50 z-0">
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
          className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl disabled:opacity-50"
        >
          {loading ? "Syncing with DharNow..." : "Post to DharNow"}
        </button>
      </form>
    </div>
  );
};

export default Lend;