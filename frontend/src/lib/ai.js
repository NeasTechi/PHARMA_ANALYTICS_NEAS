import { supabase } from './supabaseClient'

export async function explainAnomalies(summary, anomalies) {
    const { data, error } = await supabase.functions.invoke('analyze', {
        body: { mode: 'explain', summary, anomalies },
    })
    if (error) throw new Error(error.message || 'Edge function error')
    return data?.result || 'No explanation returned.'
}

export async function askData(question, summary, rows) {
    // Extract a small sample (max 20 rows) from the row data
    // If question mentions a year, try to filter rows from that year
    let sampleRows = rows && rows.length > 0 ? [] : []

    const yearMatch = question.match(/\b(20|19)\d{2}\b/)
    if (yearMatch) {
        const targetYear = yearMatch[0]
        // Filter rows where date_key starts with the year (date_key format: YYYYMMDD)
        sampleRows = rows.filter((r) => {
            const dk = r.date_key
            return dk && String(dk).startsWith(targetYear)
        })
        // If no rows match that year, fall back to first 20
        if (sampleRows.length === 0) {
            sampleRows = rows.slice(0, 20)
        }
    } else {
        sampleRows = rows.slice(0, 20)
    }

    // Try to filter by product name if "product" is mentioned with a product name
    const productNameMatch = question.match(/product[^\n]*?([A-Za-z][A-Za-z0-9\s]{0,50})/i)
    if (productNameMatch) {
        const suggestedProduct = productNameMatch[1].trim()
        // Only filter if the suggested product looks like a real name (not just function words)
        if (suggestedProduct.length > 2) {
            sampleRows = sampleRows.filter((row) => {
                const pname = row.dim_product?.product_name || ''
                return pname.toString().toLowerCase().includes(suggestedProduct.toLowerCase())
            })
        }
    }

    // Try to filter by profit amount if question mentions "profit" or "more than"
    const profitMatch = question.match(/profit[^\n]*?([0-9]+)/i)
    if (profitMatch && !yearMatch) {
        const minProfit = parseInt(profitMatch[1])
        if (!isNaN(minProfit)) {
            sampleRows = sampleRows.filter((row) => {
                return (row.profit_amount || 0) >= minProfit
            })
        }
    }

    // Try to filter by category if the question mentions "category"
    if ((question || '').toLowerCase().includes('category')) {
        sampleRows = sampleRows.filter((row) => row.dim_product?.category != null)
    }

    // Format the sample as a string for the LLM
    const sampleText = "\nSample data rows (for reference, may not include all matching records):\n" + JSON.stringify(sampleRows, null, 2)

    const { data, error } = await supabase.functions.invoke('analyze', {
        body: { mode: 'ask', question, summary, sample: sampleText },
    })
    if (error) throw new Error(error.message || 'Edge function error')
    return data?.result || 'No answer.'
}