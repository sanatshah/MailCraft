import { Link } from 'react-router-dom'
import { useGameStore, getRankForXp } from '../../store/gameStore'
import './CursorSidebar.css'

interface LevelEntry {
  id: string
  title: string
  subtitle: string
  isBoss?: boolean
}

interface WorldGroup {
  name: string
  levels: LevelEntry[]
}

const WORLDS: WorldGroup[] = [
  {
    name: 'fieldsphere/kitten-academy',
    levels: [
      { id: '1-1', title: 'First Meow', subtitle: 'Ask Mode' },
      { id: '1-2', title: 'Thinking Cat', subtitle: 'Plan Mode' },
      { id: '1-3', title: 'Paws on Keyboard', subtitle: 'Agent Mode' },
      { id: '1-4', title: 'Hairball Detective', subtitle: 'Debug Mode' },
      { id: '1-5', title: 'Picking the Right Breed', subtitle: 'Model Selection' },
      { id: 'boss-1', title: 'The Yarn Ball Challenge', subtitle: 'Boss', isBoss: true },
    ],
  },
  {
    name: 'fieldsphere/grooming-salon',
    levels: [
      { id: '2-1', title: 'House Rules', subtitle: 'Project Rules' },
      { id: '2-2', title: 'Cat Tricks', subtitle: 'Skills / MCPs' },
      { id: '2-3', title: 'Memory Lane', subtitle: 'Context' },
      { id: '2-4', title: 'The Picky Eater', subtitle: 'Scoping Rules' },
      { id: 'boss-2', title: 'The Cat Show', subtitle: 'Boss', isBoss: true },
    ],
  },
  {
    name: 'fieldsphere/cat-colony',
    levels: [
      { id: '3-1', title: 'Cloud Kittens', subtitle: 'Background Agents' },
      { id: '3-2', title: 'The Assembly Line', subtitle: 'Task Orchestration' },
      { id: '3-3', title: 'Nightshift Cats', subtitle: 'Automations' },
      { id: '3-4', title: 'Herding Cats', subtitle: 'PR Review' },
      { id: 'boss-3', title: 'The Grand Deployment', subtitle: 'Boss', isBoss: true },
    ],
  },
]

interface CursorSidebarProps {
  currentLevelId: string
}

export function CursorSidebar({ currentLevelId }: CursorSidebarProps) {
  const { completedLevels, catName } = useGameStore()
  const rank = getRankForXp(useGameStore.getState().xp)

  return (
    <aside className="cursor-sidebar" data-testid="cursor-sidebar">
      {/* Top actions */}
      <div className="cursor-sidebar__top">
        <Link to="/world" className="cursor-sidebar__new-agent">
          <span className="cursor-sidebar__new-icon">⚡</span>
          <span>New Agent</span>
          <span className="cursor-sidebar__shortcut">⌘N</span>
        </Link>
        <button className="cursor-sidebar__top-btn" title="Marketplace">
          🏪 Marketplace
        </button>
      </div>

      {/* Level list grouped by world */}
      <div className="cursor-sidebar__list">
        {WORLDS.map((world) => (
          <div key={world.name} className="cursor-sidebar__group">
            <div className="cursor-sidebar__group-name">{world.name}</div>
            {world.levels.map((level) => {
              const isCompleted = completedLevels.includes(level.id)
              const isCurrent = level.id === currentLevelId
              let dotClass = 'cursor-sidebar__dot--locked'
              if (isCurrent) dotClass = 'cursor-sidebar__dot--current'
              else if (isCompleted) dotClass = 'cursor-sidebar__dot--completed'

              return (
                <Link
                  key={level.id}
                  to={`/play/${level.id}`}
                  className={`cursor-sidebar__item ${isCurrent ? 'cursor-sidebar__item--active' : ''}`}
                >
                  <span className={`cursor-sidebar__dot ${dotClass}`} />
                  <span className="cursor-sidebar__item-text">{level.title}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom user info */}
      <div className="cursor-sidebar__bottom">
        <div className="cursor-sidebar__user">
          <span className="cursor-sidebar__user-avatar">{rank.badge}</span>
          <div className="cursor-sidebar__user-info">
            <span className="cursor-sidebar__user-name">{catName || 'Unnamed Cat'}</span>
            <span className="cursor-sidebar__user-role">{rank.name}</span>
          </div>
        </div>
        <Link to="/profile" className="cursor-sidebar__settings" title="Profile">
          ⚙
        </Link>
      </div>
    </aside>
  )
}
