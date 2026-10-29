import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 1000

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
            // Paginate through all rows (Supabase caps at 1000 per request)
            let all = []
            let from = 0
            while (true) {
                const { data, error } = await supabase
                    .from('fact_sales')
                    .select('sales_key, date_key, total_amount, profit_amount, quantity_sold, dim_product(category, product_key, product_name)')
                    .order('sales_key', { ascending: true })
                    .range(from, from + PAGE_SIZE - 1)
                if (error) throw error
                if (!data || data.length === 0) break
                all = all.concat(data)
                setProgress(all.length)
                if (data.length < PAGE_SIZE) break
                from += PAGE_SIZE
            }
            setRows(all)

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
    return { rows, products, loading, error, progress, refresh: fetchData }
}