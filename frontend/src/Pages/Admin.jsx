import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Admin = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:8000/api/admin/pending-users');
    setPendingUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const verifyUser = async (email) => {
    await axios.patch(`http://localhost:8000/api/admin/verify-user/${email}`);
    alert("User Verified!");
    fetchUsers();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-black text-slate-800 mb-8">Verification Queue</h1>
      <div className="grid gap-6">
        {pendingUsers.length === 0 ? <p className="italic text-slate-400 text-center py-20">No pending users.</p> : 
          pendingUsers.map(user => (
            <div key={user._id} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-6">
              <img src={user.nidPhoto} className="w-full md:w-48 h-32 object-cover rounded-2xl cursor-pointer" onClick={() => window.open(user.nidPhoto)} alt="NID" />
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <div className="text-slate-500 text-sm flex items-center gap-2"><FaEnvelope /> {user.email}</div>
                <div className="text-slate-500 text-sm flex items-center gap-2"><FaMapMarkerAlt /> {user.address}</div>
                <button onClick={() => verifyUser(user.email)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold mt-2 hover:bg-emerald-600 transition">Approve User</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};
export default Admin;