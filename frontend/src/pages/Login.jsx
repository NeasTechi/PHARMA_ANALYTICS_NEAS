import { useState } from 'react'
import { signIn, signOut } from '../lib/auth'

export default function Login({ session, onAuth }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)

    if (session) {
        return (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>Admin: {session.user.email}</span>
                <button onClick={async () => { await signOut(); onAuth(null) }} style={{ padding: '6px 12px' }}>Sign out</button>
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
        <form onSubmit={handle} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="email" placeholder="admin email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '6px' }} />
            <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '6px' }} />
            <button type="submit" disabled={busy} style={{ padding: '6px 12px' }}>{busy ? '...' : 'Admin login'}</button>
            {err && <span style={{ color: 'red', fontSize: '13px' }}>{err}</span>}
        </form>
    )
}