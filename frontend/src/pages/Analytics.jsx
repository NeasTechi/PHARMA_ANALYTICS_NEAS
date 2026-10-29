import { useMemo, useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useSalesData } from '../hooks/useSalesData'
import ChartsPanel from '../components/ChartsPanel'

function parseDateKey(dk) {
    const y = Math.floor(dk / 10000)
    const m = Math.floor((dk % 10000) / 100)
    const d = dk % 100
    return new Date(y, m - 1, d)
}

export default function Analytics() {
    const { rows, loading, error, refresh } = useSalesData()
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [category, setCategory] = useState('All')
    const containerRef = useRef(null)

    async function exportPdf() {
        if (!containerRef.current) return
        const canvas = await html2canvas(containerRef.current, { scale: 2 })
        const img = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const w = pdf.internal.pageSize.getWidth()
        const h = (canvas.height * w) / canvas.width
        pdf.addImage(img, 'PNG', 0, 0, w, h)
        pdf.save('pharma_analytics.pdf')
    }

    function preset(days) {
        const end = new Date()
        const start = new Date()
        if (days === 'year') start.setMonth(0, 1)
        else start.setDate(end.getDate() - days)
        setStartDate(start.toISOString().slice(0, 10))
        setEndDate(end.toISOString().slice(0, 10))
    }

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
    if (error) return <div className="card p-8 text-center"><p className="text-red-500 mb-3">Error: {error}</p><button onClick={refresh} className="btn-primary">Retry</button></div>

    return (
        <div ref={containerRef} className="space-y-6">
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight">Analytics</h2>
                <p className="text-gray-500 text-sm">Filter and explore sales trends</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button onClick={() => preset(7)} className="btn-ghost text-xs">Last 7d</button>
                    <button onClick={() => preset(30)} className="btn-ghost text-xs">Last 30d</button>
                    <button onClick={() => preset('year')} className="btn-ghost text-xs">This year</button>
                    <button onClick={() => { setStartDate(''); setEndDate('') }} className="btn-ghost text-xs">All</button>
                </div>
                <label className="text-sm w-full sm:w-auto">From <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 w-full sm:w-auto" /></label>
                <label className="text-sm w-full sm:w-auto">To <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 w-full sm:w-auto" /></label>
                <label className="text-sm w-full sm:w-auto">Category
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="block mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 w-full sm:w-auto">
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </label>
                <button onClick={exportCsv} className="btn-primary">Export CSV</button>
                <button onClick={exportPdf} className="btn-ghost border border-gray-200 dark:border-gray-700">Export PDF</button>
                <span className="text-sm text-gray-500">{filtered.length} of {rows.length} rows</span>
            </div>
            <ChartsPanel rows={filtered} />
        </div>
    )
}