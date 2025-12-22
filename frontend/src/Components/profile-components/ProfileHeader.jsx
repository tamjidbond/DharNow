import React from 'react';
import { FaUserCircle, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaAward, FaEdit, FaMoneyBillWave, FaUsers, FaLeaf } from 'react-icons/fa';

const ProfileHeader = ({ userData, currentBadge, setIsEditModalOpen }) => (
  <>
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
          <p className="text-slate-500 text-xs md:text-sm font-mono mb-3">{userData.email}</p>
          <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 items-center">
            <p className="text-[10px] md:text-xs text-indigo-500 font-bold flex items-center gap-1">
              <FaMapMarkerAlt /> {userData.address || "Location not set"}
            </p>
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
        <button onClick={() => setIsEditModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-sm transition hover:bg-indigo-600">
          <FaEdit /> Edit Profile
        </button>
      </div>
    </div>

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
  </>
);

export default ProfileHeader;