import { useRef, useEffect } from 'react'
import './SimulatedTerminal.css'

interface TerminalLine {
  text: string
  type: 'error' | 'success' | 'info' | 'warning'
}

interface SimulatedTerminalProps {
  lines: TerminalLine[]
  onAddToChat?: (text: string) => void
}

export function SimulatedTerminal({
  lines,
  onAddToChat,
}: SimulatedTerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className="simulated-terminal" data-testid="simulated-terminal">
      <div className="st-header">
        <div className="st-dots">
          <span className="st-dot st-dot--red" />
          <span className="st-dot st-dot--yellow" />
          <span className="st-dot st-dot--green" />
        </div>
        <span className="st-title">Terminal</span>
      </div>

      <div className="st-body">
        {lines.map((line, i) => (
          <div key={i} className={`st-line st-line--${line.type}`}>
            <span className="st-line__text">{line.text}</span>
            {line.type === 'error' && onAddToChat && (
              <button
                className="st-add-btn"
                onClick={() => onAddToChat(line.text)}
                title="Add to Chat"
              >
                ⊕ Add to Chat
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
