import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    FaUserShield, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft,
    FaPhoneAlt, FaEnvelope, FaInfoCircle, FaTag, FaWhatsapp
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- LEAFLET ICON FIX ---
// This ensures the map pin icon shows up correctly in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowerPhone, setBorrowerPhone] = useState("");
    const [borrowerName, setBorrowerName] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);

    // --- HELPERS ---
    const formatWhatsAppNumber = (phone) => {
        if (!phone) return "";
        let cleaned = phone.replace(/\D/g, ''); 
        return cleaned.startsWith('88') ? cleaned : `88${cleaned}`;
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/items/${id}`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching item:", err);
            }
            setLoading(false);
        };

        const fetchBorrowerProfile = async () => {
            const email = localStorage.getItem('userEmail');
            if (email) {
                try {
                    const res = await axios.get(`http://localhost:8000/api/users/profile-by-email/${email}`);
                    if (res.data) {
                        setBorrowerPhone(res.data.phone || "");
                        setBorrowerName(res.data.name || "A neighbor");
                    }
                } catch (err) {
                    console.error("Error fetching borrower profile:", err);
                }
            }
        };

        fetchItem();
        fetchBorrowerProfile();
    }, [id]);

    // --- LOGIC FUNCTIONS ---
    const handleRequest = async () => {
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
            alert("Please login/register to borrow items!");
            navigate('/register');
            return;
        }

        if (!borrowerPhone) {
            alert("Please add your phone number in your profile so the owner can contact you.");
            return;
        }

        if (userEmail === data?.item?.lentBy) {
            alert("This is your own item!");
            return;
        }

        setRequestLoading(true);
        try {
            await axios.post('http://localhost:8000/api/requests/create', {
                itemId: data.item._id,
                lenderEmail: data.item.lentBy,
                borrowerEmail: userEmail,
                borrowerPhone: borrowerPhone,
                message: `Hi! I'm ${borrowerName}. I'm interested in borrowing your ${data.item.title}. Please let me know when I can pick it up!`
            });
            alert(`Success! ${data.owner?.name || 'The owner'} has been notified.`);
        } catch (err) {
            alert("Error: " + (err.response?.data?.error || err.message));
        }
        setRequestLoading(false);
    };

    // --- RENDER LOGIC ---
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-bold">Loading DharLink details...</p>
        </div>
    );

    if (!data || !data.item) return (
        <div className="text-center py-20 bg-white m-10 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">Item not found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-bold underline">Back to Home</button>
        </div>
    );

    const { item, owner } = data;
    const mapCenter = item.location?.coordinates
        ? [item.location.coordinates[1], item.location.coordinates[0]]
        : [23.8103, 90.4125];

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 animate-fadeIn pb-20">
            {/* Navigation */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold group">
                <FaArrowLeft className="group-hover:-translate-x-1 transition" /> Back to Browse
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                        <div className="bg-slate-50 flex items-center justify-center p-4 min-h-[400px]">
                            <img src={item.image} alt={item.title} className="w-full max-h-[500px] object-contain rounded-2xl" />
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                        {item.category}
                                    </span>
                                    <h1 className="text-4xl font-black text-slate-800 mt-2">{item.title}</h1>
                                </div>

                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl border border-emerald-100">
                                    <FaTag />
                                    <span className="text-2xl font-black">৳{item.price}</span>
                                    <span className="text-sm font-bold uppercase tracking-tighter">/ {item.priceType}</span>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FaInfoCircle /> Description & Terms
                                </h3>
                                <p className="text-slate-700 text-lg leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* MAP */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-indigo-600" /> Pickup Location
                            </h3>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                {item.address}
                            </span>
                        </div>
                        <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-100 z-0">
                            <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={mapCenter}>
                                    <Popup>
                                        <div className="font-bold">{item.title}</div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl sticky top-24">
                        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <FaUserShield /> Owner Details
                        </h3>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg">
                                {owner?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-xl">{owner?.name || "Neighbor"}</h4>
                                <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                    <FaCalendarAlt /> Member since {owner?.createdAt ? new Date(owner.createdAt).getFullYear() : "2024"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <button
                                onClick={handleRequest}
                                disabled={requestLoading || item.status === 'booked'}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                                    item.status === 'booked'
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-slate-900'
                                }`}
                            >
                                {requestLoading ? "Sending..." : item.status === 'booked' ? "Already Booked" : "Confirm Borrowing"}
                            </button>

                            {/* WHATSAPP BUTTON (FREE CHAT) */}
                            {item.phone && (
                                <a
                                    href={`https://wa.me/${formatWhatsAppNumber(item.phone)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 rounded-2xl font-bold text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaWhatsapp size={20} /> Chat on WhatsApp
                                </a>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] text-center text-slate-500 font-bold leading-relaxed uppercase">
                                Pickup coordination happens via phone or WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ItemDetail;