import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaBox, FaHandHoldingHeart, FaCheckCircle, 
  FaClock, FaUserCircle, FaStar 
} from 'react-icons/fa';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('lending');
  const [myItems, setMyItems] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myBorrowRequests, setMyBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // 1. Get the email from localStorage (instead of Firebase)
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
      fetchProfileData(savedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfileData = async (email) => {
    setLoading(true);
    try {
      // 2. Fetch using email instead of uid
      const [itemsRes, incomingRes, outgoingRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/items/user/${email}`),
        axios.get(`http://localhost:8000/api/requests/owner/${email}`),
        axios.get(`http://localhost:8000/api/requests/borrower/${email}`)
      ]);

      setMyItems(itemsRes.data);
      setIncomingRequests(incomingRes.data);
      setMyBorrowRequests(outgoingRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
    setLoading(false);
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`http://localhost:8000/api/requests/approve/${requestId}`);
      alert("Request Approved!");
      fetchProfileData(userEmail);
    } catch (err) { alert("Error approving"); }
  };

  const handleComplete = async (requestId, borrowerEmail, rating) => {
    try {
      await axios.patch(`http://localhost:8000/api/requests/complete/${requestId}`, {
        rating, 
        borrowerEmail // Using email now
      });
      alert("Item Returned & Karma Updated!");
      fetchProfileData(userEmail);
    } catch (err) { alert("Error completing"); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-indigo-600 font-bold animate-pulse">Syncing DharLink Profile...</p>
    </div>
  );

  if (!userEmail) return (
    <div className="text-center py-20 font-bold text-red-500 bg-red-50 m-10 rounded-3xl border border-red-100">
      Please sign in to view your profile activity.
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-4 rounded-full">
            <FaUserCircle className="text-4xl text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">My Dashboard</h1>
            <p className="text-slate-500 text-sm font-mono">{userEmail}</p>
          </div>
        </div>
        <div className="bg-indigo-50 px-6 py-2 rounded-2xl border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Listed Items</p>
          <p className="text-xl font-black text-indigo-600 text-center">{myItems.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('lending')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'lending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Lending Activity</button>
        <button onClick={() => setActiveTab('borrowing')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'borrowing' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>My Borrowing</button>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'lending' ? (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2"><FaHandHoldingHeart className="text-rose-500" /> Incoming Requests</h2>
            {incomingRequests.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed">No neighbors have requested your items yet.</p> : 
              incomingRequests.map(req => (
                <div key={req._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Request for: {req.itemTitle || 'Your Item'}</h3>
                    <p className="text-slate-500 italic text-sm mt-1">"{req.message}"</p>
                  </div>
                  <div className="flex gap-3">
                    {req.status === 'pending' && (
                      <button onClick={() => handleApprove(req._id)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">Approve</button>
                    )}
                    {req.status === 'approved' && (
                      <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <select id={`rate-${req._id}`} className="bg-white border p-2 rounded-lg text-sm">
                          <option value="5">⭐⭐⭐⭐⭐</option>
                          <option value="4">⭐⭐⭐⭐</option>
                          <option value="1">⭐ (Issues)</option>
                        </select>
                        <button onClick={() => {
                          const val = document.getElementById(`rate-${req._id}`).value;
                          handleComplete(req._id, req.borrowerEmail, parseInt(val));
                        }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100">Finish Return</button>
                      </div>
                    )}
                    {req.status === 'completed' && <span className="text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 px-4 py-2 rounded-full text-xs uppercase tracking-widest"><FaCheckCircle /> Item Returned</span>}
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2"><FaBox className="text-indigo-600" /> My Borrowing</h2>
            {myBorrowRequests.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed">You haven't requested to borrow anything yet.</p> : 
              myBorrowRequests.map(req => (
                <div key={req._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">Borrowing: {req.itemTitle || "Requested Item"}</span>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">To be borrowed from: {req.lenderEmail}</p>
                  </div>
                  <span className={`font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {req.status}
                  </span>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;