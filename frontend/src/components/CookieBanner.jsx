import { useEffect, useState } from 'react'

export default function CookieBanner() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!localStorage.getItem('cookie-consent')) setShow(true)
    }, [])

    if (!show) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p className="text-gray-600 dark:text-gray-300">
                We use local storage for preferences and session. No tracking cookies. See our{' '}
                <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>.
            </p>
            <button
                onClick={() => { localStorage.setItem('cookie-consent', '1'); setShow(false) }}
                className="btn-primary text-xs"
            >
                Got it
            </button>
        </div>
    )
}