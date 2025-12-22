import React from 'react';
import { FaHandHoldingHeart, FaUserCircle, FaCheckCircle, FaBan } from 'react-icons/fa';

const IncomingRequests = ({ requests, handleApprove, handleReject, handleComplete }) => (
  <div className="space-y-4">
    <h2 className="font-bold text-slate-700 flex items-center gap-2 px-2 text-sm md:text-base"><FaHandHoldingHeart className="text-rose-500" /> Requests Received</h2>
    {requests.length === 0 ? <p className="text-slate-400 italic bg-white p-10 rounded-3xl text-center border-2 border-dashed text-sm">No requests yet.</p> :
      requests.map(req => (
        <div key={req._id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-indigo-100 transition">
          <div className="w-full">
            <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1">Item: {req.itemTitle}</h3>
            <p className="text-slate-900 text-sm font-black flex items-center gap-2"><FaUserCircle className="text-slate-400" /> {req.borrowerName || "Neighbor"}</p>
            <p className="text-indigo-600 text-xs font-bold mt-1">{req.borrowerEmail}</p>
            {req.borrowerPhone && (
              <a href={`https://wa.me/${req.borrowerPhone.replace(/\D/g, '')}?text=Hi, I am the owner of ${req.itemTitle} on DharLink!`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition">💬 Chat on WhatsApp</a>
            )}
            <p className="text-slate-500 italic text-sm mt-2 border-l-2 border-slate-100 pl-3">"{req.message}"</p>
          </div>
          <div className="w-full lg:w-auto">
            {req.status === 'pending' && (
              <div className="grid grid-cols-2 gap-2 w-full lg:w-48">
                <button onClick={() => handleApprove(req._id)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-sm shadow-indigo-200">Approve</button>
                <button onClick={() => handleReject(req._id)} className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl font-bold text-xs border border-rose-100">Reject</button>
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
);

export default IncomingRequests;