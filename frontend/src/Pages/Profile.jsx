import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUserEdit, FaTimes, FaCamera, FaCircleNotch } from 'react-icons/fa';

// COMPONENTS
import ProfileHeader from '../Components/profile-components/ProfileHeader';
import IncomingRequests from '../Components/profile-components/IncomingRequests';
import MyListings from '../Components/profile-components/MyListings';
import MyBorrowing from '../Components/profile-components/MyBorrowing';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('lending');
  const [myItems, setMyItems] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myBorrowRequests, setMyBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [userData, setUserData] = useState({
    name: '', address: '', phone: '', createdAt: '', karma: 0, totalDeals: 0, profileImage: ''
  });

  const getBadge = (karma) => {
    if (karma >= 500) return { name: "DharNow Legend", color: "bg-amber-50 text-amber-600 border-amber-100", icon: "👑" };
    if (karma >= 201) return { name: "Community Pillar", color: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: "🏛️" };
    if (karma >= 51) return { name: "Reliable Lender", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: "🤝" };
    return { name: "New Neighbor", color: "bg-slate-50 text-slate-500 border-slate-200", icon: "🌱" };
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
      if (userRes.data) setUserData({ ...userRes.data, email });
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // 1. Create a Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600; // Resize to max 600px width (Perfect for profile pics)
        const scaleSize = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 2. Compress the image (0.7 means 70% quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        // 3. Update State
        setUserData({ ...userData, profileImage: compressedBase64 });
      };
    };
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:8000/api/users/update/${userEmail}`, userData);
      setIsEditModalOpen(false);
      fetchProfileData(userEmail);
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[2rem]' }
      });
    } catch (err) {
      Swal.fire('Error', 'Could not update profile', 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    const res = await Swal.fire({
      title: 'Delete Listing?',
      text: "This item will be removed from the community map.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      customClass: { popup: 'rounded-[2rem]' }
    });
    if (res.isConfirmed) {
      await axios.delete(`http://localhost:8000/api/items/delete/${id}`);
      fetchProfileData(userEmail);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/requests/approve/${id}`);
      Swal.fire({ icon: 'success', title: 'Approved!', timer: 2000, showConfirmButton: false, customClass: { popup: 'rounded-[2rem]' } });
      fetchProfileData(userEmail);
    } catch (err) { Swal.fire('Error', 'Approval failed', 'error'); }
  };

  const handleReject = async (id) => {
    const res = await Swal.fire({ title: 'Reject Request?', icon: 'question', showCancelButton: true, customClass: { popup: 'rounded-[2rem]' } });
    if (res.isConfirmed) {
      await axios.patch(`http://localhost:8000/api/requests/reject/${id}`);
      fetchProfileData(userEmail);
    }
  };

  const handleComplete = async (requestId, borrowerEmail, rating) => {
    try {
      Swal.showLoading();
      const res = await axios.patch(`http://localhost:8000/api/requests/complete/${requestId}`, { rating });
      Swal.fire({
        icon: 'success',
        title: 'Transaction Complete!',
        text: res.data.message,
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-[2rem]' }
      });
      fetchProfileData(userEmail);
    } catch (err) {
      Swal.fire('Error', 'Could not complete return', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
      <FaCircleNotch className="text-4xl text-indigo-600 animate-spin" />
      <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Syncing DharLink Dashboard</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 pb-24">
      <ProfileHeader
        userData={userData}
        currentBadge={getBadge(userData.karma)}
        setIsEditModalOpen={setIsEditModalOpen}
      />

      {/* NAVIGATION TABS: White Mode Glassmorphism */}
      <div className="flex gap-2 mb-10 bg-slate-100/50 p-2 rounded-[1.5rem] w-fit mx-auto md:mx-0 border border-slate-200/50 backdrop-blur-sm">
        {[
          { id: 'lending', label: 'Requests Received' },
          { id: 'listings', label: 'My Listings' },
          { id: 'borrowing', label: 'My Borrowing' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/5 scale-105'
                : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'lending' && <IncomingRequests requests={incomingRequests} handleApprove={handleApprove} handleReject={handleReject} handleComplete={handleComplete} />}
        {activeTab === 'listings' && <MyListings items={myItems} handleDeleteItem={handleDeleteItem} />}
        {activeTab === 'borrowing' && <MyBorrowing requests={myBorrowRequests} />}
      </div>

      {/* EDIT PROFILE MODAL: Refined White UI */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1001] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><FaUserEdit size={18} /></div>
                Edit Profile
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-50 p-3 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* IMAGE UPLOAD UI */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 transition-transform group-hover:scale-105 duration-500">
                    <img
                      src={userData.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl cursor-pointer shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all">
                    <FaCamera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Identity</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Full Name</label>
                  <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Phone Number</label>
                  <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Location Address</label>
                  <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700" value={userData.address} onChange={(e) => setUserData({ ...userData, address: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-indigo-600 transition-all mt-6 shadow-xl shadow-indigo-100 active:scale-[0.98]">
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;