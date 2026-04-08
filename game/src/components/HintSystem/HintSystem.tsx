import { useState, useCallback } from 'react'
import type { HintTier } from '../../types/game'
import './HintSystem.css'

interface HintSystemProps {
  hints: [HintTier, HintTier, HintTier]
  currentTier: number
  onRequestHint: (tier: number) => void
  levelId: string
}

const TIER_META = [
  { label: '💡 Gentle Nudge', cost: null },
  { label: '🔍 Pointed Hint', cost: 10 },
  { label: '📖 Full Answer', cost: 25 },
] as const

export function HintSystem({ hints, currentTier, onRequestHint, levelId }: HintSystemProps) {
  const [open, setOpen] = useState(false)
  const [confirmTier, setConfirmTier] = useState<number | null>(null)

  const toggle = useCallback(() => {
    setOpen((o) => !o)
    setConfirmTier(null)
  }, [])

  const requestHint = useCallback(
    (tier: number) => {
      if (tier > 0 && confirmTier !== tier) {
        setConfirmTier(tier)
        return
      }
      onRequestHint(tier)
      setConfirmTier(null)
    },
    [confirmTier, onRequestHint],
  )

  const cancelConfirm = useCallback(() => {
    setConfirmTier(null)
  }, [])

  return (
    <div className="hint-system" data-testid="hint-system" data-level={levelId}>
      <button
        className={`hint-system__toggle${open ? ' hint-system__toggle--open' : ''}`}
        onClick={toggle}
        aria-label="Toggle hints"
        data-testid="hint-toggle"
      >
        <span className="hint-system__whiskers">=^.^=</span>
      </button>

      {open && (
        <div className="hint-system__panel">
          <div className="hint-system__header">
            <span className="hint-system__title">Professor Whiskers</span>
          </div>

          <div className="hint-system__tiers">
            {hints.map((hint, tier) => {
              const isRevealed = tier < currentTier
              const isNextAvailable = tier === currentTier
              const meta = TIER_META[tier]

              if (isRevealed) {
                return (
                  <div key={tier} className="hint-system__bubble" data-testid={`hint-bubble-${tier}`}>
                    <div className="hint-system__bubble-label">{meta.label}</div>
                    <p className="hint-system__bubble-text">{hint.text}</p>
                  </div>
                )
              }

              return (
                <div key={tier} className="hint-system__tier" data-testid={`hint-tier-${tier}`}>
                  {confirmTier === tier ? (
                    <div className="hint-system__confirm">
                      <p className="hint-system__confirm-text">
                        Spend {meta.cost} XP for this hint?
                      </p>
                      <div className="hint-system__confirm-actions">
                        <button
                          className="hint-system__confirm-btn hint-system__confirm-btn--yes"
                          onClick={() => requestHint(tier)}
                          data-testid={`hint-confirm-${tier}`}
                        >
                          Yes
                        </button>
                        <button
                          className="hint-system__confirm-btn hint-system__confirm-btn--no"
                          onClick={cancelConfirm}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="hint-system__request-btn"
                      onClick={() => requestHint(tier)}
                      disabled={!isNextAvailable}
                      data-testid={`hint-request-${tier}`}
                    >
                      {meta.label}
                      {meta.cost != null && (
                        <span className="hint-system__cost">-{meta.cost} XP</span>
                      )}
                      {!isNextAvailable && (
                        <span className="hint-system__locked">🔒</span>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
