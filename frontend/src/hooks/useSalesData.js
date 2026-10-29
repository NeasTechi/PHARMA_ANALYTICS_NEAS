import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSalesData() {
    const [rows, setRows] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    async function fetchData() {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('fact_sales')
                .select('sales_key, date_key, total_amount, profit_amount, quantity_sold, dim_product(category, product_key, product_name)')
                .order('date_key', { ascending: true })
                .limit(1000)
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
    return { rows, products, loading, error, refresh: fetchData }
}