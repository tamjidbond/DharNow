import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaBullhorn, FaMagic, FaHandHoldingHeart, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router';

// --- COMPONENT 1: The Form to post a new wish ---
const PostWish = ({ onWishPosted }) => {
    const [wish, setWish] = useState({ name: '', category: '', description: '' });
    const userEmail = localStorage.getItem('userEmail');
    const [categories, setCategories] = useState([])
    useEffect(() => {
        fetch('http://localhost:8000/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                console.log("Categories loaded into DharLink:", data);
            })
            .catch(err => console.error("Could not load categories:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/wishes/create', {
                ...wish,
                requesterEmail: userEmail,
                status: 'open'
            });

            Swal.fire({
                title: 'Wish Broadcasted!',
                text: 'Your neighbors will see this on the Request Board.',
                icon: 'success',
                confirmButtonColor: '#4f46e5',
                customClass: { popup: 'rounded-[3rem]' }
            });
            setWish({ name: '', category: '', description: '' });
            if (onWishPosted) onWishPosted();
        } catch (err) {
            Swal.fire('Error', 'Could not post wish. Make sure your backend is running!', 'error');
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-10 rounded-[3rem] text-white shadow-2xl mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FaBullhorn size={24} /></div>
                <h2 className="text-3xl font-black tracking-tight">Can't find an item?</h2>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder="What do you need?"
                    className="bg-white/10 border border-white/20 p-4 rounded-md outline-none focus:bg-white/20 placeholder:text-white/60 font-bold"
                    value={wish.name}
                    onChange={(e) => setWish({ ...wish, name: e.target.value })}
                    required
                />
                <select
                    className="bg-white/10 border border-white/20 p-4 rounded-xl outline-none focus:bg-white/20 font-bold text-white"
                    value={wish.category}
                    onChange={(e) => setWish({ ...wish, category: e.target.value })}
                    required
                >
                    <option value="" className='text-slate-900'>Select Category</option>

                    {/* We map through the categories from the database here */}
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat.name} className='text-slate-900'>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button type="submit" className="bg-white text-indigo-600 font-black uppercase tracking-widest py-4 rounded-md hover:bg-emerald-400 hover:text-white transition-all flex items-center justify-center gap-2">
                    <FaMagic /> Broadcast Wish
                </button>
            </form>
        </div>
    );
};

// --- COMPONENT 2: The main page that shows the board ---
const RequestBoard = () => {
    const [wishes, setWishes] = useState([]);
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        fetchWishes();
    }, []);

    const fetchWishes = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/wishes');
            setWishes(res.data);
        } catch (err) {
            console.error("Failed to fetch wishes", err);
        }
    };

    const handleFulfill = async (wish) => {
        if (!wish || !wish.name) return Swal.fire('Error', 'Invalid wish data', 'error');
        const currentLenderEmail = localStorage.getItem('userEmail');

        try {
            // 1. Fetch all my items
            const res = await axios.get(`http://localhost:8000/api/items/user/${currentLenderEmail}`);
            const myItems = res.data;

            // 2. Create an Options Object for the dropdown
            // We create a map where the Key is the ItemID and the Value is the Item Title
            const itemOptions = {};
            myItems.forEach(item => {
                itemOptions[item._id] = item.title;
            });

            // 3. Show the "Choice" Modal
            const { value: selection } = await Swal.fire({
                title: 'How would you like to help?',
                text: `Neighbor needs: "${wish.name}"`,
                icon: 'question',
                input: 'select',
                inputOptions: {
                    ...itemOptions,
                    'NEW': '+ Create a new listing for this'
                },
                inputPlaceholder: 'Select an item you own',
                showCancelButton: true,
                confirmButtonText: 'Continue',
                confirmButtonColor: '#4f46e5',
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if (value) { resolve(); }
                        else { resolve('Please select an option or create new'); }
                    });
                }
            });

            if (selection) {
                if (selection === 'NEW') {
                    // OPTION: Create new listing
                    navigate('/lend', {
                        state: {
                            predefinedName: wish.name,
                            wishId: wish._id,
                            targetUser: wish.requesterEmail
                        }
                    });
                } else {
                    // OPTION: Selected an existing item
                    const selectedItemTitle = itemOptions[selection];

                    await axios.post('http://localhost:8000/api/messages/send', {
                        senderEmail: currentLenderEmail,
                        receiverEmail: wish.requesterEmail,
                        itemId: selection, // The ID of the item you picked
                        itemTitle: selectedItemTitle,
                        text: `Hi! I saw your wish for "${wish.name}". I have my "${selectedItemTitle}" available for you!`,
                    });

                    Swal.fire({
                        title: 'Link Sent!',
                        text: `Neighbor notified about your ${selectedItemTitle}`,
                        icon: 'success',
                        confirmButtonColor: '#10b981'
                    });
                }
            }
        } catch (err) {
            console.error("Error in fulfilling wish:", err);
            Swal.fire('Error', 'Could not access your items.', 'error');
        }
    };

    const handleDeleteWish = async (id) => {
        const result = await Swal.fire({
            title: 'Remove this wish?',
            text: "This will take it off the community board.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8000/api/wishes/delete/${id}`);
                Swal.fire('Deleted!', 'Your wish has been removed.', 'success');
                fetchWishes();
            } catch (err) {
                Swal.fire('Error', 'Could not delete wish', 'error');
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <PostWish onWishPosted={fetchWishes} />

            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                    <FaHandHoldingHeart className="text-rose-500" /> Neighborhood Wishes
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishes.length > 0 ? wishes.map((wish) => {
                    const isMyWish = wish.requesterEmail === userEmail;

                    return (
                        <div key={wish._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col gap-6 group hover:border-indigo-500 transition-all">

                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <img
                                    src={wish.posterDetails?.profileImage || "https://via.placeholder.com/40"}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-indigo-50"
                                    alt="poster"
                                />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Requested by</p>
                                    <p className="text-sm font-bold text-slate-800">{isMyWish ? "You (Me)" : wish.posterDetails?.name || "Neighbor"}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl font-black">
                                        {wish.name ? wish.name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900">{wish.name}</h4>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{wish.category}</p>
                                    </div>
                                </div>

                                {isMyWish ? (
                                    <button
                                        onClick={() => handleDeleteWish(wish._id)}
                                        className="bg-rose-50 text-rose-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                    >
                                        Delete Wish
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFulfill(wish)} // FIXED: Now passing entire 'wish' object
                                        className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    >
                                        I have this!
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No active wishes right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestBoard;