import { useSalesData } from '../hooks/useSalesData'
import ChartsPanel from '../components/ChartsPanel'
import { summarize } from '../lib/anomalies'

function Kpi({ label, value, accent, hint }) {
    return (
        <div className="card p-5 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${accent} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">{value}</p>
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    )
}

export default function Overview() {
    const { rows, loading, error } = useSalesData()
    const summary = summarize(rows)

    if (loading) return <Skeleton />
    if (error) return <div className="text-red-500">Error: {error}</div>

    const cards = [
        { label: 'Total Revenue', value: `₱ ${summary.revenue.toLocaleString()}`, accent: 'bg-brand-500', hint: `${summary.count} transactions` },
        { label: 'Total Profit', value: `₱ ${summary.profit.toLocaleString()}`, accent: 'bg-accent-500', hint: `${((summary.profit / (summary.revenue || 1)) * 100).toFixed(1)}% margin` },
        { label: 'Items Sold', value: summary.items.toLocaleString(), accent: 'bg-brand-300', hint: 'units moved' },
        { label: 'Avg. Order Value', value: `₱ ${(summary.revenue / (summary.count || 1)).toFixed(2)}`, accent: 'bg-accent-300', hint: 'per transaction' },
    ]

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Overview</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Pharma sales performance at a glance</p>
                </div>
                <div className="text-xs text-gray-400">Last updated · live</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map((c) => <Kpi key={c.label} {...c} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Revenue by Category</h3>
                        <span className="text-xs text-gray-400">Bar view</span>
                    </div>
                    <ChartsPanel rows={rows} />
                </div>
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Top Categories</h3>
                    <ul className="space-y-3">
                        {summary.byCategory.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((c, i) => (
                            <li key={c.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    <span className="text-sm font-medium">{c.name}</span>
                                </div>
                                <span className="text-sm font-semibold">₱ {c.revenue.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function Skeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28" />)}
            </div>
            <div className="card h-96" />
        </div>
    )
}