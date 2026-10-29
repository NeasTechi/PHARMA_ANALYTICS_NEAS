import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getSession, onAuthChange, signOut } from './lib/auth'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'

const Overview = lazy(() => import('./pages/Overview'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Insights = lazy(() => import('./pages/Insights'))
const DataManagement = lazy(() => import('./pages/DataManagement'))

function PageLoader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full" />
        </div>
    )
}

export default function App() {
    const [session, setSession] = useState(null)

    useEffect(() => {
        getSession().then(setSession)
        const unsub = onAuthChange(setSession)
        return unsub
    }, [])

    async function handleAuth() {
        if (session) {
            await signOut()
            setSession(null)
        }
    }

    return (
        <ToastProvider>
        <Routes>
            <Route element={<Layout session={session} onAuth={handleAuth} />}>
                <Route index element={<Suspense fallback={<PageLoader />}><Overview /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
                <Route path="insights" element={<Suspense fallback={<PageLoader />}><Insights /></Suspense>} />
                <Route path="data" element={<Suspense fallback={<PageLoader />}><DataManagement session={session} onAuth={setSession} /></Suspense>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
        </ToastProvider>
    )
}