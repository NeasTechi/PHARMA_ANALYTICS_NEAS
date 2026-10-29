import { useState } from 'react'
import { detectAnomalies, groupByMonth, summarize } from '../lib/anomalies'
import { explainAnomalies } from '../lib/ai'

export default function AnomalyPanel({ rows }) {
    const [explanation, setExplanation] = useState('')
    const [loading, setLoading] = useState(false)
    const monthly = groupByMonth(rows)
    const anomalies = detectAnomalies(monthly)
    const summary = summarize(rows)

    async function handleExplain() {
        setLoading(true)
        try {
            const text = await explainAnomalies(summary, anomalies)
            setExplanation(text)
        } catch (err) {
            setExplanation('Error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Anomaly Detection</h2>
            {anomalies.length === 0 ? (
                <p className="text-gray-500 text-sm">No anomalies detected with current thresholds.</p>
            ) : (
                <ul className="space-y-2 mb-4">
                    {anomalies.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                            <span className={`mt-0.5 w-2 h-2 rounded-full ${a.type.includes('spike') ? 'bg-accent-500' : 'bg-red-500'}`} />
                            <span><strong>{a.month}</strong> — {a.reason} <span className="text-gray-400">({a.type})</span></span>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={handleExplain} disabled={loading} className="btn-primary">{loading ? 'Analyzing...' : 'Explain with AI'}</button>
            {explanation && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{explanation}</div>
            )}
        </div>
    )
}