import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../hooks/useToast'

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
    const toast = useToast()

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

    async function handleInsert(e) {
        e.preventDefault()
        setBusy(true); setMsg('')
        try {
            const qty = Number(form.quantity_sold), price = Number(form.unit_price)
            const disc = Number(form.discount_amount || 0), tax = Number(form.tax_amount || 0)
            const cost = Number(form.cost_amount || 0)
            const total = qty * price - disc + tax
            const profit = total - cost
            const { error } = await supabase.from('fact_sales').insert({
                date_key: Number(form.date_key),
                product_key: Number(form.product_key),
                quantity_sold: qty, unit_price: price, discount_amount: disc, tax_amount: tax,
                total_amount: Number(total.toFixed(2)), cost_amount: cost,
                profit_amount: Number(profit.toFixed(2)),
                transaction_id: `TXN-MANUAL-${Date.now()}`,
            })
            if (error) throw error
            setMsg('Row inserted successfully.')
            toast('Row inserted successfully.')
            onRefresh()
        } catch (err) { setMsg('Error: ' + err.message); toast('Error: ' + err.message, 'error') }
        finally { setBusy(false) }
    }

    async function handleDelete(e) {
        e.preventDefault()
        if (!deleteKey) return
        setBusy(true); setMsg('')
        try {
            const { error } = await supabase.from('fact_sales').delete().eq('sales_key', Number(deleteKey))
            if (error) throw error
            setMsg(`Deleted sales_key ${deleteKey}.`)
            toast(`Deleted sales_key ${deleteKey}.`)
            setDeleteKey('')
            onRefresh()
        } catch (err) { setMsg('Error: ' + err.message); toast('Error: ' + err.message, 'error') }
        finally { setBusy(false) }
    }

    return (
        <div className="card p-6 space-y-6">
            <h2 className="text-xl font-bold">Manage Data</h2>
            {msg && <div className={`text-sm ${msg.startsWith('Error') ? 'text-red-500' : 'text-brand-600'}`}>{msg}</div>}

            <form onSubmit={handleInsert} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm font-medium">Product
                    <select value={form.product_key} onChange={(e) => set('product_key', e.target.value)} className="input w-full mt-1">
                        {products.map((p) => <option key={p.product_key} value={p.product_key}>{p.product_name} ({p.category})</option>)}
                    </select>
                </label>
                <label className="text-sm font-medium">Date (YYYYMMDD)
                    <input value={form.date_key} onChange={(e) => set('date_key', e.target.value)} required className="input w-full mt-1" />
                </label>
                <label className="text-sm font-medium">Quantity sold
                    <input type="number" value={form.quantity_sold} onChange={(e) => set('quantity_sold', e.target.value)} required className="input w-full mt-1" />
                </label>
                <label className="text-sm font-medium">Unit price
                    <input type="number" step="0.01" value={form.unit_price} onChange={(e) => set('unit_price', e.target.value)} required className="input w-full mt-1" />
                </label>
                <label className="text-sm font-medium">Discount
                    <input type="number" step="0.01" value={form.discount_amount} onChange={(e) => set('discount_amount', e.target.value)} className="input w-full mt-1" />
                </label>
                <label className="text-sm font-medium">Tax
                    <input type="number" step="0.01" value={form.tax_amount} onChange={(e) => set('tax_amount', e.target.value)} className="input w-full mt-1" />
                </label>
                <label className="text-sm font-medium">Cost amount
                    <input type="number" step="0.01" value={form.cost_amount} onChange={(e) => set('cost_amount', e.target.value)} required className="input w-full mt-1" />
                </label>
                <div className="flex items-end">
                    <button type="submit" disabled={busy} className="btn-primary w-full justify-center">Add Sale Row</button>
                </div>
            </form>

            <form onSubmit={handleDelete} className="flex gap-3 items-end pt-4 border-t border-gray-200 dark:border-gray-800">
                <label className="text-sm font-medium flex-1">Delete by sales_key
                    <input value={deleteKey} onChange={(e) => setDeleteKey(e.target.value)} className="input w-full mt-1" />
                </label>
                <button type="submit" disabled={busy} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">Delete</button>
            </form>
        </div>
    )
}