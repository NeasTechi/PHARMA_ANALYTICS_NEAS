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
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginTop: 0 }}>Anomaly Detection</h2>
            {anomalies.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No anomalies detected with current thresholds.</p>
            ) : (
                <ul style={{ paddingLeft: '20px' }}>
                    {anomalies.map((a, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>
                            <strong>{a.month}</strong> — {a.reason} ({a.type})
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={handleExplain} disabled={loading} style={{ padding: '8px 16px', marginTop: '10px' }}>
                {loading ? 'Analyzing...' : 'Explain with AI'}
            </button>
            {explanation && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                    {explanation}
                </div>
            )}
        </div>
    )
}