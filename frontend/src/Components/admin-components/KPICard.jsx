import { FaArrowUp } from 'react-icons/fa';
export const KPICard = ({ label, value, trend, color }) => (
  <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md group transition-all hover:border-white/20">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
    <div className="flex justify-between items-end">
      <h2 className="text-4xl font-black text-white tracking-tighter">{value}</h2>
      <span className={`text-${color}-400 text-xs font-black flex items-center gap-1 bg-${color}-400/10 px-2 py-1 rounded-lg`}>
        <FaArrowUp className="text-[8px]" /> {trend}
      </span>
    </div>
  </div>
);