import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { groupByMonth, summarize } from '../lib/anomalies'

const COLORS = ['#2563eb', '#10b981', '#60a5fa', '#34d399', '#1d4ed8', '#059669', '#93c5fd']

const tooltipStyle = {
    contentStyle: { borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    cursor: { fill: 'rgba(20,184,166,0.08)' },
}

export default function ChartsPanel({ rows }) {
    const [tab, setTab] = useState('bar')
    const summary = summarize(rows)
    const monthly = groupByMonth(rows)

    const tabs = [
        { id: 'bar', label: 'Bar' },
        { id: 'line', label: 'Line' },
        { id: 'pie', label: 'Pie' },
    ]

    if (rows.length === 0) {
        return <div className="flex items-center justify-center h-64 text-gray-400">No data for selected filters</div>
    }

    return (
        <div>
            <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800 mb-4">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
                            tab === t.id ? 'bg-white dark:bg-gray-700 text-brand-700 dark:text-brand-300 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="h-[260px] sm:h-[320px] md:h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {tab === 'bar' && (
                        <BarChart data={summary.byCategory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={6}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip {...tooltipStyle} formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    )}
                    {tab === 'line' && (
                        <LineChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip {...tooltipStyle} formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                            <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                        </LineChart>
                    )}
                    {tab === 'pie' && (
                        <PieChart>
                            <Pie data={summary.byCategory} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} label>
                                {summary.byCategory.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyle} formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    )
}