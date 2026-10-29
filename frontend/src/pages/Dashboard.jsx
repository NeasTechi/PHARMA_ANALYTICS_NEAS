import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getSession, onAuthChange } from '../lib/auth'
import ChartsPanel from '../components/ChartsPanel'
import AdminPanel from '../components/AdminPanel'
import AnomalyPanel from '../components/AnomalyPanel'
import ChatPanel from '../components/ChatPanel'
import Login from './Login'
import { summarize } from '../lib/anomalies'

function parseDateKey(dk) {
    const y = Math.floor(dk / 10000)
    const m = Math.floor((dk % 10000) / 100)
    const d = dk % 100
    return new Date(y, m - 1, d)
}

export default function Dashboard() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [rows, setRows] = useState([])
    const [products, setProducts] = useState([])

    // filters
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [category, setCategory] = useState('All')

    useEffect(() => {
        getSession().then(setSession)
        const unsub = onAuthChange(setSession)
        return unsub
    }, [])

    async function fetchData() {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('fact_sales')
                .select('sales_key, date_key, total_amount, profit_amount, quantity_sold, dim_product(category, product_key, product_name)')
                .order('date_key', { ascending: true })
                .limit(10000)
            if (error) throw error
            setRows(data || [])

            const { data: prods } = await supabase.from('dim_product').select('*').order('product_key')
            setProducts(prods || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData()
    }, [])

    const categories = useMemo(() => ['All', ...Array.from(new Set(rows.map((r) => r.dim_product?.category).filter(Boolean)))], [rows])

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            const d = parseDateKey(r.date_key)
            if (startDate && d < new Date(startDate)) return false
            if (endDate && d > new Date(endDate)) return false
            if (category !== 'All' && r.dim_product?.category !== category) return false
            return true
        })
    }, [rows, startDate, endDate, category])

    const summary = summarize(filtered)

    function exportCsv() {
        const header = ['sales_key', 'date_key', 'category', 'total_amount', 'profit_amount', 'quantity_sold']
        const lines = [header.join(',')]
        filtered.forEach((r) => {
            lines.push([r.sales_key, r.date_key, r.dim_product?.category || '', r.total_amount, r.profit_amount, r.quantity_sold].join(','))
        })
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'pharma_sales.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return <div style={{ padding: '20px' }}>Loading Pharma Analytics...</div>
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>

    const isAdmin = !!session

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>Pharma Analytics Dashboard</h1>
                <Login session={session} onAuth={setSession} />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'end' }}>
                <label>From <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
                <label>To <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
                <label>Category
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </label>
                <button onClick={exportCsv} style={{ padding: '6px 12px' }}>Export CSV</button>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>{filtered.length} of {rows.length} rows</span>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Revenue', value: `₱ ${summary.revenue.toLocaleString()}`, bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1' },
                    { label: 'Total Profit', value: `₱ ${summary.profit.toLocaleString()}`, bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
                    { label: 'Items Sold', value: summary.items.toLocaleString(), bg: '#fefce8', border: '#fef08a', color: '#a16207' },
                    { label: 'Transactions', value: summary.count.toLocaleString(), bg: '#f5f3ff', border: '#ddd6fe', color: '#6d28d9' },
                ].map((c) => (
                    <div key={c.label} style={{ flex: 1, minWidth: '180px', padding: '20px', background: c.bg, borderRadius: '8px', border: `1px solid ${c.border}` }}>
                        <h3 style={{ margin: 0, color: c.color }}>{c.label}</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{c.value}</p>
                    </div>
                ))}
            </div>

            <ChartsPanel rows={filtered} />

            <div style={{ marginTop: '20px' }}>
                <AnomalyPanel rows={filtered} />
            </div>
            <div style={{ marginTop: '20px' }}>
                <ChatPanel rows={filtered} />
            </div>

            {isAdmin && (
                <div style={{ marginTop: '20px' }}>
                    <AdminPanel products={products} onRefresh={fetchData} />
                </div>
            )}
        </div>
    )
}