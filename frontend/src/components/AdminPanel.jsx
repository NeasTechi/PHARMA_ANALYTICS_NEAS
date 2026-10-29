import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminPanel({ products, onRefresh }) {
    const [form, setForm] = useState({
        product_key: products[0]?.product_key || '',
        quantity_sold: '',
        unit_price: '',
        discount_amount: '0',
        tax_amount: '0',
        cost_amount: '',
        date_key: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    })
    const [deleteKey, setDeleteKey] = useState('')
    const [msg, setMsg] = useState('')
    const [busy, setBusy] = useState(false)

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

    async function handleInsert(e) {
        e.preventDefault()
        setBusy(true)
        setMsg('')
        try {
            const qty = Number(form.quantity_sold)
            const price = Number(form.unit_price)
            const disc = Number(form.discount_amount || 0)
            const tax = Number(form.tax_amount || 0)
            const cost = Number(form.cost_amount || 0)
            const total = qty * price - disc + tax
            const profit = total - cost
            const { error } = await supabase.from('fact_sales').insert({
                date_key: Number(form.date_key),
                product_key: Number(form.product_key),
                quantity_sold: qty,
                unit_price: price,
                discount_amount: disc,
                tax_amount: tax,
                total_amount: Number(total.toFixed(2)),
                cost_amount: cost,
                profit_amount: Number(profit.toFixed(2)),
                transaction_id: `TXN-MANUAL-${Date.now()}`,
            })
            if (error) throw error
            setMsg('Row inserted successfully.')
            onRefresh()
        } catch (err) {
            setMsg('Error: ' + err.message)
        } finally {
            setBusy(false)
        }
    }

    async function handleDelete(e) {
        e.preventDefault()
        if (!deleteKey) return
        setBusy(true)
        setMsg('')
        try {
            const { error } = await supabase.from('fact_sales').delete().eq('sales_key', Number(deleteKey))
            if (error) throw error
            setMsg(`Deleted sales_key ${deleteKey}.`)
            setDeleteKey('')
            onRefresh()
        } catch (err) {
            setMsg('Error: ' + err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginTop: 0 }}>Admin: Manage Data</h2>
            {msg && <div style={{ marginBottom: '12px', color: msg.startsWith('Error') ? 'red' : 'green' }}>{msg}</div>}

            <form onSubmit={handleInsert} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <label>Product
                    <select value={form.product_key} onChange={(e) => set('product_key', e.target.value)} style={{ width: '100%' }}>
                        {products.map((p) => (
                            <option key={p.product_key} value={p.product_key}>{p.product_name} ({p.category})</option>
                        ))}
                    </select>
                </label>
                <label>Date (YYYYMMDD)
                    <input value={form.date_key} onChange={(e) => set('date_key', e.target.value)} required />
                </label>
                <label>Quantity sold
                    <input type="number" value={form.quantity_sold} onChange={(e) => set('quantity_sold', e.target.value)} required />
                </label>
                <label>Unit price
                    <input type="number" step="0.01" value={form.unit_price} onChange={(e) => set('unit_price', e.target.value)} required />
                </label>
                <label>Discount
                    <input type="number" step="0.01" value={form.discount_amount} onChange={(e) => set('discount_amount', e.target.value)} />
                </label>
                <label>Tax
                    <input type="number" step="0.01" value={form.tax_amount} onChange={(e) => set('tax_amount', e.target.value)} />
                </label>
                <label>Cost amount
                    <input type="number" step="0.01" value={form.cost_amount} onChange={(e) => set('cost_amount', e.target.value)} required />
                </label>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button type="submit" disabled={busy} style={{ padding: '8px 16px' }}>Add Sale Row</button>
                </div>
            </form>

            <form onSubmit={handleDelete} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                <label>Delete by sales_key
                    <input value={deleteKey} onChange={(e) => setDeleteKey(e.target.value)} />
                </label>
                <button type="submit" disabled={busy} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Delete
                </button>
            </form>
        </div>
    )
}