import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserShield, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router';
import { auth } from '../firebase';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
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

    const { item, owner } = data;

    // Inside ItemDetail.jsx, add this function:
    const handleRequest = async () => {
        // 1. Check if auth exists
        const user = auth.currentUser;

        // 2. If not logged in, send them to register
        if (!user) {
            alert("Please login/register to borrow items!");
            navigate('/register');
            return;
        }

        try {
            // 3. Send the request to your backend
            await axios.post('http://localhost:8000/api/requests/create', {
                itemId: data.item._id,
                lenderUid: data.item.lentBy,
                borrowerUid: user.uid,
                message: "Hey! I'd like to borrow this item. Is it available?"
            });

            alert("Request sent! The owner will see it in their profile.");
        } catch (err) {
            console.error(err);
            alert("Error sending request. Check your internet or backend.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition font-bold">
                <FaArrowLeft /> Back to Map
            </button>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">

                {/* LEFT: ITEM IMAGE */}
                <div className="md:w-1/2 bg-slate-100 flex items-center justify-center p-4">
                    <img src={item.image} alt={item.title} className="w-full h-96 object-contain rounded-2xl shadow-sm" />
                </div>

                {/* RIGHT: DETAILS */}
                <div className="md:w-1/2 p-8 space-y-6">
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-500">{item.category}</span>
                        <h1 className="text-4xl font-black text-slate-800 mt-2">{item.title}</h1>
                        <p className="text-slate-500 mt-4 leading-relaxed italic">"{item.description}"</p>
                    </div>

                    <div className="h-[1px] bg-slate-100 w-full"></div>

                    {/* LENDER PROFILE CARD */}
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-800 mb-4 flex items-center gap-2">
                            <FaUserShield /> Verified Lender
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {owner?.name?.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{owner?.name || "Neighbor"}</h4>
                                <p className="text-xs text-slate-500">Member since {new Date(owner?.joinedAt).getFullYear()}</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2"><FaPhoneAlt className="text-indigo-400" /> {owner?.phone}</div>
                            <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-400" /> {owner?.address}</div>
                        </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <button onClick={handleRequest} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-900 transition shadow-lg flex items-center justify-center gap-3">
                        Request to Borrow
                    </button>
                    <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest">
                        By clicking, you agree to return the item in original condition
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;