import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const SIDEBAR_COLLAPSED_KEY = 'mailcraft-sidebar-collapsed'

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

function getInitialCollapsedState(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    return stored === 'true'
  } catch {
    return false
  }
}

export function Sidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed))
    } catch {
      // Ignore localStorage errors
    }
  }, [isCollapsed])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <aside
      className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      data-testid="sidebar"
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
          className="sidebar-toggle"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d={isCollapsed 
                ? "M6 3L11 8L6 13" 
                : "M10 3L5 8L10 13"
              }
              stroke="currentColor"
              strokeWidth="1.5"
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
              title={isCollapsed ? item.label : undefined}
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
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="sidebar-footer">
        <div
          className="sidebar-nav-item"
          title={isCollapsed ? 'Account' : undefined}
        >
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
