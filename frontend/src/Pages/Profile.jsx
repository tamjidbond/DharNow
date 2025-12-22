import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUserEdit, FaTimes } from 'react-icons/fa';

// IMPORT THE NEW COMPONENTS
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
  const [userData, setUserData] = useState({ name: '', address: '', phone: '', createdAt: '', karma: 0, totalDeals: 0 });

  // Logic functions... (keep getBadge, fetchProfileData, handleDeleteItem, handleUpdateProfile, handleApprove, handleReject, handleComplete)
  const getBadge = (karma) => {
    if (karma >= 500) return { name: "DharNow Legend", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "👑" };
    if (karma >= 201) return { name: "Community Pillar", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: "🏛️" };
    if (karma >= 51) return { name: "Reliable Lender", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "🤝" };
    return { name: "New Neighbor", color: "bg-slate-100 text-slate-600 border-slate-200", icon: "🌱" };
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) { setUserEmail(savedEmail); fetchProfileData(savedEmail); }
    else { setLoading(false); }
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
      if (userRes.data) setUserData({ ...userRes.data, email });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDeleteItem = async (id) => {
    const res = await Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true });
    if (res.isConfirmed) { await axios.delete(`http://localhost:8000/api/items/delete/${id}`); fetchProfileData(userEmail); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await axios.patch(`http://localhost:8000/api/users/update/${userEmail}`, userData);
    setIsEditModalOpen(false); fetchProfileData(userEmail);
  };

  const handleApprove = async (id) => { await axios.patch(`http://localhost:8000/api/requests/approve/${id}`); fetchProfileData(userEmail); };
  const handleReject = async (id) => { await axios.patch(`http://localhost:8000/api/requests/reject/${id}`); fetchProfileData(userEmail); };
  const handleComplete = async (id, borrowerEmail, rating) => {
    await axios.patch(`http://localhost:8000/api/requests/complete/${id}`, { rating, borrowerEmail });
    fetchProfileData(userEmail);
  };

  if (loading) return <div className="py-20 text-center font-bold">Syncing...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-20">
      <ProfileHeader userData={userData} currentBadge={getBadge(userData.karma)} setIsEditModalOpen={setIsEditModalOpen} />

      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {['lending', 'listings', 'borrowing'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            {tab === 'lending' ? 'Requests Received' : tab === 'listings' ? 'My Listings' : 'My Borrowing'}
          </button>
        ))}
      </div>

      {activeTab === 'lending' && <IncomingRequests requests={incomingRequests} handleApprove={handleApprove} handleReject={handleReject} handleComplete={handleComplete} />}
      {activeTab === 'listings' && <MyListings items={myItems} handleDeleteItem={handleDeleteItem} />}
      {activeTab === 'borrowing' && <MyBorrowing requests={myBorrowRequests} />}

      {/* Keep the Modal here for simplicity or move it too */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><FaUserEdit className="text-indigo-600" /> Edit Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-400"><FaTimes /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} required />
              <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Phone" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} required />
              <input type="text" className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Address" value={userData.address} onChange={(e) => setUserData({ ...userData, address: e.target.value })} />
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;