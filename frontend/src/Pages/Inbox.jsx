import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaUserCircle, FaInbox, FaSearch, FaArrowLeft, FaPlus, FaBoxOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // --- SEARCH STATES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const userEmail = localStorage.getItem('userEmail');
    const scrollRef = useRef();
    const navigate = useNavigate();

    // SweetAlert Toast Configuration
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#1e293b'
    });

    // Fetch Unique Conversations
    const fetchChats = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/messages/${userEmail}`);
            const uniquePeople = [...new Set(res.data.map(m =>
                m.senderEmail === userEmail ? m.receiverEmail : m.senderEmail
            ))];
            setConversations(uniquePeople);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (userEmail) fetchChats();
    }, [userEmail]);

    // Live Search Logic
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const res = await axios.get(`http://localhost:8000/api/users/search?query=${query}`);
                setSearchResults(res.data.filter(u => u.email !== userEmail));
            } catch (err) {
                console.error("Search failed");
            }
        } else {
            setSearchResults([]);
        }
    };

    // Polling and Read Status Logic
    useEffect(() => {
        if (activeChat) {
            const markAsReadAndFetch = async () => {
                try {
                    const res = await axios.get(`http://localhost:8000/api/messages/thread/${userEmail}/${activeChat}`);
                    setMessages(res.data);

                    const unreadForMe = res.data.some(m => !m.isRead && m.receiverEmail === userEmail);
                    if (unreadForMe) {
                        await axios.patch(`http://localhost:8000/api/messages/read-thread/${userEmail}/${activeChat}`);
                        window.dispatchEvent(new Event('messagesRead'));
                    }
                } catch (err) {
                    console.error("Chat sync error", err);
                }
            };

            markAsReadAndFetch();
            const interval = setInterval(markAsReadAndFetch, 4000);
            return () => clearInterval(interval);
        }
    }, [activeChat, userEmail]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgData = {
            senderEmail: userEmail,
            receiverEmail: activeChat,
            text: newMessage,
            itemTitle: "Chat Message"
        };

        try {
            await axios.post('http://localhost:8000/api/messages/send', msgData);
            setMessages([...messages, { ...msgData, createdAt: new Date() }]);
            setNewMessage("");
            if (!conversations.includes(activeChat)) fetchChats();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Message Not Sent',
                text: 'Check your internet connection and try again.',
                confirmButtonColor: '#4f46e5'
            });
        }
    };

    const startNewChat = (user) => {
        setActiveChat(user.email);
        setSearchQuery('');
        Toast.fire({
            icon: 'success',
            title: `Connected with ${user.name.split(' ')[0]}`
        });
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">Syncing DharNow Conversations...</div>;

    return (
        <div className="max-w-6xl mx-auto h-[85vh] bg-white mt-6 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex">

            {/* SIDEBAR */}
            <div className={`w-full md:w-96 border-r border-slate-50 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-black flex items-center gap-2">
                        <FaInbox className="text-indigo-600" /> Neighbors
                    </h2>

                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find a neighbor..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    {/* SEARCH RESULTS SECTION */}
                    {searchQuery.length > 2 && (
                        <div className="bg-indigo-50/50 pb-4">
                            <p className="px-6 py-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Search Results</p>
                            {searchResults.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => startNewChat(user)}
                                    className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-indigo-100 transition-all"
                                >
                                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><FaPlus size={12} /></div>
                                    <div className="overflow-hidden">
                                        <p className="font-black text-slate-800 text-sm truncate">{user.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* RECENT CHATS SECTION */}
                    <p className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Recent Chats</p>
                    {conversations.length === 0 ? (
                        <p className="px-6 py-4 text-xs font-bold text-slate-400 italic">No recent messages</p>
                    ) : (
                        conversations.map((person) => (
                            <div
                                key={person}
                                onClick={() => setActiveChat(person)}
                                className={`px-6 py-4 flex items-center gap-3 cursor-pointer transition-all ${activeChat === person ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
                            >
                                <FaUserCircle size={36} className={activeChat === person ? 'text-white' : 'text-slate-200'} />
                                <div className="overflow-hidden">
                                    <p className={`font-black text-sm truncate ${activeChat === person ? 'text-white' : 'text-slate-800'}`}>
                                        {person.split('@')[0]}
                                    </p>
                                    <p className={`text-[9px] font-bold uppercase ${activeChat === person ? 'text-indigo-200' : 'text-slate-400'}`}>Neighbor</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CHAT WINDOW */}
            <div className={`flex-1 flex flex-col bg-slate-50 ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                {activeChat ? (
                    <>
                        <div className="p-6 bg-white border-b border-slate-100 flex items-center gap-4 shadow-sm">
                            <button onClick={() => setActiveChat(null)} className="md:hidden text-slate-400 hover:text-indigo-600"><FaArrowLeft size={20} /></button>
                            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">{activeChat.charAt(0).toUpperCase()}</div>
                            <div>
                                <h3 className="font-black text-slate-800 leading-none">{activeChat.split('@')[0]}</h3>
                                <p className="text-[10px] text-emerald-500 font-black mt-1 uppercase tracking-widest">Active Chat</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((m, index) => (
                                <div key={index} className={`flex ${m.senderEmail === userEmail ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-4 rounded-[1.8rem] font-bold text-sm shadow-sm ${m.senderEmail === userEmail
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                                        }`}>

                                        {m.text}

                                        {/* ATTACHED ITEM CARD - HANDSHAKE SYSTEM */}
                                        {m.itemId && (
                                            <div className={`mt-3 p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${m.senderEmail === userEmail
                                                ? 'bg-white/10 border-white/20 hover:bg-white/20'
                                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                                                onClick={() => navigate(`/item/${m.itemId}`)}
                                            >
                                                <div className={`p-2 rounded-xl ${m.senderEmail === userEmail ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                                    <FaBoxOpen size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${m.senderEmail === userEmail ? 'text-indigo-100' : 'text-slate-400'}`}>Attached Item</p>
                                                    <p className={`text-xs font-black truncate ${m.senderEmail === userEmail ? 'text-white' : 'text-slate-800'}`}>{m.itemTitle}</p>
                                                </div>
                                                <div className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${m.senderEmail === userEmail ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                                                    View
                                                </div>
                                            </div>
                                        )}

                                        <p className={`text-[8px] mt-1 opacity-60 ${m.senderEmail === userEmail ? 'text-right' : 'text-left'}`}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Message ${activeChat.split('@')[0]}...`}
                                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                            />
                            <button type="submit" className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="h-24 w-24 bg-indigo-50 text-indigo-200 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                            <FaInbox size={40} />
                        </div>
                        <h3 className="font-black text-slate-800 text-xl">Your DharNow Conversations</h3>
                        <p className="text-slate-400 font-bold text-sm mt-2">Search for a neighbor or select a chat to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;