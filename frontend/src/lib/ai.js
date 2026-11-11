import { supabase } from './supabaseClient'

export async function explainAnomalies(summary, anomalies) {
    const { data, error } = await supabase.functions.invoke('analyze', {
        body: { mode: 'explain', summary, anomalies },
    })
    if (error) throw new Error(error.message || 'Edge function error')
    return data?.result || 'No explanation returned.'
}

export async function askData(question, summary, rows, products, suppliers) {
    let sampleRows = rows && rows.length > 0 ? [] : []

    const yearMatch = question.match(/\b(20|19)\d{2}\b/)
    if (yearMatch) {
        const targetYear = yearMatch[0]
        sampleRows = rows.filter((r) => {
            const dk = r.date_key
            return dk && String(dk).startsWith(targetYear)
        })
        if (sampleRows.length === 0) {
            sampleRows = rows.slice(0, 20)
        }
    } else {
        sampleRows = rows.slice(0, 20)
    }

    // Filter by product name using products array
    const productNameMatch = question.match(/product[^\n]*?([A-Za-z][A-Za-z0-9\s]{0,50})/i)
    if (productNameMatch && products) {
        const suggestedProduct = productNameMatch[1].trim()
        if (suggestedProduct.length > 2) {
            const productFilter = products.filter((p) =>
                (p.product_name || '').toString().toLowerCase().includes(suggestedProduct.toLowerCase())
            )
            if (productFilter.length > 0) {
                const productKeys = new Set(productFilter.map((p) => p.product_key))
                sampleRows = sampleRows.filter((row) => productKeys.has(row.product_key))
            }
        }
    }

    // Filter by profit
    const profitMatch = question.match(/profit[^\n]*?([0-9]+)/i)
    if (profitMatch && !yearMatch) {
        const minProfit = parseInt(profitMatch[1])
        if (!isNaN(minProfit)) {
            sampleRows = sampleRows.filter((row) => (row.profit_amount || 0) >= minProfit)
        }
    }

    // Filter by pharmacy name
    const pharmacyMatch = question.match(/pharmacy[^\n]*?([A-Za-z][A-Za-z0-9\s]{0,50})/i)
    if (pharmacyMatch) {
        const suggestedPharmacy = pharmacyMatch[1].trim()
        if (suggestedPharmacy.length > 2) {
            sampleRows = sampleRows.filter((row) => {
                const pname = row.pharmacy_name || ''
                return pname.toString().toLowerCase().includes(suggestedPharmacy.toLowerCase())
            })
        }
    }

    // Filter by supplier name using suppliers array
    const supplierMatch = question.match(/supplier[^\n]*?([A-Za-z][A-Za-z0-9\s]{0,50})/i)
    if (supplierMatch && suppliers) {
        const suggestedSupplier = supplierMatch[1].trim()
        if (suggestedSupplier.length > 2) {
            sampleRows = sampleRows.filter((row) => {
                const sname = suppliers.find((s) => s.supplier_key === row.supplier_key)?.supplier_name || ''
                return sname.toString().toLowerCase().includes(suggestedSupplier.toLowerCase())
            })
        }
    }

    // Filter by category
    if ((question || '').toLowerCase().includes('category')) {
        sampleRows = sampleRows.filter((row) => row.dim_product?.category != null)
    }

    // Add references to product/supplier names for AI context
    const productRef = products && products.length > 0
        ? 'Product references: ' + products.slice(0, 5).map(p => p.product_name).join(', ')
        : ''
    const supplierRef = suppliers && suppliers.length > 0
        ? 'Supplier references: ' + suppliers.slice(0, 5).map(s => s.supplier_name).join(', ')
        : ''

    const sampleText = "\nSample data rows (for reference, may not include all matching records):\n" + JSON.stringify(sampleRows, null, 2) + "\n" + productRef + "\n" + supplierRef

    const { data, error } = await supabase.functions.invoke('analyze', {
        body: { mode: 'ask', question, summary, sample: sampleText },
    })
    if (error) throw new Error(error.message || 'Edge function error')
    return data?.result || 'No answer.'
}