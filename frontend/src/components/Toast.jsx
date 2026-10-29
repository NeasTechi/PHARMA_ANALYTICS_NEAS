import { useCallback, useState } from 'react'
import { ToastContext } from '../lib/toastContext'

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const show = useCallback((message, type = 'success') => {
        const id = Date.now()
        setToasts((t) => [...t, { id, message, type }])
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
    }, [])
    return (
        <ToastContext.Provider value={show}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-slide-up ${
                            t.type === 'error' ? 'bg-red-500' : 'bg-brand-600'
                        }`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}