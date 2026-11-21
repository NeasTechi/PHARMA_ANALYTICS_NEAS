import { useState } from 'react'
import { summarize } from '../lib/anomalies'
import { askData } from '../lib/ai'

export function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export function renderAnswer(text) {
    const lines = text.split('\n')
    const out = []
    let i = 0
    while (i < lines.length) {
        if (/^\s*\|/.test(lines[i]) && lines[i].includes('|')) {
            const rows = []
            while (i < lines.length && /^\s*\|/.test(lines[i]) && lines[i].includes('|')) {
                const cells = lines[i].split('|').slice(1, -1).map(c => escapeHtml(c.trim()))
                if (!/^[\s\-:|]+$/.test(lines[i])) rows.push(cells)
                i++
            }
            if (rows.length > 0) {
                out.push(
                    <table key={i} className="min-w-full border border-gray-300 text-left mt-3 mb-3 text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b dark:bg-gray-700">
                                {rows[0].map((c, k) => <th key={k} className="border px-2 py-1 font-medium">{c}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.slice(1).map((row, r) => (
                                <tr key={r} className="border-b dark:border-gray-600">
                                    {row.map((c, k) => <td key={k} className="border px-2 py-1">{c}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        } else {
            out.push(<div key={i} className="mb-1 whitespace-pre-wrap">{escapeHtml(lines[i])}</div>)
            i++
        }
    }
    return out
}

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
        <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Ask about your data</h2>
            <form onSubmit={handleAsk} className="flex gap-2 mb-4">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Which category grew most?" className="input flex-1" />
                <button type="submit" disabled={loading} className="btn-primary">{loading ? '...' : 'Ask'}</button>
            </form>
            {answer && <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm leading-relaxed">{renderAnswer(answer)}</div>}
        </div>
    )
}