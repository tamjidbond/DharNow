import React from 'react';
import {
  FaUserCircle, FaMapMarkerAlt, FaCalendarAlt, FaStar,
  FaAward, FaEdit, FaMoneyBillWave, FaUsers, FaLeaf, FaShieldAlt
} from 'react-icons/fa';

const ProfileHeader = ({ userData, currentBadge, setIsEditModalOpen }) => {

  // Refined Theme Map - Keeping all original logic but improving colors
  const themeMap = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-white",
      border: "border-emerald-100",
      iconBox: "bg-emerald-500",
      text: "text-emerald-900",
      value: "text-emerald-600",
      sub: "text-emerald-500/70",
      shadow: "shadow-xl shadow-emerald-500/10"
    },
    yellow: {
      bg: "bg-gradient-to-br from-amber-50 to-white",
      border: "border-amber-100",
      iconBox: "bg-amber-500",
      text: "text-amber-900",
      value: "text-amber-600",
      sub: "text-amber-500/70",
      shadow: "shadow-xl shadow-amber-500/10"
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-50 to-white",
      border: "border-indigo-100",
      iconBox: "bg-indigo-600",
      text: "text-indigo-900",
      value: "text-indigo-600",
      sub: "text-indigo-500/70",
      shadow: "shadow-xl shadow-indigo-500/10"
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* --- MAIN PROFILE CARD --- */}
      <div className="relative bg-white rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 mb-10 overflow-hidden group">

        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110 duration-700" />

        <div className="relative flex flex-col lg:flex-row justify-between items-center gap-10">

          {/* Left Side: Avatar and Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* AVATAR SECTION (Kept original logic) */}
            <div className="relative">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="w-full h-full rounded-[2.3rem] overflow-hidden bg-white flex items-center justify-center">
                  <img
                    // If profileImage exists, use it; otherwise, use Dicebear
                    src={userData.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email || 'guest'}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    // This part fixes Chrome specifically:
                    onError={(e) => {
                      // Prevents infinite loops if Dicebear is also down
                      e.target.onerror = null;
                      // Fallback to the avatar if the uploaded image fails to load
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email || 'guest'}`;
                    }}
                    // Ensures Chrome handles cross-origin images correctly
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
              {/* BADGE OVERLAY (Kept original logic) */}
              <div className="absolute -bottom-2 -right-2 bg-white shadow-2xl rounded-2xl w-12 h-12 flex items-center justify-center border border-slate-50 text-2xl animate-bounce-slow">
                {currentBadge.icon}
              </div>
            </div>

            {/* TEXT INFO SECTION */}
            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {userData.name || "DharNow Member"}
                  </h1>
                  <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 bg-white shadow-sm ${currentBadge.color}`}>
                    <FaShieldAlt /> {currentBadge.name}
                  </span>
                </div>
                <p className="text-slate-400 text-sm font-bold tracking-wide">
                  {userData.email}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 text-xs font-black uppercase tracking-wider">
                  <FaMapMarkerAlt /> {userData.address || "Add Address"}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-400 text-xs font-black uppercase tracking-wider">
                  <FaCalendarAlt /> Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : "Recently"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Stats & Edit (Kept all original logic) */}
          <div className="flex flex-col gap-4 w-full md:w-80">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-100 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-1 justify-center mb-1">
                  <FaStar /> DharTrust
                </p>
                <p className="text-3xl font-black text-amber-600">{userData.karma || 0}</p>
              </div>
              <div className="bg-indigo-50 p-5 rounded-[2rem] border border-indigo-100 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-1 justify-center mb-1">
                  <FaAward /> Deals
                </p>
                <p className="text-3xl font-black text-indigo-600">{userData.totalDeals || 0}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.25em] transition-all hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-95 shadow-lg shadow-slate-200"
            >
              <FaEdit className="text-base" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* --- IMPACT GRID (Kept original logic & items) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { colorId: 'emerald', icon: <FaMoneyBillWave />, title: 'Money Saved', value: `৳${(userData.totalDeals || 0) * 500}`, sub: 'Community Savings' },
          { colorId: 'yellow', icon: <FaUsers />, title: 'Neighbors Helped', value: userData.totalDeals || 0, sub: 'Lives Touched' },
          { colorId: 'indigo', icon: <FaLeaf />, title: 'Eco Impact', value: `${userData.totalDeals || 0} Items`, sub: 'Saved from Waste' }
        ].map((stat, i) => {
          const theme = themeMap[stat.colorId];
          return (
            <div
              key={i}
              className={`${theme.bg} ${theme.border} ${theme.shadow} border p-10 rounded-[3rem] transition-all duration-500 hover:-translate-y-3 group cursor-default`}
            >
              <div className="flex items-center gap-5 mb-8">
                <div className={`${theme.iconBox} text-white p-5 rounded-[1.5rem] shadow-lg group-hover:rotate-12 transition-all duration-500`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <h4 className={`text-xs font-black uppercase tracking-[0.15em] ${theme.text}`}>{stat.title}</h4>
              </div>
              <p className={`text-5xl font-black tracking-tighter ${theme.value} mb-2`}>{stat.value}</p>
              <p className={`text-[10px] ${theme.sub} font-black uppercase tracking-[0.25em]`}>
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileHeader;