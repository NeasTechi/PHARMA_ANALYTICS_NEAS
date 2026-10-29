import { useSalesData } from '../hooks/useSalesData'
import { Helmet } from 'react-helmet-async'
import AnomalyPanel from '../components/AnomalyPanel'
import ChatPanel from '../components/ChatPanel'

export default function Insights() {
    const { rows, loading, error, refresh } = useSalesData()
    if (loading) return <div className="text-gray-500">Loading...</div>
    if (error) return <div className="card p-8 text-center"><p className="text-red-500 mb-3">Error: {error}</p><button onClick={refresh} className="btn-primary">Retry</button></div>
    return (
        <div className="space-y-6">
            <Helmet>
                <title>AI Insights · Pharma Analytics</title>
                <meta name="description" content="Anomaly detection and AI-powered explanations for pharma sales." />
            </Helmet>
            <div>
                <h2 className="text-2xl font-bold">AI Insights</h2>
                <p className="text-gray-500 text-sm">Anomaly detection and natural-language Q&A</p>
            </div>
            <AnomalyPanel rows={rows} />
            <ChatPanel rows={rows} />
        </div>
    )
}