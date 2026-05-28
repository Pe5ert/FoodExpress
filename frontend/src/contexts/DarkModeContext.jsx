import { createContext, useContext, useEffect, useState } from 'react'

const DarkModeContext = createContext(null)

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true' } catch { return false }
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try { localStorage.setItem('darkMode', dark) } catch {}
  }, [dark])

  const toggle = () => {
    document.documentElement.classList.add('theme-changing')
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-changing')
    }, 260)
    setDark(d => !d)
  }

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext)
  // Fallback seguro caso seja usado fora do provider
  if (!ctx) return { dark: false, toggle: () => {} }
  return ctx
}
