import { Link } from 'react-router-dom'
import { useGameStore, getRankForXp } from '../../store/gameStore'
import { CatAvatar } from '../../components/CatAvatar/CatAvatar'
import { ACCESSORIES } from '../../data/accessories'
import './CatProfile.css'

const TOTAL_LEVELS = 17

export function CatProfile() {
  const { catName, playerName, xp, completedLevels, accessories, resetGame } =
    useGameStore()
  const rank = getRankForXp(xp)
  const allAccessoryDefs = Object.values(ACCESSORIES)

  function handleReset() {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      resetGame()
    }
  }

  return (
    <div className="cat-profile" data-testid="cat-profile">
      <Link to="/world" className="cat-profile__back">
        ← Back to World Map
      </Link>

      <div className="cat-profile__card">
        <div className="cat-profile__names">
          <h1 className="cat-profile__cat-name">{catName}</h1>
          <p className="cat-profile__player-name">{playerName}'s companion</p>
        </div>

        <div className="cat-profile__avatar">
          <CatAvatar mood="happy" accessories={accessories} size="lg" />
        </div>

        <div className="cat-profile__rank">
          <span className="cat-profile__rank-badge">{rank.badge}</span>
          <span className="cat-profile__rank-name">{rank.name}</span>
        </div>

        <div className="cat-profile__xp">
          <span className="cat-profile__xp-label">Total XP</span>
          <span className="cat-profile__xp-value">{xp}</span>
        </div>

        <div className="cat-profile__progress">
          <span className="cat-profile__progress-label">Levels Completed</span>
          <span className="cat-profile__progress-value">
            {completedLevels.length} / {TOTAL_LEVELS}
          </span>
          <div className="cat-profile__progress-track">
            <div
              className="cat-profile__progress-fill"
              style={{ width: `${(completedLevels.length / TOTAL_LEVELS) * 100}%` }}
            />
          </div>
        </div>

        <div className="cat-profile__accessories">
          <h2 className="cat-profile__section-title">Accessories</h2>
          <div className="cat-profile__accessories-grid">
            {allAccessoryDefs.map((acc) => {
              const owned = accessories.includes(acc.id)
              return (
                <div
                  key={acc.id}
                  className={`cat-profile__accessory ${owned ? 'cat-profile__accessory--owned' : 'cat-profile__accessory--locked'}`}
                  title={owned ? acc.description : 'Locked'}
                >
                  <span className="cat-profile__accessory-emoji">{acc.emoji}</span>
                  <span className="cat-profile__accessory-name">{acc.name}</span>
                  {!owned && <span className="cat-profile__accessory-lock">🔒</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button className="cat-profile__reset" onClick={handleReset}>
        🗑️ Reset Game
      </button>
    </div>
  )
}
