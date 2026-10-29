import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useSalesData } from '../hooks/useSalesData'
import { summarize, groupByMonth, detectAnomalies } from '../lib/anomalies'

function Kpi({ label, value, accent, hint, delta }) {
    return (
        <div className="card p-5 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${accent} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">{value}</p>
            <div className="flex items-center gap-2 mt-1">
                {delta !== null && delta !== undefined && (
                    <span className={`text-xs font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
                    </span>
                )}
                {hint && <p className="text-xs text-gray-400">{hint}</p>}
            </div>
        </div>
    )
}

export default function Overview() {
    const { rows, loading, error, progress, refresh } = useSalesData()
    const summary = summarize(rows)
    const monthly = groupByMonth(rows)
    const last = monthly[monthly.length - 1]
    const prev = monthly[monthly.length - 2]
    const revDelta = prev && prev.revenue ? ((last.revenue - prev.revenue) / prev.revenue) * 100 : null
    const profitDelta = prev && prev.profit ? ((last.profit - prev.profit) / prev.profit) * 100 : null
    const anomalies = detectAnomalies(monthly)

    if (loading) return <Skeleton progress={progress} />
    if (error) return (
        <div className="card p-8 text-center">
            <p className="text-red-500 mb-3">Error: {error}</p>
            <button onClick={refresh} className="btn-primary">Retry</button>
        </div>
    )

    const recent = [...rows].sort((a, b) => b.sales_key - a.sales_key).slice(0, 8)
    const topProducts = Object.values(rows.reduce((acc, r) => {
        const name = r.dim_product?.product_name || 'Unknown'
        if (!acc[name]) acc[name] = { name, revenue: 0, qty: 0 }
        acc[name].revenue += Number(r.total_amount || 0)
        acc[name].qty += Number(r.quantity_sold || 0)
        return acc
    }, {})).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    const cards = [
        { label: 'Total Revenue', value: `₱ ${summary.revenue.toLocaleString()}`, accent: 'bg-brand-500', hint: `${summary.count} transactions`, delta: revDelta },
        { label: 'Total Profit', value: `₱ ${summary.profit.toLocaleString()}`, accent: 'bg-accent-500', hint: `${((summary.profit / (summary.revenue || 1)) * 100).toFixed(1)}% margin`, delta: profitDelta },
        { label: 'Items Sold', value: summary.items.toLocaleString(), accent: 'bg-brand-300', hint: 'units moved', delta: null },
        { label: 'Avg. Order Value', value: `₱ ${(summary.revenue / (summary.count || 1)).toFixed(2)}`, accent: 'bg-accent-300', hint: 'per transaction', delta: null },
    ]

    return (
        <main className="space-y-6 animate-slide-up">
            <Helmet>
                <title>Overview · Pharma Analytics</title>
                <meta name="description" content="Pharma sales overview — revenue, profit, items sold, and top categories." />
                <meta property="og:title" content="Pharma Analytics — Overview" />
                <meta property="og:description" content="Track pharma sales performance, revenue, and profit at a glance." />
            </Helmet>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Pharma sales performance at a glance</p>
                </div>
                <div className="text-xs text-gray-400">Last updated · live</div>
            </div>

            {anomalies.length > 0 && (
                <div className="card p-4 flex items-center justify-between gap-3 border-l-4 border-amber-400">
                    <div>
                        <p className="font-semibold text-sm">⚠️ {anomalies.length} anomal{anomalies.length > 1 ? 'ies' : 'y'} detected</p>
                        <p className="text-xs text-gray-500">Review AI Insights for details and recommendations.</p>
                    </div>
                    <Link to="/insights" className="btn-primary text-xs">View insights</Link>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map((c) => <Kpi key={c.label} {...c} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg">Recent Transactions</h2>
                        <Link to="/analytics" className="text-xs text-brand-600 hover:underline">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th className="py-2 pr-4">ID</th>
                                    <th className="py-2 pr-4">Date</th>
                                    <th className="py-2 pr-4">Category</th>
                                    <th className="py-2 pr-4 text-right">Amount</th>
                                    <th className="py-2 text-right">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((r) => (
                                    <tr key={r.sales_key} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-2 pr-4 font-mono text-xs">#{r.sales_key}</td>
                                        <td className="py-2 pr-4 text-gray-500">{r.date_key}</td>
                                        <td className="py-2 pr-4">{r.dim_product?.category || '—'}</td>
                                        <td className="py-2 pr-4 text-right font-semibold">₱ {Number(r.total_amount).toLocaleString()}</td>
                                        <td className="py-2 text-right text-gray-500">{r.quantity_sold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card p-6">
                    <h2 className="font-bold text-lg mb-4">Top Products</h2>
                    <ul className="space-y-3">
                        {topProducts.map((p, i) => (
                            <li key={p.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    <span className="text-sm font-medium truncate max-w-[140px]">{p.name}</span>
                                </div>
                                <span className="text-sm font-semibold">₱ {p.revenue.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card p-6 flex flex-wrap gap-3">
                <Link to="/analytics" className="btn-primary">View Analytics</Link>
                <Link to="/insights" className="btn-ghost border border-gray-200 dark:border-gray-700">Ask AI</Link>
                <Link to="/data" className="btn-ghost border border-gray-200 dark:border-gray-700">Manage Data</Link>
            </div>
        </main>
    )
}

function Skeleton({ progress }) {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="text-sm text-gray-500">Loading rows... {progress}</div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28" />)}
            </div>
            <div className="card h-64" />
        </div>
    )
}