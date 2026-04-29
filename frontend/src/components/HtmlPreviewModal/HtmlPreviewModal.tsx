import { useCallback, useId, useState } from 'react'
import './HtmlPreviewModal.css'

export type HtmlPreviewTab = 'preview' | 'source'

interface HtmlPreviewModalProps {
  html: string
  onClose: () => void
  title?: string
  /** Which tab is shown when the modal opens */
  initialTab?: HtmlPreviewTab
}

export function HtmlPreviewModal({
  html,
  onClose,
  title = 'Email Preview',
  initialTab = 'preview',
}: HtmlPreviewModalProps) {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<HtmlPreviewTab>(initialTab)
  const tablistId = useId()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = html
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [html])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--preview" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id={`${tablistId}-title`}>{title}</h2>
          <div className="modal-header-toolbar">
            <div className="modal-tabs" role="tablist" aria-labelledby={`${tablistId}-title`}>
              <button
                type="button"
                role="tab"
                id={`${tablistId}-tab-preview`}
                aria-selected={tab === 'preview'}
                aria-controls={`${tablistId}-panel-preview`}
                className={tab === 'preview' ? 'modal-tab modal-tab--active' : 'modal-tab'}
                onClick={() => setTab('preview')}
              >
                Preview
              </button>
              <button
                type="button"
                role="tab"
                id={`${tablistId}-tab-source`}
                aria-selected={tab === 'source'}
                aria-controls={`${tablistId}-panel-source`}
                className={tab === 'source' ? 'modal-tab modal-tab--active' : 'modal-tab'}
                onClick={() => setTab('source')}
              >
                HTML source
              </button>
            </div>
            <div className="modal-actions">
              {tab === 'source' ? (
                <button type="button" className="btn-copy" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : 'Copy HTML'}
                </button>
              ) : null}
              <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <div
            id={`${tablistId}-panel-preview`}
            role="tabpanel"
            aria-labelledby={`${tablistId}-tab-preview`}
            hidden={tab !== 'preview'}
            className="modal-panel modal-panel--preview"
          >
            <iframe
              title="Rendered email"
              className="email-preview-frame"
              sandbox="allow-same-origin"
              srcDoc={html}
            />
          </div>
          <div
            id={`${tablistId}-panel-source`}
            role="tabpanel"
            aria-labelledby={`${tablistId}-tab-source`}
            hidden={tab !== 'source'}
            className="modal-panel modal-panel--source"
          >
            <pre className="code-view">
              <code>{html}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
