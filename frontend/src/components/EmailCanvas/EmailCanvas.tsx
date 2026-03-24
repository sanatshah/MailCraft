import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Block } from '../../types'
import { BlockWrapper } from '../blocks/BlockWrapper'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { ButtonBlock } from '../blocks/ButtonBlock'
import { DividerBlock } from '../blocks/DividerBlock'
import { SpacerBlock } from '../blocks/SpacerBlock'
import { ColumnsBlock } from '../blocks/ColumnsBlock'
import './EmailCanvas.css'

interface EmailCanvasProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onDeleteBlock: (id: string) => void
}

function renderBlock(block: Block) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />
    case 'image':
      return <ImageBlock block={block} />
    case 'button':
      return <ButtonBlock block={block} />
    case 'divider':
      return <DividerBlock block={block} />
    case 'spacer':
      return <SpacerBlock block={block} />
    case 'columns':
      return <ColumnsBlock block={block} />
    default:
      return <div>Unknown block type</div>
  }
}

export function EmailCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
}: EmailCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' })

  return (
    <div className="email-canvas" onClick={() => onSelectBlock(null)} data-testid="email-canvas">
      <div className="email-canvas-inner">
        <div
          ref={setNodeRef}
          className={`email-body ${isOver ? 'drop-hover' : ''}`}
        >
          {blocks.length === 0 ? (
            <div className="canvas-empty">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                <path d="M20 14V26M14 20H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p>Drag blocks here to start building</p>
            </div>
          ) : (
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <BlockWrapper
                  key={block.id}
                  block={block}
                  isSelected={block.id === selectedBlockId}
                  onClick={() => onSelectBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                >
                  {renderBlock(block)}
                </BlockWrapper>
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  )
}
