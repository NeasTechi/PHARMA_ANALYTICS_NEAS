export default function Logo({ className = '' }) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h4l3-9 4 18 3-9h4" />
                </svg>
            </div>
            <div className="leading-tight">
                <div className="font-extrabold text-gray-900 dark:text-white tracking-tight">Pharma</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Analytics · NEAS</div>
            </div>
        </div>
    )
}