// Simple anomaly detection helpers for the pharma sales dashboard.

export function groupByMonth(rows) {
    const map = {}
    rows.forEach((r) => {
        const dk = r.date_key
        const key = `${Math.floor(dk / 10000)}-${String(Math.floor((dk % 10000) / 100)).padStart(2, '0')}`
        if (!map[key]) map[key] = { month: key, revenue: 0, profit: 0, items: 0, count: 0 }
        map[key].revenue += Number(r.total_amount || 0)
        map[key].profit += Number(r.profit_amount || 0)
        map[key].items += Number(r.quantity_sold || 0)
        map[key].count += 1
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
}

export function detectAnomalies(monthly) {
    if (monthly.length < 3) return []
    const revs = monthly.map((m) => m.revenue)
    const mean = revs.reduce((a, b) => a + b, 0) / revs.length
    const variance = revs.reduce((a, b) => a + (b - mean) ** 2, 0) / revs.length
    const std = Math.sqrt(variance) || 1

    const anomalies = []
    monthly.forEach((m, i) => {
        const z = (m.revenue - mean) / std
        if (Math.abs(z) >= 2) {
            anomalies.push({
                type: z > 0 ? 'spike' : 'drop',
                month: m.month,
                revenue: m.revenue,
                z: Number(z.toFixed(2)),
                reason: z > 0 ? 'Revenue far above average' : 'Revenue far below average',
            })
        }
        if (i > 0) {
            const prev = monthly[i - 1].revenue
            if (prev > 0) {
                const pct = ((m.revenue - prev) / prev) * 100
                if (Math.abs(pct) >= 30) {
                    anomalies.push({
                        type: pct > 0 ? 'mom-spike' : 'mom-drop',
                        month: m.month,
                        revenue: m.revenue,
                        pct: Number(pct.toFixed(1)),
                        reason: `Month-over-month change of ${pct.toFixed(1)}%`,
                    })
                }
            }
        }
    })
    // de-dup by month+type
    const seen = new Set()
    return anomalies.filter((a) => {
        const k = `${a.month}-${a.type}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
    })
}

export function summarize(rows) {
    let revenue = 0, profit = 0, items = 0
    rows.forEach((r) => {
        revenue += Number(r.total_amount || 0)
        profit += Number(r.profit_amount || 0)
        items += Number(r.quantity_sold || 0)
    })
    const byCat = {}
    rows.forEach((r) => {
        const c = r.dim_product?.category || 'Unknown'
        if (!byCat[c]) byCat[c] = { name: c, revenue: 0, profit: 0 }
        byCat[c].revenue += Number(r.total_amount || 0)
        byCat[c].profit += Number(r.profit_amount || 0)
    })
    return { revenue, profit, items, count: rows.length, byCategory: Object.values(byCat) }
}