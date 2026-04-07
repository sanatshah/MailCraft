import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'mailcraft.sidebar.collapsed'

const NAV_ITEMS = [
  {
    label: 'Home',
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10L10 3L17 10V17H12V13H8V17H3V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Templates',
    path: '/templates',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8H17M8 8V17" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Content',
    path: null as string | null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 8H14M6 11H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
] as const

function isNavActive(pathname: string, label: string): boolean {
  if (label === 'Home') {
    return pathname === '/'
  }
  if (label === 'Templates') {
    return pathname === '/templates' || pathname.startsWith('/templates/')
  }
  return false
}

export function Sidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_STORAGE_KEY,
      String(isCollapsed),
    )
  }, [isCollapsed])

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      data-testid="sidebar"
      data-collapsed={isCollapsed}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#EF6351" />
            <path d="M8 10h16v2H8zM8 15h12v2H8zM8 20h14v2H8z" fill="#fff" />
          </svg>
          <span className="sidebar-brand">MailCraft</span>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={isCollapsed ? 'Expand side menu' : 'Collapse side menu'}
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d={isCollapsed ? 'M8 5L13 10L8 15' : 'M12 5L7 10L12 15'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) =>
          item.path == null ? (
            <div
              key={item.label}
              className="sidebar-nav-item sidebar-nav-item--placeholder"
              aria-disabled="true"
              aria-label={item.label}
              title={item.label}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </div>
          ) : (
            <NavLink
              key={item.label}
              to={item.path}
              className={() =>
                `sidebar-nav-item ${
                  isNavActive(location.pathname, item.label) ? 'active' : ''
                }`
              }
              aria-label={item.label}
              title={item.label}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-nav-item" aria-label="Account" title="Account">
          <span className="sidebar-nav-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 16.5C5.5 14 7.5 12.5 10 12.5C12.5 12.5 14.5 14 15 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="sidebar-nav-label">Account</span>
        </div>
      </div>
    </aside>
  )
}
