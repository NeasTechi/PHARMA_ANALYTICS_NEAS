import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [metrics, setMetrics] = useState({ revenue: 0, profit: 0, items: 0 })
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch sales and join with the product table to get the category
                const { data, error } = await supabase
                    .from('fact_sales')
                    .select(`
            total_amount, 
            profit_amount, 
            quantity_sold,
            dim_product (category)
          `)

                if (error) throw error

                // 1. Calculate Dashboard Totals
                let totalRevenue = 0
                let totalProfit = 0
                let totalItems = 0
                const categoryMap = {}

                data.forEach(row => {
                    totalRevenue += Number(row.total_amount || 0)
                    totalProfit += Number(row.profit_amount || 0)
                    totalItems += Number(row.quantity_sold || 0)

                    // 2. Group Data by Product Category for the Chart
                    const categoryName = row.dim_product?.category || 'Unknown'
                    if (!categoryMap[categoryName]) {
                        categoryMap[categoryName] = { name: categoryName, revenue: 0, profit: 0 }
                    }
                    categoryMap[categoryName].revenue += Number(row.total_amount || 0)
                    categoryMap[categoryName].profit += Number(row.profit_amount || 0)
                })

                setMetrics({ revenue: totalRevenue, profit: totalProfit, items: totalItems })
                setChartData(Object.values(categoryMap))

            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) return <div style={{ padding: '20px' }}>Loading Pharma Analytics...</div>
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Pharma Analytics Dashboard</h1>

            {/* Top Metric Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={{ flex: 1, padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <h3 style={{ margin: 0, color: '#0369a1' }}>Total Revenue</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                        ₱ {metrics.revenue.toLocaleString()}
                    </p>
                </div>
                <div style={{ flex: 1, padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <h3 style={{ margin: 0, color: '#15803d' }}>Total Profit</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                        ₱ {metrics.profit.toLocaleString()}
                    </p>
                </div>
                <div style={{ flex: 1, padding: '20px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
                    <h3 style={{ margin: 0, color: '#a16207' }}>Items Sold</h3>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                        {metrics.items.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Bar Chart */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h2 style={{ marginTop: 0 }}>Revenue by Product Category</h2>
                <div style={{ height: '400px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}