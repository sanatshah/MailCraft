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
  placeholder = 'Plan, Build, / for commands, @ for context',
}: SimulatedChatProps) {
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSend = () => {
    const text = input.trim()
    if (!text || disabled) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="simulated-chat" data-testid="simulated-chat">
      {/* Message thread */}
      {messages.length > 0 && (
        <div className="sc-messages" ref={listRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`sc-msg sc-msg--${msg.role}`}>
              {msg.role === 'agent' && (
                <span className="sc-msg__avatar">🐱</span>
              )}
              {msg.role === 'user' && (
                <span className="sc-msg__avatar">👤</span>
              )}
              <div className="sc-msg__content">
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
      )}

      {/* Central input area — Cursor-style */}
      <div className="sc-input-area">
        {/* Workspace / repo selector header */}
        <div className="sc-workspace-header">
          <span className="sc-workspace-name">cursor-cats/game</span>
          <span className="sc-workspace-icon">🖥 ∨</span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="sc-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />

        {/* Model selector pill */}
        <div className="sc-input-footer">
          <div className="sc-model-pill">
            <span className="sc-model-pill__plus">+</span>
            <span className="sc-model-pill__name">
              {mode === 'Ask' ? 'ask-mode' : mode === 'Plan' ? 'plan-mode' : 'composer-2-fast'}
            </span>
            <span className="sc-model-pill__chevron">∨</span>
          </div>
          <button
            className="sc-send-btn"
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            title="Send"
          >
            ⏎
          </button>
        </div>

        {/* Action buttons row */}
        {suggestions.length > 0 && (
          <div className="sc-actions">
            {suggestions.map((s) => (
              <button
                key={s}
                className="sc-action-btn"
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
      </div>
    </div>
  )
}
