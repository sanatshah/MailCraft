import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import type { ChatMessage } from '../../types/game'
import './SimulatedChat.css'

interface SimulatedChatProps {
  messages: ChatMessage[]
  onSend: (text: string) => void
  suggestions?: string[]
  mode?: string
  disabled?: boolean
  placeholder?: string
}

function AgentMessage({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= content.length) {
        setDisplayed(content)
        clearInterval(id)
      } else {
        setDisplayed(content.slice(0, indexRef.current))
      }
    }, 30)

    return () => clearInterval(id)
  }, [content])

  return (
    <span>
      {displayed}
      {displayed.length < content.length && (
        <span className="sc-cursor">▊</span>
      )}
    </span>
  )
}

export function SimulatedChat({
  messages,
  onSend,
  suggestions = [],
  mode,
  disabled = false,
  placeholder = 'Type a message…',
}: SimulatedChatProps) {
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || disabled) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="simulated-chat" data-testid="simulated-chat">
      {mode && <div className="sc-mode-badge">{mode}</div>}

      <div className="sc-messages" ref={listRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`sc-msg sc-msg--${msg.role}`}>
            {msg.role === 'agent' && (
              <span className="sc-msg__avatar">🐱</span>
            )}
            <div className="sc-msg__bubble">
              {msg.toolCall && (
                <div className="sc-msg__tool">{msg.toolCall}</div>
              )}
              {msg.role === 'agent' ? (
                <AgentMessage key={msg.id} content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="sc-suggestions">
          {suggestions.map((s) => (
            <button
              key={s}
              className="sc-chip"
              onClick={() => {
                if (!disabled) onSend(s)
              }}
              disabled={disabled}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="sc-input-row">
        <input
          className="sc-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          className="sc-send"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
        >
          ↵
        </button>
      </div>
    </div>
  )
}
