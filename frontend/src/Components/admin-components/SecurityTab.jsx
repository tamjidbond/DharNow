// src/components/admin-components/SecurityTab.jsx
import React from 'react';
import {
    FaUserSlash, FaExclamationTriangle, FaShieldAlt, FaMapMarkedAlt
} from 'react-icons/fa';

const SecurityTab = ({ intelligence }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">

            {/* LEFT COLUMN: THREAT DETECTION */}
            <div className="lg:col-span-2 bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5">
                <h3 className="text-2xl font-black mb-6 text-rose-500 flex items-center gap-3">
                    <FaUserSlash /> Behavioral Anomaly Detection
                </h3>

                <div className="space-y-4">
                    {intelligence.securityThreats.length === 0 ? (
                        <div className="text-center py-20 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                            <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm">
                                System Integrity Nominal: 0 Threats
                            </p>
                        </div>
                    ) : (
                        intelligence.securityThreats.map((u, idx) => (
                            <div key={idx} className="flex justify-between items-center p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500">
                                        <FaExclamationTriangle />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{u.name}</p>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase">{u.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-rose-500 font-black text-xl">{u.pendingCount}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Overdue Returns</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: SYSTEM STATS */}
            <div className="space-y-6">
                <div className="bg-indigo-600/10 p-8 rounded-[2.5rem] border border-indigo-500/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-indigo-400" /> Trust Ledger
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                        Autonomous monitoring of borrow-return cycles.
                    </p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[92%] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    </div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mt-4 tracking-widest">
                        Global Integrity: 92%
                    </p>
                </div>

                <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <FaMapMarkedAlt className="text-emerald-400" /> Area Clusters
                    </h3>
                    <p className="text-3xl font-black text-white">4 Active Nodes</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-2 font-bold tracking-tighter">
                        Banani • Dhanmondi • Gulshan • Uttara
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SecurityTab; // THIS LINE FIXES THE ERROR