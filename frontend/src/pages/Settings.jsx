import { Helmet } from 'react-helmet-async'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { signOut } from '../lib/auth'
import { useState } from 'react'

const Section = ({ title, children }) => (
    <section className="card p-6 space-y-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {children}
    </section>
)

const Row = ({ label, desc, children }) => (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div>
            <p className="text-sm font-medium">{label}</p>
            {desc && <p className="text-xs text-gray-500">{desc}</p>}
        </div>
        <div>{children}</div>
    </div>
)

export default function Settings({ session, onAuth }) {
    const { dark, toggle } = useTheme()
    const toast = useToast()
    const [clearing, setClearing] = useState(false)

    async function handleSignOut() {
        await signOut()
        onAuth(null)
        toast('Signed out.')
    }

    function clearCache() {
        setClearing(true)
        localStorage.clear()
        toast('Local cache cleared.')
        setClearing(false)
    }

    return (
        <div className="space-y-6 animate-slide-up">
            <Helmet>
                <title>Settings · Pharma Analytics</title>
                <meta name="description" content="Manage appearance, account, privacy, and data settings." />
            </Helmet>

            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your dashboard preferences</p>
            </div>

            <Section title="Appearance">
                <Row label="Dark mode" desc="Toggle between light and dark themes">
                    <button onClick={toggle} className="btn-ghost border border-gray-200 dark:border-gray-700">
                        {dark ? '🌙 Dark' : '☀️ Light'}
                    </button>
                </Row>
                <Row label="Compact layout" desc="Reduce spacing for denser views">
                    <input type="checkbox" className="w-4 h-4 accent-brand-600" />
                </Row>
            </Section>

            <Section title="Account">
                {session ? (
                    <>
                        <Row label="Signed in as" desc={session.user.email}>
                            <span className="text-xs text-gray-400">{session.user.id.slice(0, 8)}…</span>
                        </Row>
                        <Row label="Sign out" desc="End your admin session">
                            <button onClick={handleSignOut} className="px-3 py-1.5 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition">Sign out</button>
                        </Row>
                    </>
                ) : (
                    <p className="text-sm text-gray-500">You are browsing as a guest (read-only). Log in from Data Management to access admin features.</p>
                )}
            </Section>

            <Section title="Data & Privacy">
                <Row label="Export all data" desc="Download your sales data as CSV">
                    <button onClick={() => { window.location.href = '/analytics' }} className="btn-ghost border border-gray-200 dark:border-gray-700 text-xs">Go to Analytics</button>
                </Row>
                <Row label="Clear local cache" desc="Reset stored preferences and filters">
                    <button onClick={clearCache} disabled={clearing} className="btn-ghost border border-gray-200 dark:border-gray-700 text-xs">{clearing ? '...' : 'Clear'}</button>
                </Row>
                <Row label="Data retention" desc="Sales data is stored in your Supabase project. You control deletion.">
                    <span className="text-xs text-gray-400">Supabase</span>
                </Row>
            </Section>

            <Section title="About">
                <Row label="Version" desc="Pharma Analytics Dashboard">
                    <span className="text-xs text-gray-400">v1.0.0</span>
                </Row>
                <Row label="Repository" desc="Source code on GitHub">
                    <a href="https://github.com/NeasTechi/PHARMA_ANALYTICS_NEAS" target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">View repo</a>
                </Row>
                <Row label="License" desc="MIT">
                    <span className="text-xs text-gray-400">MIT</span>
                </Row>
            </Section>

            {session && (
                <Section title="Danger Zone">
                    <Row label="Reset filters" desc="Clear all saved filter preferences">
                        <button onClick={() => { localStorage.removeItem('filters'); toast('Filters reset.') }} className="px-3 py-1.5 text-sm rounded-xl border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">Reset</button>
                    </Row>
                </Section>
            )}
        </div>
    )
}