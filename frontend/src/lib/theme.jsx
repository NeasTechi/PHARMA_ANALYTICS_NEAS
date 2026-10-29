import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContext'

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem('theme') === 'dark'
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    const toggle = () => setDark((d) => !d)
    return <ThemeContext.Provider value={{ dark, setDark, toggle }}>{children}</ThemeContext.Provider>
}

