import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';

const Admin = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPending = async () => {
    const res = await axios.get('http://localhost:8000/api/admin/pending-users');
    setPendingUsers(res.data);
  };

  useEffect(() => { fetchPending(); }, []);

  const verifyUser = async (uid) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/verify-user/${uid}`);
      alert("User has been verified!");
      fetchPending(); // Refresh the list
    } catch (err) {
      alert("Error verifying user");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-black text-slate-800 mb-8">Verification Queue</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {pendingUsers.length === 0 ? (
          <p className="text-slate-400 italic">No users waiting for verification.</p>
        ) : (
          pendingUsers.map(user => (
            <div key={user._id} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-8">
              {/* NID PHOTO PREVIEW */}
              <div className="md:w-1/3">
                <p className="text-xs font-bold text-slate-400 mb-2">SUBMITTED NID:</p>
                <img src={user.nidPhoto} alt="NID" className="w-full rounded-xl border border-slate-200 shadow-sm" />
              </div>

              {/* USER DETAILS */}
              <div className="md:w-2/3 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-600">{user.name}</h2>
                  <p className="text-slate-500 font-mono text-sm">{user.phone}</p>
                </div>
                
                <div className="flex items-start gap-2 text-slate-600">
                  <FaMapMarkerAlt className="mt-1 text-indigo-400" />
                  <p className="text-sm">{user.address}</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => verifyUser(user.firebaseUid)}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition"
                  >
                    <FaCheck /> Approve User
                  </button>
                  <button className="bg-red-50 text-red-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition">
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;