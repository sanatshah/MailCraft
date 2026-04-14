import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Home } from './pages/Home/Home'
import { TemplateList } from './pages/TemplateList/TemplateList'
import { TemplateEditor } from './pages/TemplateEditor/TemplateEditor'
import './styles/global.css'

const SIDEBAR_STORAGE_KEY = 'mailcraft.sidebar.collapsed'

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
}

function MainLayout({
  children,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  children: ReactNode
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <main className="app-main">{children}</main>
    </div>
  )
}

function EditorLayout({
  sidebarCollapsed,
  onToggleSidebar,
}: {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
      <main className="app-main" style={{ overflow: 'hidden' }}>
        <TemplateEditor />
      </main>
    </div>
  )
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarCollapsed)
  const toggleSidebar = () => setSidebarCollapsed((collapsed) => !collapsed)

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            >
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/templates"
          element={
            <MainLayout
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            >
              <TemplateList />
            </MainLayout>
          }
        />
        <Route
          path="/templates/:id"
          element={
            <EditorLayout
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={toggleSidebar}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
