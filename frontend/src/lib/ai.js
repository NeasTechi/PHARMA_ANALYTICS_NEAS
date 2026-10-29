const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function explainAnomalies(summary, anomalies) {
    if (!OPENAI_KEY) {
        return 'OpenAI API key not configured. Add VITE_OPENAI_API_KEY to frontend/.env to enable AI explanations.'
    }
    const prompt = `You are a pharma sales analyst. Given the sales summary and detected anomalies, explain what changed, why it might matter, and suggest actions. Keep it concise (bullet points).

Summary: ${JSON.stringify(summary)}
Anomalies: ${JSON.stringify(anomalies)}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
        }),
    })
    if (!res.ok) {
        const t = await res.text()
        throw new Error(`OpenAI error: ${res.status} ${t}`)
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content || 'No explanation returned.'
}

export async function askData(question, summary) {
    if (!OPENAI_KEY) return 'OpenAI API key not configured.'
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a pharma analytics assistant. Answer using the provided summary. Be concise.' },
                { role: 'user', content: `Summary: ${JSON.stringify(summary)}\n\nQuestion: ${question}` },
            ],
            temperature: 0.4,
        }),
    })
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content || 'No answer.'
}