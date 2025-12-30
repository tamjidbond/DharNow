import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaInfoCircle, FaTag, FaLocationArrow } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';

// Sub-Components
import ItemMap from '../Components/item-detail/ItemMap';
import OwnerCard from '../Components/item-detail/OwnerCard';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowerPhone, setBorrowerPhone] = useState("");
    const [borrowerName, setBorrowerName] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);
    const [userCoords, setUserCoords] = useState(null);

    const formatWhatsAppNumber = (phone) => {
        if (!phone) return "";
        let cleaned = phone.replace(/\D/g, '');
        return cleaned.startsWith('88') ? cleaned : `88${cleaned}`;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]),
                () => console.log("Location denied")
            );
        }

        const fetchItem = async () => {
            try {
                const res = await axios.get(`https://dharnow.onrender.com/api/items/${id}`);
                console.log(res.data)
                setData(res.data);
            } catch (err) { console.error(err); }
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
                } catch (err) { console.error(err); }
            }
        };

        fetchItem();
        fetchBorrowerProfile();
    }, [id]);

    const handleRequest = async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            Swal.fire({ title: 'Sign In Required', text: 'Join DharNow to borrow!', icon: 'warning', confirmButtonText: 'Sign In' })
                .then((r) => r.isConfirmed && navigate('/register'));
            return;
        }
        if (!borrowerPhone) {
            Swal.fire({ title: 'Missing Phone', text: 'Add phone in profile first!', icon: 'info' })
                .then((r) => r.isConfirmed && navigate('/profile'));
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Set Duration',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <label style="font-weight: 800; font-size: 12px; color: #64748b; text-transform: uppercase;">Duration</label>
                    <div style="display: flex; gap: 12px; margin-top: 12px;">
                        <input id="swal-duration-value" type="number" min="1" value="1" style="flex:1; height:50px; border-radius:12px; border:2px solid #e2e8f0; padding:0 15px;">
                        <select id="swal-duration-unit" style="flex:1; height:50px; border-radius:12px; border:2px solid #e2e8f0; background:white;">
                            <option value="Hours">Hours</option>
                            <option value="Days">Days</option>
                        </select>
                    </div>
                </div>
            `,
            preConfirm: () => ({
                value: document.getElementById('swal-duration-value').value,
                unit: document.getElementById('swal-duration-unit').value
            })
        });

        if (!formValues) return;
        const durationString = `${formValues.value} ${formValues.unit}`;

        setRequestLoading(true);
        try {
            await axios.post('https://dharnow.onrender.com/api/requests/create', {
                itemId: data.item._id,
                itemTitle: data.item.title,
                lenderEmail: data.item.lentBy,
                borrowerEmail: userEmail,
                borrowerPhone,
                duration: durationString,
                message: `Hi! I'm ${borrowerName}. I'd like to borrow your ${data.item.title} for ${durationString}.`
            });
            Swal.fire('Request Sent!', `Duration: ${durationString}`, 'success');
        } catch (err) { Swal.fire('Error', 'Failed to send', 'error'); }
        setRequestLoading(false);
    };

    if (loading) return <div className="py-20 text-center font-bold text-indigo-600">Syncing DharNow...</div>;
    if (!data?.item) return <div className="py-20 text-center">Item not found.</div>;

    const { item, owner } = data;
    const itemLat = item.location?.coordinates[1] || 23.8103;
    const itemLng = item.location?.coordinates[0] || 90.4125;
    const distance = userCoords ? calculateDistance(userCoords[0], userCoords[1], itemLat, itemLng) : null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 pb-20">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition">
                <FaArrowLeft /> Back to Browse
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-50">
                        <div className="relative bg-slate-50 flex items-center justify-center p-6 min-h-[400px]">
                            <img src={item.image} alt="" className="w-full max-h-[500px] object-contain rounded-3xl" />
                            {distance !== null && (
                                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white">
                                    <FaLocationArrow className="text-indigo-600 text-sm" />
                                    <span className="text-sm font-black text-slate-800">{distance} KM away</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 px-4 py-1.5 rounded-full">{item.category}</span>
                                    <h1 className="text-4xl font-black text-slate-800 mt-3">{item.title}</h1>
                                </div>
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-3xl border border-emerald-100 shadow-sm">
                                    <FaTag className="text-emerald-400" />
                                    <span className="text-3xl font-black">৳{item.price}</span>
                                    <span className="text-xs font-bold uppercase opacity-70">/ {item.priceType}</span>
                                </div>
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><FaInfoCircle /> Description</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl text-slate-700 text-lg border border-slate-100">{item.description}</div>
                        </div>
                    </div>

                    <ItemMap itemLat={itemLat} itemLng={itemLng} itemTitle={item.title} />
                </div>



                <div className="lg:h-fit lg:sticky lg:top-24">
                    <OwnerCard
                        owner={owner}
                        item={item}
                        handleRequest={handleRequest}
                        requestLoading={requestLoading}
                        formatWhatsAppNumber={formatWhatsAppNumber}
                    />
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;