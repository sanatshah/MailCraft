import { useDraggable } from '@dnd-kit/core'
import type { BlockType } from '../../types'
import './BlockLibrary.css'

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'text',
    label: 'Text',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 5H16M4 5V4H16V5M10 5V16M8 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'Image',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 14L7 10L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 12L14 9L17 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'button',
    label: 'Button',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="6" width="14" height="8" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 6H7M3 14H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4V8M10 12V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 6L10 4L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 14L10 16L13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'columns',
    label: 'Columns',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="4" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

function DraggableBlockTile({ type, label, icon }: { type: BlockType; label: string; icon: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}`,
    data: { type, fromLibrary: true },
  })

  return (
    <div
      ref={setNodeRef}
      className={`block-tile ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <span className="block-tile-icon">{icon}</span>
      <span className="block-tile-label">{label}</span>
    </div>
  )
}

export function BlockLibrary() {
  return (
    <div className="block-library" data-testid="block-library">
      <div className="block-library-header">
        <h3>Content</h3>
        <p>Drag blocks to the canvas</p>
      </div>
      <div className="block-library-grid">
        {BLOCK_TYPES.map((bt) => (
          <DraggableBlockTile key={bt.type} {...bt} />
        ))}
      </div>
    </div>
  )
}
