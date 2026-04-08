import { useCallback } from 'react'
import './ModeSelector.css'

interface ModeSelectorProps {
  activeMode: string
  enabledModes: string[]
  onSelect: (mode: string) => void
}

const MODES = [
  { id: 'ask', label: 'Ask', icon: '💬' },
  { id: 'plan', label: 'Plan', icon: '📋' },
  { id: 'agent', label: 'Agent', icon: '🤖' },
] as const

export function ModeSelector({ activeMode, enabledModes, onSelect }: ModeSelectorProps) {
  const handleClick = useCallback(
    (modeId: string) => {
      if (enabledModes.includes(modeId)) {
        onSelect(modeId)
      }
    },
    [enabledModes, onSelect],
  )

  return (
    <div className="mode-selector" data-testid="mode-selector">
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id
        const isEnabled = enabledModes.includes(mode.id)

        return (
          <button
            key={mode.id}
            className={`mode-selector__tab${isActive ? ' mode-selector__tab--active' : ''}${!isEnabled ? ' mode-selector__tab--disabled' : ''}`}
            onClick={() => handleClick(mode.id)}
            disabled={!isEnabled}
            aria-pressed={isActive}
            data-testid={`mode-tab-${mode.id}`}
          >
            <span className="mode-selector__icon">{mode.icon}</span>
            <span className="mode-selector__label">{mode.label}</span>
          </button>
        )
      })}
    </div>
  )
}
