// src/components/admin-components/AnalyticsTab.jsx
import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { FaChartLine, FaChartPie } from 'react-icons/fa';

const AnalyticsTab = ({ intelligence, COLORS }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">

            {/* AREA CHART: GROWTH */}
            <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FaChartLine className="text-indigo-400" /> Listing Velocity (Real)
                </h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={intelligence.growthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                            <Area
                                type="monotone"
                                dataKey="items"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                strokeWidth={4}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* PIE CHART: CATEGORIES */}
            <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FaChartPie className="text-indigo-400" /> Community Supply Mix
                </h3>
                <div className="h-[350px] flex flex-col md:flex-row items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={intelligence.categoryData}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {intelligence.categoryData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* LEGEND LIST */}
                    <div className="space-y-3 w-full md:w-48 max-h-[300px] overflow-y-auto pr-2">
                        {intelligence.categoryData.map((c, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{c.name}</span>
                                </div>
                                <span className="text-xs font-black">{c.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AnalyticsTab;