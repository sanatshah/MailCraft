import { useMemo } from 'react'
import './DiffView.css'

interface DiffViewProps {
  fileName: string
  before: string
  after: string
  onAccept: () => void
  onReject: () => void
  status?: 'pending' | 'accepted' | 'rejected'
}

type DiffLineType = 'added' | 'removed' | 'unchanged'

interface DiffLine {
  type: DiffLineType
  text: string
}

function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  const result: DiffLine[] = []

  const beforeSet = new Set(beforeLines)
  const afterSet = new Set(afterLines)

  let bi = 0
  let ai = 0

  while (bi < beforeLines.length || ai < afterLines.length) {
    if (bi < beforeLines.length && ai < afterLines.length) {
      if (beforeLines[bi] === afterLines[ai]) {
        result.push({ type: 'unchanged', text: beforeLines[bi] })
        bi++
        ai++
      } else if (!afterSet.has(beforeLines[bi])) {
        result.push({ type: 'removed', text: beforeLines[bi] })
        bi++
      } else if (!beforeSet.has(afterLines[ai])) {
        result.push({ type: 'added', text: afterLines[ai] })
        ai++
      } else {
        result.push({ type: 'removed', text: beforeLines[bi] })
        bi++
      }
    } else if (bi < beforeLines.length) {
      result.push({ type: 'removed', text: beforeLines[bi] })
      bi++
    } else {
      result.push({ type: 'added', text: afterLines[ai] })
      ai++
    }
  }

  return result
}

export function DiffView({
  fileName,
  before,
  after,
  onAccept,
  onReject,
  status,
}: DiffViewProps) {
  const diffLines = useMemo(() => computeDiff(before, after), [before, after])

  const statusLabel = status === 'accepted' ? '✓ Accepted' : status === 'rejected' ? '✗ Rejected' : null

  return (
    <div className="diff-view" data-testid="diff-view">
      <div className="dv-header">
        <span className="dv-filename">{fileName}</span>

        <div className="dv-actions">
          {statusLabel ? (
            <span className={`dv-badge dv-badge--${status}`}>
              {statusLabel}
            </span>
          ) : (
            <>
              <button className="dv-btn dv-btn--accept" onClick={onAccept}>
                ✓ Accept
              </button>
              <button className="dv-btn dv-btn--reject" onClick={onReject}>
                ✗ Reject
              </button>
            </>
          )}
        </div>
      </div>

      <div className="dv-body">
        {diffLines.map((line, i) => (
          <div key={i} className={`dv-line dv-line--${line.type}`}>
            <span className="dv-marker">
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
            </span>
            <span className="dv-text">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
