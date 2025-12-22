import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaBox, FaHandHoldingHeart, FaCheckCircle, 
  FaUserCircle, FaEdit, FaTimes, FaMapMarkerAlt, FaUserEdit, FaCalendarAlt,
  FaListUl, FaTrashAlt, FaBan, FaStar, FaAward
} from 'react-icons/fa';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('lending');
  const [myItems, setMyItems] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myBorrowRequests, setMyBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState({ 
    name: '', 
    address: '', 
    phone: '', 
    createdAt: '',
    karma: 0,
    totalDeals: 0
  });

  // Helper function to determine badge based on Karma
  const getBadge = (karma) => {
    if (karma >= 500) return { name: "DharLink Legend", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "👑" };
    if (karma >= 201) return { name: "Community Pillar", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: "🏛️" };
    if (karma >= 51) return { name: "Reliable Lender", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "🤝" };
    return { name: "New Neighbor", color: "bg-slate-100 text-slate-600 border-slate-200", icon: "🌱" };
  };

  useEffect(() => {
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
      const [itemsRes, incomingRes, outgoingRes, userRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/items/user/${email}`),
        axios.get(`http://localhost:8000/api/requests/owner/${email}`),
        axios.get(`http://localhost:8000/api/requests/borrower/${email}`),
        axios.get(`http://localhost:8000/api/users/profile-by-email/${email}`)
      ]);

      setMyItems(itemsRes.data);
      setIncomingRequests(incomingRes.data);
      setMyBorrowRequests(outgoingRes.data);

      if (userRes.data) {
        setUserData({
          name: userRes.data.name || '',
          address: userRes.data.address || '',
          phone: userRes.data.phone || '',
          createdAt: userRes.data.createdAt || '',
          karma: userRes.data.karma || 0,
          totalDeals: userRes.data.totalDeals || 0
        });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
    setLoading(false);
  };

  const handleDeleteItem = async (itemId) => {
    if(!window.confirm("Deleting this item will also cancel all pending borrow requests for it. Proceed?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/items/delete/${itemId}`);
      alert("Item and associated requests removed!");
      fetchProfileData(userEmail);
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:8000/api/users/update/${userEmail}`, userData);
      alert("Profile updated successfully!");
      setIsEditModalOpen(false);
      fetchProfileData(userEmail); 
    } catch (err) {
      alert("Error updating profile");
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`http://localhost:8000/api/requests/approve/${requestId}`);
      alert("Request Approved!");
      fetchProfileData(userEmail);
    } catch (err) { alert("Error approving"); }
  };

  const handleReject = async (requestId) => {
    if(!window.confirm("Are you sure you want to reject this neighbor's request?")) return;
    try {
      await axios.patch(`http://localhost:8000/api/requests/reject/${requestId}`);
      alert("Request Rejected");
      fetchProfileData(userEmail);
    } catch (err) { alert("Error rejecting"); }
  };

  const handleComplete = async (requestId, borrowerEmail, rating) => {
    try {
      await axios.patch(`http://localhost:8000/api/requests/complete/${requestId}`, {
        rating,
        borrowerEmail
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

  const currentBadge = getBadge(userData.karma);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="bg-indigo-100 p-4 rounded-full border-4 border-white shadow-sm">
              <FaUserCircle className="text-5xl text-indigo-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center border border-slate-100 text-lg">
              {currentBadge.icon}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-800">{userData.name || "DharLink User"}</h1>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${currentBadge.color}`}>
                {currentBadge.name}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-mono mb-2">{userEmail}</p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <p className="text-xs text-indigo-500 font-bold flex items-center gap-1">
                <FaMapMarkerAlt className="text-[10px]" /> {userData.address || "Location not set"}
              </p>
              <div className="h-1 w-1 bg-slate-300 rounded-full hidden sm:block"></div>
              <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <FaCalendarAlt className="text-[10px]" /> 
                Member since {userData.createdAt 
                  ? new Date(userData.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) 
                  : "Joining date hidden"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 text-center">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1 justify-center"><FaStar /> Karma</p>
              <p className="text-xl font-black text-amber-600">{userData.karma}</p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 text-center">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 justify-center"><FaAward /> Deals</p>
              <p className="text-xl font-black text-indigo-600">{userData.totalDeals}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm transition h-fit"
          >
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('lending')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'lending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Lending Activity</button>
        <button onClick={() => setActiveTab('listings')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'listings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>My Listings</button>
        <button onClick={() => setActiveTab('borrowing')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'borrowing' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>My Borrowing</button>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-6">
        {/* ... (Lists code remains the same as before) ... */}
        {activeTab === 'lending' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2"><FaHandHoldingHeart className="text-rose-500" /> Incoming Requests</h2>
            {incomingRequests.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed">No neighbors have requested your items yet.</p> :
              incomingRequests.map(req => (
                <div key={req._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-indigo-100 transition">
                  <div>
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Request for: {req.itemTitle}</h3>
                    <p className="text-indigo-600 text-sm font-bold">Borrower Phone: {req.borrowerPhone || "Not provided"}</p>
                    <p className="text-slate-500 italic text-sm mt-1">"{req.message}"</p>
                  </div>
                  <div className="flex gap-3">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(req._id)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">Approve</button>
                        <button onClick={() => handleReject(req._id)} className="bg-rose-100 text-rose-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-rose-200">Reject</button>
                      </div>
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
                    {req.status === 'rejected' && <span className="text-rose-400 font-bold flex items-center gap-1 bg-rose-50 px-4 py-2 rounded-full text-xs uppercase tracking-widest"><FaBan /> Rejected</span>}
                    {req.status === 'completed' && <span className="text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 px-4 py-2 rounded-full text-xs uppercase tracking-widest"><FaCheckCircle /> Item Returned</span>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2"><FaListUl className="text-indigo-600" /> My Listed Items</h2>
            {myItems.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed">You haven't listed any items for lending yet.</p> :
              myItems.map(item => (
                <div key={item._id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-xl bg-slate-100" />
                    <div>
                      <h3 className="font-bold text-slate-800">{item.title}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${item.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteItem(item._id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                    <FaTrashAlt />
                  </button>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'borrowing' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2"><FaBox className="text-indigo-600" /> My Borrowing</h2>
            {myBorrowRequests.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed">You haven't requested to borrow anything yet.</p> :
              myBorrowRequests.map(req => (
                <div key={req._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">Borrowing: {req.itemTitle || "Requested Item"}</span>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">From: {req.lenderEmail}</p>
                  </div>
                  <span className={`font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest ${
                    req.status === 'approved' ? 'bg-rose-100 text-rose-600' :
                    req.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                    req.status === 'rejected' ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'
                    }`}>
                    {req.status === 'approved' ? 'Booked' : req.status}
                  </span>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><FaUserEdit className="text-indigo-600" /> Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-300" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} placeholder="Full Name" />
              <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-300" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} placeholder="Phone Number" />
              <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:border-indigo-300" value={userData.address} onChange={(e) => setUserData({ ...userData, address: e.target.value })} placeholder="Home Address" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;