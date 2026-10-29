
import { useSalesData } from '../hooks/useSalesData'
import ChartsPanel from '../components/ChartsPanel'
import { summarize } from '../lib/anomalies'

export default function Overview() {
    const { rows, loading, error } = useSalesData()
    const summary = summarize(rows)

    if (loading) return <div className="text-gray-500">Loading...</div>
    if (error) return <div className="text-red-500">Error: {error}</div>

    const cards = [
        { label: 'Total Revenue', value: `₱ ${summary.revenue.toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Total Profit', value: `₱ ${summary.profit.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Items Sold', value: summary.items.toLocaleString(), color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Transactions', value: summary.count.toLocaleString(), color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Overview</h2>
                <p className="text-gray-500 text-sm">Pharma sales performance at a glance</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c) => (
                    <div key={c.label} className={`rounded-xl p-5 border border-gray-200 dark:border-gray-700 ${c.bg}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>
            <ChartsPanel rows={rows} />
        </div>
    )
}