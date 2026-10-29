import { useState } from 'react'
import { signIn, signOut } from '../lib/auth'

export default function Login({ session, onAuth }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)

    if (session) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">Admin: {session.user.email}</span>
                <button onClick={async () => { await signOut(); onAuth(null) }} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Sign out</button>
            </div>
        )
    }

    async function handle(e) {
        e.preventDefault()
        setBusy(true)
        setErr('')
        try {
            const data = await signIn(email, password)
            onAuth(data.session)
        } catch (ex) {
            setErr(ex.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <form onSubmit={handle} className="flex flex-wrap gap-2 items-center">
            <input type="email" placeholder="admin email" value={email} onChange={(e) => setEmail(e.target.value)} required className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50">{busy ? '...' : 'Admin login'}</button>
            {err && <span className="text-red-500 text-sm">{err}</span>}
        </form>
    )
}