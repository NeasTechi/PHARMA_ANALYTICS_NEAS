import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSalesData } from './useSalesData'
import { supabase } from '../lib/supabaseClient'

vi.mock('../lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))

const data = {
    fact_sales: Array.from({ length: 2500 }, (_, i) => ({ sales_key: i + 1 })),
    dim_product: Array.from({ length: 1200 }, (_, i) => ({ product_key: i + 1 })),
}

function query(rows) {
    const q = {
        select: () => q,
        order: () => q,
        range: (from, to) => Promise.resolve({ data: rows.slice(from, to + 1), error: null }),
    }
    return q
}

describe('useSalesData', () => {
    beforeEach(() => {
        supabase.from.mockReset()
        supabase.from.mockImplementation((table) => query(data[table]))
    })

    it('loads every page of both tables, not just the first 1000', async () => {
        const { result } = renderHook(() => useSalesData())
        await waitFor(() => expect(result.current.loading).toBe(false))

        expect(result.current.rows).toHaveLength(2500)
        expect(result.current.products).toHaveLength(1200)
        expect(result.current.error).toBeNull()
    })
})
