import { NavLink, useLocation } from 'react-router-dom'
import { useSidebar } from '../../context/sidebar-context'
import './Sidebar.css'

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
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}
      data-testid="sidebar"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
            <rect width="32" height="32" rx="8" fill="#EF6351" />
            <path d="M8 10h16v2H8zM8 15h12v2H8zM8 20h14v2H8z" fill="#fff" />
          </svg>
          <span className="sidebar-brand">MailCraft</span>
        </div>
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls="sidebar-main-nav"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="sidebar-collapse-toggle-icon" aria-hidden>
            {collapsed ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 4L13 10L7 16"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13 4L7 10L13 16"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="sidebar-collapse-toggle-label">
            {collapsed ? 'Expand' : 'Collapse'}
          </span>
        </button>
      </div>

      <nav id="sidebar-main-nav" className="sidebar-nav" aria-label="Main">
        {NAV_ITEMS.map((item) =>
          item.path == null ? (
            <div
              key={item.label}
              className="sidebar-nav-item sidebar-nav-item--placeholder"
              aria-disabled="true"
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </div>
          ) : (
            <NavLink
              key={item.label}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={() =>
                `sidebar-nav-item ${
                  isNavActive(location.pathname, item.label) ? 'active' : ''
                }`
              }
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/account"
          title={collapsed ? 'Account' : undefined}
          className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          aria-label="Account"
        >
          <span className="sidebar-nav-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 16.5C5.5 14 7.5 12.5 10 12.5C12.5 12.5 14.5 14 15 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="sidebar-nav-label">Account</span>
        </NavLink>
      </div>
    </aside>
  )
}
