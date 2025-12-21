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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                // This route returns { item, owner }
                const res = await axios.get(`http://localhost:8000/api/items/${id}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchItem();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-indigo-600 font-bold">Loading item details...</div>;
    if (!data) return <div className="text-center py-20">Item not found.</div>;

    const { item, owner, price, priceType } = data;

    // Convert coordinates: Backend [lng, lat] -> Leaflet [lat, lng]
    const mapCenter = item.location?.coordinates
        ? [item.location.coordinates[1], item.location.coordinates[0]]
        : [23.8103, 90.4125];

    const handleRequest = async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert("Please login/register to borrow items!");
            navigate('/register');
            return;
        }

        // Prevent borrowing your own item
        if (userEmail === item.lentBy) {
            alert("This is your own item!");
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/requests/create', {
                itemId: item._id,
                lenderEmail: item.lentBy,
                borrowerEmail: userEmail,
                message: "I am coming to pick this up! Please keep it ready."
            });
            alert("Success! Check the owner's contact details below and coordinate the pickup.");
        } catch (err) {
            alert("Error sending request.");
        }
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

                                {/* PRICE TAG - Cleanly aligned to the right on desktop */}
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl border border-emerald-100">
                                    {/* <FaTag className="text-sm" /> */}
                                    <FaTag></FaTag>
                                    <span className="text-2xl font-black">৳{item.price}</span>
                                    <span className="text-sm font-bold uppercase tracking-tighter">/ {item.priceType}</span>
                                </div>
                            </div>

                            {/* DESCRIPTION SECTION */}
                            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FaInfoCircle /> Description & Terms
                                </h3>
                                <p className="text-slate-700 text-lg leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MAP SECTION */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-indigo-600" /> Precise Pickup Location
                            </h3>
                            {/* Added a small badge for the manual address you typed */}
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                {item.address}
                            </span>
                        </div>

                        <div className="h-72 w-full rounded-2xl overflow-hidden z-0 border border-slate-100">
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

                        {/* Owner Profile Card */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg rotate-3">
                                {owner?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-xl">{owner?.name || "DharLink User"}</h4>
                                <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                    <FaCalendarAlt /> Joined {owner?.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : "Recently"}
                                </p>
                            </div>
                        </div>

                        {/* Contact Details List */}
                        <div className="space-y-5 border-t border-slate-50 pt-6 mb-8">
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                                    <FaPhoneAlt />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-slate-800 font-bold">{item.phone || owner?.phone || "Not provided"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                                    <FaEnvelope />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-slate-800 font-bold truncate">{item.lentBy}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup Landmark</p>
                                    <p className="text-slate-800 font-bold">{item.address || owner?.address || "Pin location on map"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button onClick={handleRequest} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                            <FaHandshake /> Confirm Borrowing
                        </button>

                        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] text-center text-slate-500 font-bold leading-relaxed">
                                By clicking confirm, you agree to treat the item with care and return it to the owner on time.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ItemDetail;