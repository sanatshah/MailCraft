import { useState, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Home } from './pages/Home/Home'
import { TemplateList } from './pages/TemplateList/TemplateList'
import { TemplateEditor } from './pages/TemplateEditor/TemplateEditor'
import './styles/global.css'

function MainLayout({ children, collapsed, onToggleCollapse }: { children: ReactNode; collapsed: boolean; onToggleCollapse: () => void }) {
  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      <main className="app-main">{children}</main>
    </div>
  )
}

function EditorLayout({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      <main className="app-main" style={{ overflow: 'hidden' }}>
        <TemplateEditor />
      </main>
    </div>
  )
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar}>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/templates"
          element={
            <MainLayout collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar}>
              <TemplateList />
            </MainLayout>
          }
        />
        <Route path="/templates/:id" element={<EditorLayout collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
