import { useMemo, useState } from 'react'
import { useSalesData } from '../hooks/useSalesData'
import ChartsPanel from '../components/ChartsPanel'

function parseDateKey(dk) {
    const y = Math.floor(dk / 10000)
    const m = Math.floor((dk % 10000) / 100)
    const d = dk % 100
    return new Date(y, m - 1, d)
}

export default function Analytics() {
    const { rows, loading, error } = useSalesData()
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [category, setCategory] = useState('All')

    const categories = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.dim_product?.category).filter(Boolean)))], [rows])

    const filtered = useMemo(() => rows.filter((r) => {
        const d = parseDateKey(r.date_key)
        if (startDate && d < new Date(startDate)) return false
        if (endDate && d > new Date(endDate)) return false
        if (category !== 'All' && r.dim_product?.category !== category) return false
        return true
    }), [rows, startDate, endDate, category])

    function exportCsv() {
        const header = ['sales_key', 'date_key', 'category', 'total_amount', 'profit_amount', 'quantity_sold']
        const lines = [header.join(',')]
        filtered.forEach((r) => lines.push([r.sales_key, r.date_key, r.dim_product?.category || '', r.total_amount, r.profit_amount, r.quantity_sold].join(',')))
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'pharma_sales.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return <div className="text-gray-500">Loading...</div>
    if (error) return <div className="text-red-500">Error: {error}</div>

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight">Analytics</h2>
                <p className="text-gray-500 text-sm">Filter and explore sales trends</p>
            </div>
            <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="text-sm">From <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></label>
                <label className="text-sm">To <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" /></label>
                <label className="text-sm">Category
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="block mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </label>
                <button onClick={exportCsv} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Export CSV</button>
                <span className="text-sm text-gray-500">{filtered.length} of {rows.length} rows</span>
            </div>
            <ChartsPanel rows={filtered} />
        </div>
    )
}