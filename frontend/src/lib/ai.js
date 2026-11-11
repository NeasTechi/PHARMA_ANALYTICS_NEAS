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
    let sampleRows = rows && rows.length > 0 ? rows.slice(0, 20) : [];

    // Try to filter by category if the question mentions "category" or "product"
    if ((question || '').toLowerCase().includes('category') || (question || '').toLowerCase().includes('product')) {
        sampleRows = sampleRows.filter((row) => row.dim_product?.category != null);
    }

    // Format the sample as a string for the LLM
    const sampleText = "\nSample data rows (for reference, may not include all matching records):\n" + JSON.stringify(sampleRows, null, 2);

    const { data, error } = await supabase.functions.invoke('analyze', {
        body: { mode: 'ask', question, summary, sample: sampleText },
    })
    if (error) throw new Error(error.message || 'Edge function error')
    return data?.result || 'No answer.'
}