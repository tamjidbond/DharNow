import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    FaUserShield, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft,
    FaPhoneAlt, FaEnvelope, FaInfoCircle, FaHandshake,
    FaTag
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // --- 1. ALL HOOKS AT THE TOP ---
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowerPhone, setBorrowerPhone] = useState("");
    const [borrowerName, setBorrowerName] = useState(""); // New state for borrower name
    const [requestLoading, setRequestLoading] = useState(false);

    // Fetch Item and Owner Data
    useEffect(() => {
        const fetchItem = async () => {
            try {
                // Backend should return { item: {...}, owner: {name, phone, ...} }
                const res = await axios.get(`http://localhost:8000/api/items/${id}`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching item:", err);
            }
            setLoading(false);
        };
        fetchItem();
    }, [id]);

    // Fetch Borrower's Details (The person currently logged in)
    useEffect(() => {
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
        fetchBorrowerProfile();
    }, []);

    // --- 2. CONDITIONAL RENDERING (AFTER HOOKS) ---
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-bold">Loading item details...</p>
        </div>
    );

    if (!data || !data.item) return (
        <div className="text-center py-20 bg-white m-10 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">Item not found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-bold">Back to Home</button>
        </div>
    );

    const { item, owner } = data;

    // Convert coordinates: Backend [lng, lat] -> Leaflet [lat, lng]
    const mapCenter = item.location?.coordinates
        ? [item.location.coordinates[1], item.location.coordinates[0]]
        : [23.8103, 90.4125];

    // --- 3. LOGIC FUNCTIONS ---
    const handleRequest = async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert("Please login/register to borrow items!");
            navigate('/register');
            return;
        }

        if (userEmail === item.lentBy) {
            alert("This is your own item!");
            return;
        }

        setRequestLoading(true);
        try {
            await axios.post('http://localhost:8000/api/requests/create', {
                itemId: item._id,
                lenderEmail: item.lentBy,
                borrowerEmail: userEmail,
                borrowerPhone: borrowerPhone,
                // Personalized message
                message: `Hi! I'm ${borrowerName}. I'm interested in borrowing your ${item.title}. Please let me know when I can pick it up!`
            });
            alert(`Success! ${owner?.name || 'The owner'} will see your contact details and coordinate the pickup.`);
        } catch (err) {
            alert("Error sending request: " + (err.response?.data?.error || err.message));
        }
        setRequestLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 animate-fadeIn">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold group">
                <FaArrowLeft className="group-hover:-translate-x-1 transition" /> Back to Browse
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: IMAGE, DESCRIPTION & MAP */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                        {/* IMAGE SECTION */}
                        <div className="bg-slate-50 flex items-center justify-center p-4">
                            <img src={item.image} alt={item.title} className="w-full h-[450px] object-contain rounded-2xl" />
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                        {item.category}
                                    </span>
                                    <h1 className="text-4xl font-black text-slate-800 mt-2">{item.title}</h1>
                                </div>

                                {/* PRICE TAG */}
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

                    {/* MAP SECTION */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-indigo-600" /> Precise Pickup Location
                            </h3>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                {item.address}
                            </span>
                        </div>
                        <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-100">
                            <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={mapCenter}>
                                    <Popup>
                                        <div className="font-bold">{item.title}</div>
                                        <div className="text-xs text-slate-500">Pick up here</div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: OWNER DETAILS & ACTION */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl sticky top-24">
                        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <FaUserShield /> Owner Information
                        </h3>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg rotate-3">
                                {owner?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                {/* SUCCESS: This will now show the actual owner name if backend is correct */}
                                <h4 className="font-black text-slate-800 text-xl">{owner?.name || "Lender"}</h4>
                                <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                    <FaCalendarAlt /> Member since {owner?.createdAt ? new Date(owner.createdAt).getFullYear() : "2024"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5 border-t border-slate-50 pt-6 mb-8">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <FaPhoneAlt />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-slate-800 font-bold">{item.phone || owner?.phone || "Private"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <FaEnvelope />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-slate-800 font-bold truncate">{item.lentBy}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleRequest} 
                            disabled={requestLoading || item.status === 'booked'}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                                item.status === 'booked' 
                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none' 
                                : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100'
                            }`}
                        >
                            {requestLoading ? "Sending..." : item.status === 'booked' ? "Already Booked" : "Confirm Borrowing"}
                        </button>

                        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] text-center text-slate-500 font-bold leading-relaxed">
                                Your phone number ({borrowerPhone || "Not set"}) will be shared with the owner to coordinate the pickup.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ItemDetail;