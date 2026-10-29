import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { groupByMonth, summarize } from '../lib/anomalies'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export default function ChartsPanel({ rows }) {
    const [tab, setTab] = useState('bar')
    const summary = summarize(rows)
    const monthly = groupByMonth(rows)

    const tabStyle = (active) => ({
        padding: '8px 16px',
        border: 'none',
        borderBottom: active ? '3px solid #3b82f6' : '3px solid transparent',
        background: 'transparent',
        cursor: 'pointer',
        fontWeight: active ? 700 : 400,
        color: active ? '#3b82f6' : '#374151',
    })

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <button style={tabStyle(tab === 'bar')} onClick={() => setTab('bar')}>Bar</button>
                <button style={tabStyle(tab === 'line')} onClick={() => setTab('line')}>Line</button>
                <button style={tabStyle(tab === 'pie')} onClick={() => setTab('pie')}>Pie</button>
            </div>

            <div style={{ height: '400px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {tab === 'bar' && (
                        <BarChart data={summary.byCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                    {tab === 'line' && (
                        <LineChart data={monthly} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    )}
                    {tab === 'pie' && (
                        <PieChart>
                            <Pie data={summary.byCategory} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={140} label>
                                {summary.byCategory.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    )
}