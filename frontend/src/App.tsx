import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Home } from './pages/Home/Home'
import { TemplateList } from './pages/TemplateList/TemplateList'
import { TemplateEditor } from './pages/TemplateEditor/TemplateEditor'
import './styles/global.css'

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  )
}

function EditorLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main" style={{ overflow: 'hidden' }}>
        <TemplateEditor />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/templates"
          element={
            <MainLayout>
              <TemplateList />
            </MainLayout>
          }
        />
        <Route path="/templates/:id" element={<EditorLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
