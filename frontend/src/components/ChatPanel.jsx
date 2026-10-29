import { useState } from 'react'
import { summarize } from '../lib/anomalies'
import { askData } from '../lib/ai'

export default function ChatPanel({ rows }) {
    const [q, setQ] = useState('')
    const [answer, setAnswer] = useState('')
    const [loading, setLoading] = useState(false)
    const summary = summarize(rows)

    async function handleAsk(e) {
        e.preventDefault()
        if (!q.trim()) return
        setLoading(true)
        try {
            const text = await askData(q, summary)
            setAnswer(text)
        } catch (err) {
            setAnswer('Error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginTop: 0 }}>Ask about your data</h2>
            <form onSubmit={handleAsk} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Which category grew most?" style={{ flex: 1, padding: '8px' }} />
                <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>{loading ? '...' : 'Ask'}</button>
            </form>
            {answer && <div style={{ whiteSpace: 'pre-wrap', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>{answer}</div>}
        </div>
    )
}