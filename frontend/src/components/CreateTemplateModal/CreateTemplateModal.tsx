import { useState, useCallback, type FormEvent } from 'react'
import './CreateTemplateModal.css'

interface CreateTemplateModalProps {
  onClose: () => void
  onCreate: (name: string, subject: string) => Promise<void>
}

export function CreateTemplateModal({ onClose, onCreate }: CreateTemplateModalProps) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!name.trim()) {
        setError('Template name is required')
        return
      }
      setCreating(true)
      setError(null)
      try {
        await onCreate(name.trim(), subject.trim())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create template')
        setCreating(false)
      }
    },
    [name, subject, onCreate],
  )

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="create-template-modal">
      <div className="modal-content create-template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Template</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form className="create-template-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="template-name" className="form-label">
              Template Name <span className="required">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              className="form-input"
              placeholder="e.g., Welcome Email, Newsletter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={creating}
            />
          </div>
          <div className="form-group">
            <label htmlFor="template-subject" className="form-label">
              Email Subject
            </label>
            <input
              id="template-subject"
              type="text"
              className="form-input"
              placeholder="e.g., Welcome to our service!"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={creating}
            />
            <span className="form-hint">You can change this later in the editor</span>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={creating}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? (
                <>
                  <span className="btn-spinner" />
                  Creating…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Create Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
