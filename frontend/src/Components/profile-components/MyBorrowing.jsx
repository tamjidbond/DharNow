import React from 'react';
import { FaBox } from 'react-icons/fa';

const MyBorrowing = ({ requests }) => (
  <div className="space-y-4">
    <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2 text-sm md:text-base"><FaBox className="text-indigo-600" /> My Borrowing</h2>
    {requests.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed text-sm">No requests found.</p> :
      requests.map(req => (
        <div key={req._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="min-w-0">
            <span className="font-bold text-slate-800 text-sm block truncate">{req.itemTitle}</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest truncate">Lender: {req.lenderName || req.lenderEmail}</p>
            {req.lenderPhone && (
              <a href={`https://wa.me/${req.lenderPhone.replace(/\D/g, '')}?text=Hi, I am interested in ${req.itemTitle}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold border border-emerald-100">💬 Chat with Owner</a>
            )}
          </div>
          <span className={`whitespace-nowrap font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest ${req.status === 'approved' ? 'bg-rose-100 text-rose-600' : req.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {req.status === 'approved' ? 'Ready for Pickup' : req.status}
          </span>
        </div>
      ))
    }
  </div>
);

export default MyBorrowing;