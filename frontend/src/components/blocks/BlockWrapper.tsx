import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Block } from '../../types'
import './BlockWrapper.css'

interface BlockWrapperProps {
  block: Block
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
  children: React.ReactNode
}

export function BlockWrapper({ block, isSelected, onClick, onDelete, children }: BlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <div className="block-toolbar">
        <button className="block-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5" cy="3" r="1" fill="currentColor" />
            <circle cx="9" cy="3" r="1" fill="currentColor" />
            <circle cx="5" cy="7" r="1" fill="currentColor" />
            <circle cx="9" cy="7" r="1" fill="currentColor" />
            <circle cx="5" cy="11" r="1" fill="currentColor" />
            <circle cx="9" cy="11" r="1" fill="currentColor" />
          </svg>
        </button>
        <span className="block-type-label">{block.type}</span>
        <button className="block-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete() }} title="Delete block">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="block-content">
        {children}
      </div>
    </div>
  )
}
