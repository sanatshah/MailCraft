import { useCallback, type ReactNode } from 'react'
import type { CodeFile } from '../../types/game'
import './SimulatedEditor.css'

interface SimulatedEditorProps {
  files: CodeFile[]
  activeFileIndex: number
  selectedLines: [number, number] | null
  onSelectLines?: (range: [number, number] | null) => void
  onFileSelect?: (index: number) => void
}

function highlightLine(text: string): ReactNode[] {
  const tokens: ReactNode[] = []
  const regex =
    /(\/\/.*$|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|async|await|new|throw|try|catch|switch|case|break|default|extends|implements|typeof|void|null|undefined|true|false)\b|\b\d+\.?\d*\b|\b[a-zA-Z_$][\w$]*(?=\s*\())/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index))
    }

    const value = match[0]
    let cls = ''

    if (value.startsWith('//') || value.startsWith('/*')) {
      cls = 'syntax-comment'
    } else if (
      value.startsWith('"') ||
      value.startsWith("'") ||
      value.startsWith('`')
    ) {
      cls = 'syntax-string'
    } else if (
      /^(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|async|await|new|throw|try|catch|switch|case|break|default|extends|implements|typeof|void|null|undefined|true|false)$/.test(
        value,
      )
    ) {
      cls = 'syntax-keyword'
    } else if (/^\d/.test(value)) {
      cls = 'syntax-number'
    } else {
      cls = 'syntax-function'
    }

    tokens.push(
      <span key={match.index} className={`se-${cls}`}>
        {value}
      </span>,
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex))
  }

  return tokens
}

export function SimulatedEditor({
  files,
  activeFileIndex,
  selectedLines,
  onSelectLines,
  onFileSelect,
}: SimulatedEditorProps) {
  const activeFile = files[activeFileIndex]
  const lines = activeFile ? activeFile.content.split('\n') : []

  const handleLineClick = useCallback(
    (lineNum: number, shiftKey: boolean) => {
      if (!onSelectLines) return

      if (shiftKey && selectedLines) {
        const start = Math.min(selectedLines[0], lineNum)
        const end = Math.max(selectedLines[0], lineNum)
        onSelectLines([start, end])
      } else {
        onSelectLines([lineNum, lineNum])
      }
    },
    [onSelectLines, selectedLines],
  )

  const isSelected = (lineNum: number) =>
    selectedLines !== null &&
    lineNum >= selectedLines[0] &&
    lineNum <= selectedLines[1]

  return (
    <div className="simulated-editor" data-testid="simulated-editor">
      <div className="se-tabs">
        {files.map((file, i) => (
          <button
            key={file.name}
            className={`se-tab ${i === activeFileIndex ? 'se-tab--active' : ''}`}
            onClick={() => onFileSelect?.(i)}
          >
            {file.name}
          </button>
        ))}
      </div>

      <div className="se-code-area">
        {lines.map((line, i) => {
          const num = i + 1
          return (
            <div
              key={i}
              className={`se-line ${isSelected(num) ? 'se-line--selected' : ''}`}
              onClick={(e) => handleLineClick(num, e.shiftKey)}
            >
              <span className="se-gutter">{num}</span>
              <span className="se-content">{highlightLine(line)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
