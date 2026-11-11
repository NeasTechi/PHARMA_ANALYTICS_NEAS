import { useState } from 'react'
import { summarize } from '../lib/anomalies'
import { askData } from '../lib/ai'
import { supabase } from '../lib/supabaseClient'

export default function ChatPanel({ rows }) {
    const [q, setQ] = useState('')
    const [answer, setAnswer] = useState('')
    const [loading, setLoading] = useState(false)
    const summary = summarize(rows)

    // Fetch products and suppliers for AI filtering
    const [products, setProducts] = useState([])
    const [suppliers, setSuppliers] = useState([])

    // Fetch products and suppliers when rows change
    useEffect(() => {
        // Fetch products from dim_product
        supabase.from('dim_product').select('*').order('product_key').then(({ data }) => {
            setProducts(data || [])
        })
        // Fetch suppliers from dim_supplier
        supabase.from('dim_supplier').select('*').order('supplier_key').then(({ data }) => {
            setSuppliers(data || [])
        })
    }, [rows])

    async function handleAsk(e) {
        e.preventDefault()
        if (!q.trim()) return
        setLoading(true)
        try {
            const text = await askData(q, summary, rows, products, suppliers)
            setAnswer(text)
        } catch (err) {
            setAnswer('Error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Ask about your data</h2>
            <form onSubmit={handleAsk} className="flex gap-2 mb-4">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Which category grew most?" className="input flex-1" />
                <button type="submit" disabled={loading} className="btn-primary">{loading ? '...' : 'Ask'}</button>
            </form>
            {answer && <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{answer}</div>}
        </div>
    )
}