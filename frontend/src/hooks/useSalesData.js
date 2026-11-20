import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 1000
const SALES_SELECT = 'sales_key, date_key, total_amount, profit_amount, quantity_sold, pharmacy_name, supplier_key, dim_product(category, product_key, product_name, strength, manufacturer)'

// Supabase caps a response at 1000 rows, so page through the whole table.
export async function fetchAll(table, select, order, onPage) {
    let all = []
    let from = 0
    while (true) {
        const { data, error } = await supabase
            .from(table)
            .select(select)
            .order(order, { ascending: true })
            .range(from, from + PAGE_SIZE - 1)
        if (error) throw error
        if (!data || data.length === 0) break
        all = all.concat(data)
        onPage?.(all.length)
        if (data.length < PAGE_SIZE) break
        from += PAGE_SIZE
    }
    return all
}

export function useSalesData() {
    const [rows, setRows] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [progress, setProgress] = useState(0)

    async function fetchData() {
        setLoading(true)
        setError(null)
        setProgress(0)
        try {
            setRows(await fetchAll('fact_sales', SALES_SELECT, 'sales_key', setProgress))
            setProducts(await fetchAll('dim_product', '*', 'product_key'))
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
    return { rows, products, loading, error, progress, refresh: fetchData }
}
