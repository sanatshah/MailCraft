import { useNavigate, Link } from 'react-router-dom'
import { useGameStore, getRankForXp } from '../../store/gameStore'
import { ProgressBar } from '../../components/ProgressBar/ProgressBar'
import './WorldSelect.css'

const ALL_LEVEL_IDS = [
  '1-1','1-2','1-3','1-4','1-5','boss-1',
  '2-1','2-2','2-3','2-4','boss-2',
  '3-1','3-2','3-3','3-4','boss-3',
  'final',
]

function isLevelUnlockedCheck(levelId: string, completedLevels: string[]): boolean {
  if (levelId === '1-1') return true
  const idx = ALL_LEVEL_IDS.indexOf(levelId)
  if (idx <= 0) return false
  return completedLevels.includes(ALL_LEVEL_IDS[idx - 1])
}

interface WorldLevel {
  id: string
  title: string
  subtitle: string
  isBoss?: boolean
}

interface World {
  num: number
  title: string
  subtitle: string
  emoji: string
  levels: WorldLevel[]
}

const WORLDS: World[] = [
  {
    num: 1, title: 'Kitten Academy', subtitle: 'Agent Interaction', emoji: '🎓',
    levels: [
      { id: '1-1', title: 'First Meow', subtitle: 'Ask Mode' },
      { id: '1-2', title: 'Thinking Cat', subtitle: 'Plan Mode' },
      { id: '1-3', title: 'Paws on Keyboard', subtitle: 'Agent Mode' },
      { id: '1-4', title: 'Hairball Detective', subtitle: 'Debug Mode' },
      { id: '1-5', title: 'Picking the Right Breed', subtitle: 'Model Selection' },
      { id: 'boss-1', title: 'The Yarn Ball Challenge', subtitle: 'Boss Level', isBoss: true },
    ],
  },
  {
    num: 2, title: 'The Grooming Salon', subtitle: 'Agent Customization', emoji: '✂️',
    levels: [
      { id: '2-1', title: 'House Rules', subtitle: 'Project Rules' },
      { id: '2-2', title: 'Cat Tricks', subtitle: 'Skills / MCPs' },
      { id: '2-3', title: 'Memory Lane', subtitle: 'Context' },
      { id: '2-4', title: 'The Picky Eater', subtitle: 'Scoping Rules' },
      { id: 'boss-2', title: 'The Cat Show', subtitle: 'Boss Level', isBoss: true },
    ],
  },
  {
    num: 3, title: 'The Cat Colony', subtitle: 'Agent Orchestration', emoji: '🏰',
    levels: [
      { id: '3-1', title: 'Cloud Kittens', subtitle: 'Background Agents' },
      { id: '3-2', title: 'The Assembly Line', subtitle: 'Task Orchestration' },
      { id: '3-3', title: 'Nightshift Cats', subtitle: 'Automations' },
      { id: '3-4', title: 'Herding Cats', subtitle: 'PR Review' },
      { id: 'boss-3', title: 'The Grand Deployment', subtitle: 'Boss Level', isBoss: true },
    ],
  },
]

export function WorldSelect() {
  const navigate = useNavigate()
  const catName = useGameStore((s) => s.catName)
  const completedLevels = useGameStore((s) => s.completedLevels)
  const xp = useGameStore((s) => s.xp)
  const rank = getRankForXp(xp)

  const firstNonCompleted = ALL_LEVEL_IDS.find(
    (id) => !completedLevels.includes(id) && isLevelUnlockedCheck(id, completedLevels),
  )

  function getLevelState(levelId: string) {
    if (completedLevels.includes(levelId)) return 'completed' as const
    if (levelId === firstNonCompleted) return 'current' as const
    if (isLevelUnlockedCheck(levelId, completedLevels)) return 'unlocked' as const
    return 'locked' as const
  }

  function handleLevelClick(levelId: string) {
    const state = getLevelState(levelId)
    if (state === 'locked') return
    navigate(`/play/${levelId}`)
  }

  const finalState = getLevelState('final')

  return (
    <div className="world-select" data-testid="world-select">
      <header className="world-select__header">
        <div className="world-select__progress">
          <ProgressBar />
        </div>
        <div className="world-select__cat-name">
          <span className="world-select__cat-badge">{rank.badge}</span>
          <span>{catName}</span>
        </div>
        <Link to="/profile" className="world-select__profile-link">
          🐱 Profile
        </Link>
      </header>

      <div className="world-select__worlds">
        {WORLDS.map((world) => (
          <section key={world.num} className="world-select__world">
            <div className="world-select__world-header">
              <span className="world-select__world-emoji">{world.emoji}</span>
              <div>
                <h2 className="world-select__world-title">
                  World {world.num}: {world.title}
                </h2>
                <p className="world-select__world-subtitle">{world.subtitle}</p>
              </div>
            </div>

            <div className="world-select__levels">
              {world.levels.map((level) => {
                const state = getLevelState(level.id)
                return (
                  <button
                    key={level.id}
                    className={[
                      'world-select__node',
                      level.isBoss && 'world-select__node--boss',
                      `world-select__node--${state}`,
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleLevelClick(level.id)}
                    disabled={state === 'locked'}
                    aria-label={`${level.title} — ${level.subtitle}${state === 'locked' ? ' (locked)' : ''}`}
                  >
                    <span className="world-select__node-indicator">
                      {state === 'completed' && '✅'}
                      {state === 'current' && '🐾'}
                      {state === 'unlocked' && '○'}
                      {state === 'locked' && '🔒'}
                    </span>
                    <div className="world-select__node-info">
                      <span className="world-select__node-title">{level.title}</span>
                      <span className="world-select__node-subtitle">{level.subtitle}</span>
                    </div>
                    {level.isBoss && <span className="world-select__node-boss-tag">BOSS</span>}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="world-select__final">
        <button
          className={[
            'world-select__node world-select__node--final',
            `world-select__node--${finalState}`,
          ].join(' ')}
          onClick={() => handleLevelClick('final')}
          disabled={finalState === 'locked'}
        >
          <span className="world-select__final-emoji">🏆</span>
          <div className="world-select__node-info">
            <span className="world-select__node-title">The Cursor Cat Championship</span>
            <span className="world-select__node-subtitle">Final Boss</span>
          </div>
          {finalState === 'locked' && <span className="world-select__node-indicator">🔒</span>}
          {finalState === 'completed' && <span className="world-select__node-indicator">✅</span>}
          {finalState === 'current' && <span className="world-select__node-indicator">🐾</span>}
        </button>
      </section>
    </div>
  )
}
