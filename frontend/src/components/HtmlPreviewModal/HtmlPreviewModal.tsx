import { useCallback, useState } from 'react'
import './HtmlPreviewModal.css'

interface HtmlPreviewModalProps {
  html: string
  onClose: () => void
}

export function HtmlPreviewModal({ html, onClose }: HtmlPreviewModalProps) {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'preview' | 'code'>('preview')

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>HTML Export</h2>
          <div className="modal-tabs">
            <button
              className={`modal-tab ${tab === 'preview' ? 'active' : ''}`}
              onClick={() => setTab('preview')}
            >
              Preview
            </button>
            <button
              className={`modal-tab ${tab === 'code' ? 'active' : ''}`}
              onClick={() => setTab('code')}
            >
              Code
            </button>
          </div>
          <div className="modal-actions">
            <button className="btn-copy" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy HTML'}
            </button>
            <button className="modal-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="modal-body">
          {tab === 'preview' ? (
            <iframe
              className="preview-iframe"
              srcDoc={html}
              title="Email Preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <pre className="code-view">
              <code>{html}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
