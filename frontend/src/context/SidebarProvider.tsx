import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SidebarContext } from './sidebar-context'

const STORAGE_KEY = 'mailcraft-sidebar-collapsed'

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore quota / private mode */
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ collapsed, toggle }), [collapsed, toggle])

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}
