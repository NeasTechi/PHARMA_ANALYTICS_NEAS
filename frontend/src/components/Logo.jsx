import { Activity } from 'lucide-react'

export default function Logo({ className = '' }) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                <Activity className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
                <div className="font-extrabold text-gray-900 dark:text-white tracking-tight">Pharma</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Analytics · NEAS</div>
            </div>
        </div>
    )
}