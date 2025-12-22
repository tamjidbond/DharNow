import React from 'react';
import { 
  FaUserCircle, FaMapMarkerAlt, FaCalendarAlt, FaStar, 
  FaAward, FaEdit, FaMoneyBillWave, FaUsers, FaLeaf 
} from 'react-icons/fa';

const ProfileHeader = ({ userData, currentBadge, setIsEditModalOpen }) => {
  
  // Theme Map to solve the Tailwind dynamic class issue
  const themeMap = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: "bg-emerald-500",
      text: "text-emerald-800",
      value: "text-emerald-600",
      sub: "text-emerald-500",
      shadow: "shadow-lg shadow-emerald-200/50"
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      icon: "bg-yellow-500",
      text: "text-yellow-800",
      value: "text-yellow-600",
      sub: "text-yellow-500",
      shadow: "shadow-lg shadow-yellow-200/50"
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      icon: "bg-indigo-500",
      text: "text-indigo-800",
      value: "text-indigo-600",
      sub: "text-indigo-500",
      shadow: "shadow-lg shadow-indigo-200/50"
    }
  };

  return (
    <>
      {/* PROFILE TOP SECTION */}
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
              <p className="text-lg md:text-xl font-black text-amber-600">{userData.karma || 0}</p>
            </div>
            <div className="flex-1 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 text-center">
              <p className="text-[9px] font-bold text-indigo-400 uppercase flex items-center gap-1 justify-center"><FaAward /> Deals</p>
              <p className="text-lg md:text-xl font-black text-indigo-600">{userData.totalDeals || 0}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-sm transition hover:bg-indigo-600 active:scale-95"
          >
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>

      {/* STATS IMPACT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          { colorId: 'emerald', icon: <FaMoneyBillWave />, title: 'Money Saved', value: `৳${(userData.totalDeals || 0) * 500}`, sub: 'Community Savings' },
          { colorId: 'yellow', icon: <FaUsers />, title: 'Neighbors Helped', value: userData.totalDeals || 0, sub: 'Lives Touched' },
          { colorId: 'indigo', icon: <FaLeaf />, title: 'Eco Impact', value: `${userData.totalDeals || 0} Items`, sub: 'Saved from Waste' }
        ].map((stat, i) => {
          const theme = themeMap[stat.colorId];
          return (
            <div 
              key={i} 
              className={`${theme.bg} ${theme.border} ${theme.shadow} border p-6 rounded-[2rem] transition-transform duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`${theme.icon} text-white p-3 rounded-2xl shadow-sm`}>
                  {stat.icon}
                </div>
                <h4 className={`text-sm font-bold ${theme.text}`}>{stat.title}</h4>
              </div>
              <p className={`text-3xl font-black ${theme.value}`}>{stat.value}</p>
              <p className={`text-[10px] ${theme.sub} font-black uppercase tracking-widest mt-1`}>
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProfileHeader;