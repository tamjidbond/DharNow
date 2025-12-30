import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    FaUserShield, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft,
    FaPhoneAlt, FaEnvelope, FaInfoCircle, FaTag, FaWhatsapp, FaShieldAlt,
    FaLocationArrow, FaDirections
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Swal from 'sweetalert2';

// --- LEAFLET ICON FIX ---
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

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowerPhone, setBorrowerPhone] = useState("");
    const [borrowerName, setBorrowerName] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);
    const [userCoords, setUserCoords] = useState(null); // NEW: To calculate distance

    const formatWhatsAppNumber = (phone) => {
        if (!phone) return "";
        let cleaned = phone.replace(/\D/g, '');
        return cleaned.startsWith('88') ? cleaned : `88${cleaned}`;
    };

    // Helper: Distance calculation
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.log("Location denied")
            );
        }

        const fetchItem = async () => {
            try {
                const res = await axios.get(`https://dharnow.onrender.com/api/items/${id}`);
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
                    const res = await axios.get(`https://dharnow.onrender.com/api/users/profile-by-email/${email}`);
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

    const handleRequest = async () => {
        const userEmail = localStorage.getItem('userEmail');

        // 1. Auth Check
        if (!userEmail) {
            Swal.fire({
                title: 'Sign In Required',
                text: 'Join the DharNow community to borrow items!',
                icon: 'warning',
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'Sign In Now',
            }).then((result) => {
                if (result.isConfirmed) navigate('/register');
            });
            return;
        }

        // 2. Profile Check
        if (!borrowerPhone) {
            Swal.fire({
                title: 'Missing Contact Info',
                text: 'Please add your phone number in your profile so the owner can reach you.',
                icon: 'info',
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'Update Profile',
            }).then((result) => {
                if (result.isConfirmed) navigate('/profile');
            });
            return;
        }

        // 3. Prevent Self-Borrowing
        if (userEmail === data?.item?.lentBy) {
            Swal.fire({
                title: 'Your Own Item',
                text: 'You cannot borrow from yourself!',
                icon: 'error',
                confirmButtonColor: '#ef4444',
            });
            return;
        }

        // --- 4. DURATION PICKER MODAL ---
        const { value: formValues } = await Swal.fire({
            title: 'Set Duration',
            html: `
            <div style="text-align: left; padding: 10px;">
                <label style="font-weight: 800; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">How long do you need it?</label>
                <div style="display: flex; gap: 12px; margin-top: 12px;">
                    <input id="swal-duration-value" type="number" min="1" value="1" 
                        style="flex: 1; height: 50px; border-radius: 12px; border: 2px solid #e2e8f0; padding: 0 15px; font-weight: bold; font-size: 16px;">
                    <select id="swal-duration-unit" 
                        style="flex: 1; height: 50px; border-radius: 12px; border: 2px solid #e2e8f0; padding: 0 10px; font-weight: bold; background: white;">
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                    </select>
                </div>
                <p style="margin-top: 15px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                    Note: Your Karma score depends on returning the item within this timeframe.
                </p>
            </div>
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Send Request',
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            background: '#ffffff',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl px-8 py-3 font-bold',
                cancelButton: 'rounded-xl px-8 py-3 font-bold'
            },
            preConfirm: () => {
                const val = document.getElementById('swal-duration-value').value;
                if (!val || val < 1) {
                    Swal.showValidationMessage('Please enter a valid time');
                    return false;
                }
                return {
                    value: val,
                    unit: document.getElementById('swal-duration-unit').value
                }
            }
        });

        if (!formValues) return;

        const durationString = `${formValues.value} ${formValues.unit}`;

        // --- 5. SEND DATA ---
        setRequestLoading(true);
        try {
            await axios.post('https://dharnow.onrender.com/api/requests/create', {
                itemId: data.item._id,
                itemTitle: data.item.title,
                lenderEmail: data.item.lentBy,
                borrowerEmail: userEmail,
                borrowerPhone: borrowerPhone,
                duration: durationString,
                message: `Hi! I'm ${borrowerName || 'a neighbor'}. I'd like to borrow your ${data.item.title} for ${durationString}. I'll make sure to return it on time!`
            });

            Swal.fire({
                icon: 'success',
                title: 'Request Sent!',
                text: `The owner will be notified. Return target: ${durationString}.`,
                confirmButtonColor: '#10b981',
                customClass: { popup: 'rounded-[2rem]' }
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: err.response?.data?.error || "We couldn't send the request. Try again.",
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-bold">Opening DharNow item...</p>
        </div>
    );

    if (!data || !data.item) return (
        <div className="text-center py-20 bg-white m-10 rounded-3xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800">Item not found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-bold">Back to Browse</button>
        </div>
    );

    const { item, owner } = data;

    const itemLat = item.location?.coordinates ? item.location.coordinates[1] : 23.8103;
    const itemLng = item.location?.coordinates ? item.location.coordinates[0] : 90.4125;
    const mapCenter = [itemLat, itemLng];

    const distance = userCoords ? calculateDistance(userCoords[0], userCoords[1], itemLat, itemLng) : null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 animate-fadeIn pb-20">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold group">
                <FaArrowLeft className="group-hover:-translate-x-1 transition" /> Back to Browse
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: IMAGE & DESCRIPTION */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-50">
                        <div className="relative bg-slate-50 flex items-center justify-center p-6 min-h-[400px]">
                            <img src={item.image} alt={item.title} className="w-full max-h-[500px] object-contain rounded-3xl shadow-sm" />

                            {/* NEW: Distance Badge on Image */}
                            {/* Distance Badge on Image - Shows even if 0 */}
                            {distance !== null && (
                                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white">
                                    <FaLocationArrow className="text-indigo-600 text-sm" />
                                    <span className="text-sm font-black text-slate-800">
                                        {distance === "0.0" ? "0" : distance} KM away
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full">
                                        {item.category}
                                    </span>
                                    <h1 className="text-4xl font-black text-slate-800 mt-3">{item.title}</h1>
                                </div>

                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-3xl border border-emerald-100 shadow-sm">
                                    <FaTag className="text-emerald-400" />
                                    <span className="text-3xl font-black">৳{item.price}</span>
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">/ {item.priceType}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaInfoCircle /> Description & Rules
                                </h3>
                                <div className="bg-slate-50 p-6 rounded-3xl text-slate-700 text-lg leading-relaxed border border-slate-100">
                                    {item.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOCATION MAP */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm tracking-widest">
                                <FaMapMarkerAlt className="text-indigo-600" /> Pickup Area
                            </h3>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-xs font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
                            >
                                <FaDirections /> Get Directions
                            </a>
                        </div>
                        <div className="h-80 w-full rounded-3xl overflow-hidden border border-slate-100 z-0">
                            <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={mapCenter}>
                                    <Popup><span className="font-bold">{item.title}</span></Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT: OWNER & ACTIONS */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-2xl sticky top-24">
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <FaUserShield /> Trusted Owner
                        </h3>

                        <div className="flex items-center gap-5 mb-10">
                            <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl uppercase shadow-xl rotate-3">
                                {owner?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-2xl">{owner?.name || "Neighbor"}</h4>
                                <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                                    <FaCalendarAlt /> Joined {owner?.createdAt ? new Date(owner.createdAt).getFullYear() : "2024"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <button
                                onClick={handleRequest}
                                disabled={requestLoading || item.status === 'booked'}
                                className={`w-full py-5 rounded-3xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${item.status === 'booked'
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100'
                                    }`}
                            >
                                {requestLoading ? "Sending Request..." : item.status === 'booked' ? "Already Booked" : "Send Borrow Request"}
                            </button>

                            {item.phone && (
                                <a
                                    href={`https://wa.me/${formatWhatsAppNumber(item.phone)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 rounded-3xl font-black text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                >
                                    <FaWhatsapp size={18} /> Chat on WhatsApp
                                </a>
                            )}
                        </div>

                        {/* SAFETY SECTION */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaShieldAlt className="text-indigo-400" /> Safety Tips
                            </h5>
                            <ul className="text-[11px] text-slate-500 font-bold space-y-2 leading-relaxed">
                                <li>• Meet in a bright, public place for pickup.</li>
                                <li>• Check the item condition before leaving.</li>
                                <li>• Be respectful to earn high Karma points!</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;