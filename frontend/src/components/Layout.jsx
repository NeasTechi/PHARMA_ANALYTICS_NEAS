import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Bot, Database, Menu, Settings as SettingsIcon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import CookieBanner from './CookieBanner'
import Logo from './Logo'

const nav = [
    { to: '/', label: 'Overview', Icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', Icon: BarChart3 },
    { to: '/insights', label: 'AI Insights', Icon: Bot },
    { to: '/data', label: 'Data Management', Icon: Database },
    { to: '/settings', label: 'Settings', Icon: SettingsIcon },
]

export default function Layout({ session, onAuth }) {
    const { dark } = useTheme()
    const [open, setOpen] = useState(false)

    return (
        <div className={dark ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex">
                <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:sticky top-0 z-40 w-16 hover:w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200/70 dark:border-gray-800 transition-all duration-300 flex flex-col group overflow-hidden`}>
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
                                <n.Icon className="w-5 h-5 shrink-0" size={20} />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">{n.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-200/70 dark:border-gray-800 text-xs text-gray-400 text-center">
                        v1.0 · Pharma Analytics
                    </div>
                </aside>

                {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />}

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200/70 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
                        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(true)}>
                            <Menu size={20} />
                        </button>
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
                    <footer className="border-t border-gray-200/70 dark:border-gray-800 px-4 md:px-8 py-4 text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p>Pharma Analytics — sales intelligence dashboard for tracking revenue, profit, and anomalies.</p>
                        <div className="flex items-center gap-3">
                            <a href="/privacy" className="hover:text-brand-600 transition">Privacy</a>
                            <span>·</span>
                            <p>Created by <span className="font-semibold text-brand-600 dark:text-brand-400">NEASTECH</span></p>
                        </div>
                    </footer>
                    <CookieBanner />
                </div>
            </div>
        </div>
    )
}