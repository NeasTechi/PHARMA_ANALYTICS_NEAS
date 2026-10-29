import { supabase } from './supabaseClient'

export async function explainAnomalies(summary, anomalies) {
    const { data, error } = await supabase.functions.invoke('analyze', {
        body: { mode: 'explain', summary, anomalies },
    })
    if (error) throw new Error(error.message || 'Edge function error')
    return data?.result || 'No explanation returned.'
}

export async function askData(question, summary) {
    const { data, error } = await supabase.functions.invoke('analyze', {
        body: { mode: 'ask', question, summary },
    })
    if (error) throw new Error(error.message || 'Edge function error')
    return data?.result || 'No answer.'
}