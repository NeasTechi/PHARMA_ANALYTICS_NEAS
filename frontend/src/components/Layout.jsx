import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const nav = [
    { to: '/', label: 'Overview', icon: '📊' },
    { to: '/analytics', label: 'Analytics', icon: '📈' },
    { to: '/insights', label: 'AI Insights', icon: '🤖' },
    { to: '/data', label: 'Data Management', icon: '🗂️' },
]

export default function Layout({ session, onAuth }) {
    const [dark, setDark] = useState(false)
    const [open, setOpen] = useState(false)

    return (
        <div className={dark ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
                {/* Sidebar */}
                <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-30 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform`}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-blue-600">Pharma Analytics</h1>
                        <p className="text-xs text-gray-500 mt-1">NEAS Dashboard</p>
                    </div>
                    <nav className="p-4 space-y-1">
                        {nav.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                end={n.to === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                        isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`
                                }
                                onClick={() => setOpen(false)}
                            >
                                <span>{n.icon}</span> {n.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="absolute bottom-4 left-4 right-4">
                        <button onClick={() => setDark(!dark)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                            {dark ? '☀️ Light mode' : '🌙 Dark mode'}
                        </button>
                    </div>
                </aside>

                {/* Overlay */}
                {open && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setOpen(false)} />}

                {/* Main */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
                        <button className="md:hidden p-2" onClick={() => setOpen(true)}>☰</button>
                        <div className="flex-1" />
                        <div className="flex items-center gap-3">
                            {session ? (
                                <>
                                    <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{session.user.email}</span>
                                    <button onClick={onAuth} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Sign out</button>
                                </>
                            ) : (
                                <span className="text-sm text-gray-500">Guest (read-only)</span>
                            )}
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-6 overflow-auto">
                        <Outlet context={{ session }} />
                    </main>
                </div>
            </div>
        </div>
    )
}