import { useSalesData } from '../hooks/useSalesData'
import AnomalyPanel from '../components/AnomalyPanel'
import ChatPanel from '../components/ChatPanel'

export default function Insights() {
    const { rows, loading, error } = useSalesData()
    if (loading) return <div className="text-gray-500">Loading...</div>
    if (error) return <div className="text-red-500">Error: {error}</div>
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">AI Insights</h2>
                <p className="text-gray-500 text-sm">Anomaly detection and natural-language Q&A</p>
            </div>
            <AnomalyPanel rows={rows} />
            <ChatPanel rows={rows} />
        </div>
    )
}