import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Logo from './Logo'

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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex">
                <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40 w-72 h-screen bg-white dark:bg-gray-900 border-r border-gray-200/70 dark:border-gray-800 transition-transform duration-300 flex flex-col`}>
                    <div className="p-6 border-b border-gray-200/70 dark:border-gray-800">
                        <Logo />
                    </div>
                    <nav className="flex-1 p-4 space-y-1">
                        {nav.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                end={n.to === '/'}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`
                                }
                                onClick={() => setOpen(false)}
                            >
                                <span className="text-base">{n.icon}</span>
                                <span>{n.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-200/70 dark:border-gray-800 space-y-2">
                        <button onClick={() => setDark(!dark)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                            {dark ? '☀️ Light mode' : '🌙 Dark mode'}
                        </button>
                    </div>
                </aside>

                {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />}

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200/70 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
                        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(true)}>☰</button>
                        <div className="hidden md:block text-sm text-gray-500">Pharma Sales Intelligence</div>
                        <div className="flex items-center gap-3">
                            {session ? (
                                <>
                                    <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{session.user.email}</span>
                                    <button onClick={onAuth} className="btn-ghost">Sign out</button>
                                </>
                            ) : (
                                <span className="text-sm text-gray-500">Guest · read-only</span>
                            )}
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-8 overflow-auto animate-fade-in">
                        <Outlet context={{ session }} />
                    </main>
                </div>
            </div>
        </div>
    )
}