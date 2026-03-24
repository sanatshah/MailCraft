import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar/Sidebar'
import { TemplateList } from './pages/TemplateList/TemplateList'
import { TemplateEditor } from './pages/TemplateEditor/TemplateEditor'
import './styles/global.css'

function DashboardLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <TemplateList />
      </main>
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
        <Route path="/" element={<DashboardLayout />} />
        <Route path="/templates/:id" element={<EditorLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
