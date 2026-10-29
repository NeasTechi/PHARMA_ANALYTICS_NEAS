import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getSession, onAuthChange, signOut } from './lib/auth'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Analytics from './pages/Analytics'
import Insights from './pages/Insights'
import DataManagement from './pages/DataManagement'

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
        <Routes>
            <Route element={<Layout session={session} onAuth={handleAuth} />}>
                <Route index element={<Overview />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="insights" element={<Insights />} />
                <Route path="data" element={<DataManagement session={session} onAuth={setSession} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}