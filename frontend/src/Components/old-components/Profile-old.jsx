import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Make sure to run: npm install sweetalert2
import {
  FaBox, FaHandHoldingHeart, FaCheckCircle,
  FaUserCircle, FaEdit, FaTimes, FaMapMarkerAlt, FaUserEdit, FaCalendarAlt,
  FaListUl, FaTrashAlt, FaBan, FaStar, FaAward, FaMoneyBillWave, FaUsers, FaLeaf
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

  const getBadge = (karma) => {
    if (karma >= 500) return { name: "DharNow Legend", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "👑" };
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
    const result = await Swal.fire({
      title: 'Delete Item?',
      text: "This will also cancel all pending borrow requests.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/api/items/delete/${itemId}`);
        Swal.fire('Deleted!', 'Item has been removed.', 'success');
        fetchProfileData(userEmail);
      } catch (err) {
        Swal.fire('Error', 'Could not delete item', 'error');
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:8000/api/users/update/${userEmail}`, userData);
      Swal.fire({ title: 'Success!', text: 'Profile updated successfully!', icon: 'success', timer: 2000, showConfirmButton: false });
      setIsEditModalOpen(false);
      fetchProfileData(userEmail);
    } catch (err) {
      Swal.fire('Error', 'Error updating profile', 'error');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`http://localhost:8000/api/requests/approve/${requestId}`);
      Swal.fire('Approved!', 'The request is now active.', 'success');
      fetchProfileData(userEmail);
    } catch (err) { Swal.fire('Error', 'Approval failed', 'error'); }
  };

  const handleReject = async (requestId) => {
    const result = await Swal.fire({
      title: 'Reject Request?',
      text: "Are you sure you want to reject this neighbor?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, reject'
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`http://localhost:8000/api/requests/reject/${requestId}`);
        Swal.fire('Rejected', 'Request has been declined.', 'info');
        fetchProfileData(userEmail);
      } catch (err) { Swal.fire('Error', 'Rejection failed', 'error'); }
    }
  };

  const handleComplete = async (requestId, borrowerEmail, rating) => {
    try {
      await axios.patch(`http://localhost:8000/api/requests/complete/${requestId}`, {
        rating,
        borrowerEmail
      });
      Swal.fire('Completed!', 'Item Returned & Karma Updated!', 'success');
      fetchProfileData(userEmail);
    } catch (err) { Swal.fire('Error', 'Completion failed', 'error'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-indigo-600 font-bold animate-pulse text-center px-4">Syncing DharNow Profile...</p>
    </div>
  );

  if (!userEmail) return (
    <div className="text-center py-20 font-bold text-red-500 bg-red-50 m-4 md:m-10 rounded-3xl border border-red-100">
      Please sign in to view your profile activity.
    </div>
  );

  const currentBadge = getBadge(userData.karma);

  return (
    <div className="max-w-6xl mx-auto py-4 md:py-8 px-4 animate-in fade-in duration-500 pb-24 md:pb-20">

      {/* Header Section - Responsive Stack */}
      <div className="bg-white rounded-[2rem] md:rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          <div className="relative">
            <div className="bg-indigo-100 p-4 rounded-full border-4 border-white shadow-sm">
              <FaUserCircle className="text-5xl md:text-6xl text-indigo-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center border border-slate-100 text-lg">
              {currentBadge.icon}
            </div>
          </div>

          <div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-1">
              <h1 className="text-xl md:text-2xl font-black text-slate-800">{userData.name || "DharNow User"}</h1>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${currentBadge.color}`}>
                {currentBadge.name}
              </span>
            </div>
            <p className="text-slate-500 text-xs md:text-sm font-mono mb-3">{userEmail}</p>

            <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 items-center">
              <p className="text-[10px] md:text-xs text-indigo-500 font-bold flex items-center gap-1">
                <FaMapMarkerAlt /> {userData.address || "Location not set"}
              </p>
              <div className="h-1 w-1 bg-slate-300 rounded-full hidden md:block"></div>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold flex items-center gap-1">
                <FaCalendarAlt /> Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : "2024"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex-1 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 text-center">
              <p className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1 justify-center"><FaStar /> Karma</p>
              <p className="text-lg md:text-xl font-black text-amber-600">{userData.karma}</p>
            </div>
            <div className="flex-1 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 text-center">
              <p className="text-[9px] font-bold text-indigo-400 uppercase flex items-center gap-1 justify-center"><FaAward /> Deals</p>
              <p className="text-lg md:text-xl font-black text-indigo-600">{userData.totalDeals}</p>
            </div>
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-sm transition">
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      {/* Impact Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { color: 'emerald', icon: <FaMoneyBillWave />, title: 'Money Saved', value: `৳${(userData.totalDeals || 0) * 500}`, sub: 'Community Savings' },
          { color: 'indigo', icon: <FaUsers />, title: 'Neighbors Helped', value: userData.totalDeals, sub: 'Lives Touched' },
          { color: 'sky', icon: <FaLeaf />, title: 'Eco Impact', value: `${userData.totalDeals} Items`, sub: 'Saved from Waste' }
        ].map((stat, i) => (
          <div key={i} className={`bg-${stat.color}-50 border border-${stat.color}-100 p-5 rounded-3xl`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`bg-${stat.color}-500 text-white p-2 rounded-lg`}><stat.icon.type /></div>
              <h4 className={`text-sm font-bold text-${stat.color}-800`}>{stat.title}</h4>
            </div>
            <p className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</p>
            <p className={`text-[10px] text-${stat.color}-500 font-bold uppercase tracking-wider`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit">
        {['lending', 'listings', 'borrowing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            {tab === 'lending' ? 'Requests Received' : tab === 'listings' ? 'My Listings' : 'My Borrowing'}
          </button>
        ))}
      </div>

      {/* Lists - Responsive Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {activeTab === 'lending' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2 text-sm md:text-base"><FaHandHoldingHeart className="text-rose-500" /> Requests Received</h2>
            {incomingRequests.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed text-sm">No requests yet.</p> :
              incomingRequests.map(req => (
                <div key={req._id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-indigo-100 transition">
                  {/* Inside mapping of incomingRequests */}
                  <div className="w-full">
                    <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1">
                      Item: {req.itemTitle}
                    </h3>
                    <p className="text-slate-900 text-sm font-black flex items-center gap-2">
                      <FaUserCircle className="text-slate-400" /> {req.borrowerName || "Neighbor"}
                    </p>
                    <p className="text-indigo-600 text-xs font-bold mt-1">{req.borrowerEmail}</p>

                    {/* WhatsApp Button for Owner to contact Borrower */}



                    <p className="text-slate-500 italic text-sm mt-2 border-l-2 border-slate-100 pl-3">"{req.message}"</p>
                  </div>
                  <div className="w-full lg:w-auto">
                    {/* Replace the action buttons inside req.status === 'pending' with this: */}

                    {req.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2 w-full lg:w-48">
                        <button
                          onClick={() => handleApprove(req._id)}
                          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm shadow-indigo-200"
                        >
                          <FaCheckCircle className="text-[10px]" /> Approve
                        </button>

                        <button
                          onClick={() => handleReject(req._id)}
                          className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 border border-rose-100"
                        >
                          <FaBan className="text-[10px]" /> Reject
                        </button>
                      </div>
                    )}
                    {req.status === 'approved' && (
                      <div className="flex flex-col sm:flex-row gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full">
                        <select id={`rate-${req._id}`} className="w-full bg-white border p-2 rounded-lg text-xs font-bold outline-none">
                          <option value="5">Great Neighbor (5⭐)</option>
                          <option value="3">It was okay (3⭐)</option>
                          <option value="1">Bad Experience (1⭐)</option>
                        </select>
                        <button onClick={() => {
                          const val = document.getElementById(`rate-${req._id}`).value;
                          handleComplete(req._id, req.borrowerEmail, parseInt(val));
                        }} className="w-full whitespace-nowrap bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs">Complete</button>
                      </div>
                    )}
                    {(req.status === 'completed' || req.status === 'rejected') && (
                      <span className={`flex items-center justify-center gap-1 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest w-full ${req.status === 'completed' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-400 bg-rose-50'}`}>
                        {req.status === 'completed' ? <FaCheckCircle /> : <FaBan />} {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2 text-sm md:text-base"><FaListUl className="text-indigo-600" /> My Listings</h2>
            {myItems.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed text-sm">No items listed.</p> :
              myItems.map(item => (
                <div key={item._id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.image} alt="" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl bg-slate-100 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">{item.title}</h3>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteItem(item._id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex-shrink-0"><FaTrashAlt /></button>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'borrowing' && (
          <div className="space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2 text-sm md:text-base">
              <FaBox className="text-indigo-600" /> My Borrowing
            </h2>
            {myBorrowRequests.length === 0 ? (
              <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed text-sm">No requests found.</p>
            ) : (
              myBorrowRequests.map(req => {
                // This removes everything except numbers so the WhatsApp link works perfectly
                return (
                  <div key={req._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 text-sm block truncate">{req.itemTitle}</span>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest truncate">Lender: {req.lenderName || req.lenderEmail}</p>


                    </div>

                    <span className={`whitespace-nowrap font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest ${req.status === 'approved' ? 'bg-rose-100 text-rose-600' : req.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {req.status === 'approved' ? 'Ready for Pickup' : req.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2"><FaUserEdit className="text-indigo-600" /> Edit Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-400"><FaTimes /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 block mb-1">Display Name</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-300 text-sm font-bold" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 block mb-1">Phone (For WhatsApp)</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-300 text-sm font-bold" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 block mb-1">Neighborhood</label>
                <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-300 text-sm font-bold" value={userData.address} onChange={(e) => setUserData({ ...userData, address: e.target.value })} />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 transition mt-4">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;