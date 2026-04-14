import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '../../hooks/useTemplates'
import type { Template } from '../../types'
import './TemplateList.css'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: Template
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="template-card" data-testid="template-card">
      <div className="template-card-preview" onClick={onEdit}>
        <div className="template-card-preview-content">
          {template.content.slice(0, 3).map((block) => (
            <div key={block.id} className={`preview-block preview-block-${block.type}`}>
              {block.type === 'text' && (
                <div className="preview-text-line" />
              )}
              {block.type === 'image' && (
                <div className="preview-image-box" />
              )}
              {block.type === 'button' && (
                <div className="preview-button-box" />
              )}
              {block.type === 'divider' && (
                <div className="preview-divider-line" />
              )}
              {block.type === 'spacer' && (
                <div className="preview-spacer" />
              )}
            </div>
          ))}
          {template.content.length === 0 && (
            <div className="preview-empty">Empty template</div>
          )}
        </div>
      </div>
      <div className="template-card-info">
        <div className="template-card-header">
          <h3 className="template-card-name" onClick={onEdit}>{template.name}</h3>
          <div className="template-card-menu-wrapper">
            <button
              className="template-card-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Template actions"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="13" r="1.5" fill="currentColor" />
              </svg>
            </button>
            {menuOpen && (
              <div className="template-card-menu">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit()
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDuplicate()
                  }}
                >
                  Duplicate
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {template.subject && (
          <p className="template-card-subject">{template.subject}</p>
        )}
        <p className="template-card-date">Updated {formatDate(template.updated_at)}</p>
      </div>
    </div>
  )
}

export function TemplateList() {
  const { templates, loading, error, createTemplate, duplicateTemplate, deleteTemplate } = useTemplates()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreate = async () => {
    const template = await createTemplate({ name: 'Untitled Template' })
    navigate(`/templates/${template.id}`, { state: { k: 1 } })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id)
    }
  }

  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicateTemplate(id)
    navigate(`/templates/${duplicated.id}`)
  }

  if (loading) {
    return (
      <div className="template-list-loading">
        <div className="spinner" />
        <p>Loading templates…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="template-list-error">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="template-list" data-testid="template-list">
      <div className="template-list-header">
        <div>
          <h1 className="template-list-title">Email Templates</h1>
          <p className="template-list-subtitle">
            Create and manage your email templates
          </p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Create Template
        </button>
      </div>

      <div className="template-list-toolbar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="template-count">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="template-list-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M16 20H32M16 26H28M16 32H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3>No templates yet</h3>
          <p>Get started by creating your first email template</p>
          <button className="btn-primary" onClick={handleCreate}>
            Create Template
          </button>
        </div>
      ) : (
        <div className="template-grid">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => navigate(`/templates/${template.id}`)}
              onDuplicate={() => handleDuplicate(template.id)}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
