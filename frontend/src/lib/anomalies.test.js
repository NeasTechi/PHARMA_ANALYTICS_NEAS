import { describe, it, expect } from 'vitest'
import { groupByMonth, detectAnomalies, summarize } from './anomalies'

describe('groupByMonth', () => {
    it('groups rows by month', () => {
        const rows = [
            { date_key: 20240101, total_amount: 100, profit_amount: 40, quantity_sold: 2 },
            { date_key: 20240115, total_amount: 50, profit_amount: 20, quantity_sold: 1 },
            { date_key: 20240201, total_amount: 200, profit_amount: 80, quantity_sold: 4 },
        ]
        const out = groupByMonth(rows)
        expect(out).toHaveLength(2)
        expect(out[0].month).toBe('2024-01')
        expect(out[0].revenue).toBe(150)
        expect(out[1].month).toBe('2024-02')
        expect(out[1].revenue).toBe(200)
    })
})

describe('summarize', () => {
    it('computes totals and by category', () => {
        const rows = [
            { total_amount: 100, profit_amount: 40, quantity_sold: 2, dim_product: { category: 'A' } },
            { total_amount: 50, profit_amount: 20, quantity_sold: 1, dim_product: { category: 'B' } },
        ]
        const s = summarize(rows)
        expect(s.revenue).toBe(150)
        expect(s.profit).toBe(60)
        expect(s.items).toBe(3)
        expect(s.count).toBe(2)
        expect(s.byCategory).toHaveLength(2)
    })
})

describe('detectAnomalies', () => {
    it('returns empty for fewer than 3 months', () => {
        const monthly = [{ month: '2024-01', revenue: 100 }, { month: '2024-02', revenue: 110 }]
        expect(detectAnomalies(monthly)).toEqual([])
    })
    it('flags a spike', () => {
        const monthly = [
            { month: '2024-01', revenue: 100 },
            { month: '2024-02', revenue: 105 },
            { month: '2024-03', revenue: 1000 },
        ]
        const a = detectAnomalies(monthly)
        expect(a.length).toBeGreaterThan(0)
        expect(a.some((x) => x.month === '2024-03')).toBe(true)
    })
})