import { useGameStore } from '../../store/gameStore'
import { getRankForXp, getNextRank } from '../../store/gameStore'
import { RANKS } from '../../data/ranks'
import './ProgressBar.css'

export function ProgressBar() {
  const xp = useGameStore((s) => s.xp)
  const currentRank = getRankForXp(xp)
  const nextRank = getNextRank(xp)

  const maxXp = RANKS[RANKS.length - 1].threshold
  const xpIntoRank = xp - currentRank.threshold
  const xpNeeded = nextRank
    ? nextRank.threshold - currentRank.threshold
    : maxXp - currentRank.threshold || 1
  const percent = nextRank
    ? Math.min(100, (xpIntoRank / xpNeeded) * 100)
    : 100

  return (
    <div className="progress-bar" data-testid="progress-bar">
      <div className="progress-bar__rank">
        <span className="progress-bar__badge">{currentRank.badge}</span>
        <span className="progress-bar__name">{currentRank.name}</span>
      </div>

      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="progress-bar__xp">
        {nextRank ? (
          <span>
            {xp} / {nextRank.threshold} XP
          </span>
        ) : (
          <span>{xp} XP — MAX RANK</span>
        )}
      </div>
    </div>
  )
}
