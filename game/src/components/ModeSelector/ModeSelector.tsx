import { useCallback } from 'react'
import './ModeSelector.css'

interface ModeSelectorProps {
  activeMode: string
  enabledModes: string[]
  onSelect: (mode: string) => void
}

const MODES = [
  { id: 'Ask', label: 'Plan New Idea', icon: '💡', shortcut: '⇧Tab' },
  { id: 'Plan', label: 'Open Editor Window', icon: '📝', shortcut: '' },
  { id: 'Agent', label: 'Run in Cloud', icon: '☁️', shortcut: '' },
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
            className={`mode-selector__btn${isActive ? ' mode-selector__btn--active' : ''}${!isEnabled ? ' mode-selector__btn--disabled' : ''}`}
            onClick={() => handleClick(mode.id)}
            disabled={!isEnabled}
            aria-pressed={isActive}
            data-testid={`mode-tab-${mode.id}`}
          >
            <span className="mode-selector__label">{mode.label}</span>
            {mode.shortcut && (
              <span className="mode-selector__shortcut">{mode.shortcut}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
