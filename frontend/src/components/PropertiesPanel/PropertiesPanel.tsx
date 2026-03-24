import type { Block } from '../../types'
import './PropertiesPanel.css'

interface PropertiesPanelProps {
  block: Block | null
  onUpdate: (blockId: string, properties: Record<string, unknown>) => void
  onDelete: (blockId: string) => void
}

function TextProperties({ block, onUpdate }: { block: Block; onUpdate: (props: Record<string, unknown>) => void }) {
  const p = block.properties as Record<string, unknown>
  return (
    <>
      <div className="prop-group">
        <label className="prop-label">Content</label>
        <textarea
          className="prop-textarea"
          value={(p.content as string) ?? ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={4}
        />
      </div>
      <div className="prop-group">
        <label className="prop-label">Font Size</label>
        <div className="prop-row">
          <input
            type="number"
            className="prop-input"
            value={(p.fontSize as number) ?? 16}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            min={10}
            max={72}
          />
          <span className="prop-unit">px</span>
        </div>
      </div>
      <div className="prop-group">
        <label className="prop-label">Color</label>
        <div className="prop-row">
          <input
            type="color"
            className="prop-color"
            value={(p.color as string) ?? '#232426'}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
          <input
            type="text"
            className="prop-input"
            value={(p.color as string) ?? '#232426'}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
        </div>
      </div>
      <AlignmentProp value={(p.alignment as string) ?? 'left'} onChange={(v) => onUpdate({ alignment: v })} />
      <PaddingProp value={(p.padding as number) ?? 16} onChange={(v) => onUpdate({ padding: v })} />
    </>
  )
}

function ImageProperties({ block, onUpdate }: { block: Block; onUpdate: (props: Record<string, unknown>) => void }) {
  const p = block.properties as Record<string, unknown>
  return (
    <>
      <div className="prop-group">
        <label className="prop-label">Image URL</label>
        <input
          type="text"
          className="prop-input full"
          placeholder="https://..."
          value={(p.src as string) ?? ''}
          onChange={(e) => onUpdate({ src: e.target.value })}
        />
      </div>
      <div className="prop-group">
        <label className="prop-label">Alt Text</label>
        <input
          type="text"
          className="prop-input full"
          value={(p.alt as string) ?? ''}
          onChange={(e) => onUpdate({ alt: e.target.value })}
        />
      </div>
      <div className="prop-group">
        <label className="prop-label">Width</label>
        <input
          type="text"
          className="prop-input full"
          value={(p.width as string) ?? '100%'}
          onChange={(e) => onUpdate({ width: e.target.value })}
        />
      </div>
      <div className="prop-group">
        <label className="prop-label">Link URL</label>
        <input
          type="text"
          className="prop-input full"
          placeholder="https://..."
          value={(p.linkUrl as string) ?? ''}
          onChange={(e) => onUpdate({ linkUrl: e.target.value })}
        />
      </div>
      <AlignmentProp value={(p.alignment as string) ?? 'center'} onChange={(v) => onUpdate({ alignment: v })} />
      <PaddingProp value={(p.padding as number) ?? 16} onChange={(v) => onUpdate({ padding: v })} />
    </>
  )
}

function ButtonProperties({ block, onUpdate }: { block: Block; onUpdate: (props: Record<string, unknown>) => void }) {
  const p = block.properties as Record<string, unknown>
  return (
    <>
      <div className="prop-group">
        <label className="prop-label">Button Text</label>
        <input
          type="text"
          className="prop-input full"
          value={(p.text as string) ?? 'Click Here'}
          onChange={(e) => onUpdate({ text: e.target.value })}
        />
      </div>
      <div className="prop-group">
        <label className="prop-label">URL</label>
        <input
          type="text"
          className="prop-input full"
          placeholder="https://..."
          value={(p.url as string) ?? '#'}
          onChange={(e) => onUpdate({ url: e.target.value })}
        />
      </div>
      <div className="prop-group">
        <label className="prop-label">Background Color</label>
        <div className="prop-row">
          <input
            type="color"
            className="prop-color"
            value={(p.backgroundColor as string) ?? '#EF6351'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
          <input
            type="text"
            className="prop-input"
            value={(p.backgroundColor as string) ?? '#EF6351'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
        </div>
      </div>
      <div className="prop-group">
        <label className="prop-label">Text Color</label>
        <div className="prop-row">
          <input
            type="color"
            className="prop-color"
            value={(p.textColor as string) ?? '#FFFFFF'}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
          />
          <input
            type="text"
            className="prop-input"
            value={(p.textColor as string) ?? '#FFFFFF'}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
          />
        </div>
      </div>
      <div className="prop-group">
        <label className="prop-label">Border Radius</label>
        <div className="prop-row">
          <input
            type="number"
            className="prop-input"
            value={(p.borderRadius as number) ?? 6}
            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
            min={0}
            max={50}
          />
          <span className="prop-unit">px</span>
        </div>
      </div>
      <AlignmentProp value={(p.alignment as string) ?? 'center'} onChange={(v) => onUpdate({ alignment: v })} />
      <PaddingProp value={(p.padding as number) ?? 16} onChange={(v) => onUpdate({ padding: v })} />
    </>
  )
}

function DividerProperties({ block, onUpdate }: { block: Block; onUpdate: (props: Record<string, unknown>) => void }) {
  const p = block.properties as Record<string, unknown>
  return (
    <>
      <div className="prop-group">
        <label className="prop-label">Color</label>
        <div className="prop-row">
          <input
            type="color"
            className="prop-color"
            value={(p.color as string) ?? '#E8E5E0'}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
          <input
            type="text"
            className="prop-input"
            value={(p.color as string) ?? '#E8E5E0'}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
        </div>
      </div>
      <div className="prop-group">
        <label className="prop-label">Thickness</label>
        <div className="prop-row">
          <input
            type="number"
            className="prop-input"
            value={(p.thickness as number) ?? 1}
            onChange={(e) => onUpdate({ thickness: Number(e.target.value) })}
            min={1}
            max={10}
          />
          <span className="prop-unit">px</span>
        </div>
      </div>
      <div className="prop-group">
        <label className="prop-label">Width</label>
        <div className="prop-row">
          <input
            type="number"
            className="prop-input"
            value={(p.width as number) ?? 100}
            onChange={(e) => onUpdate({ width: Number(e.target.value) })}
            min={10}
            max={100}
          />
          <span className="prop-unit">%</span>
        </div>
      </div>
      <PaddingProp value={(p.padding as number) ?? 16} onChange={(v) => onUpdate({ padding: v })} />
    </>
  )
}

function SpacerProperties({ block, onUpdate }: { block: Block; onUpdate: (props: Record<string, unknown>) => void }) {
  const p = block.properties as Record<string, unknown>
  return (
    <div className="prop-group">
      <label className="prop-label">Height</label>
      <div className="prop-row">
        <input
          type="range"
          className="prop-range"
          value={(p.height as number) ?? 32}
          onChange={(e) => onUpdate({ height: Number(e.target.value) })}
          min={8}
          max={120}
        />
        <span className="prop-value">{(p.height as number) ?? 32}px</span>
      </div>
    </div>
  )
}

function ColumnsProperties({ block, onUpdate }: { block: Block; onUpdate: (props: Record<string, unknown>) => void }) {
  const p = block.properties as Record<string, unknown>
  const columns = (p.columns as Array<{ content: string }>) ?? [{ content: 'Column 1' }, { content: 'Column 2' }]
  return (
    <>
      <div className="prop-group">
        <label className="prop-label">Columns ({columns.length})</label>
        <div className="prop-row">
          <button
            className="prop-btn"
            disabled={columns.length <= 1}
            onClick={() => onUpdate({ columns: columns.slice(0, -1) })}
          >
            −
          </button>
          <span className="prop-value">{columns.length}</span>
          <button
            className="prop-btn"
            disabled={columns.length >= 4}
            onClick={() => onUpdate({ columns: [...columns, { content: `Column ${columns.length + 1}` }] })}
          >
            +
          </button>
        </div>
      </div>
      {columns.map((col, i) => (
        <div className="prop-group" key={i}>
          <label className="prop-label">Column {i + 1} Content</label>
          <textarea
            className="prop-textarea"
            value={col.content}
            onChange={(e) => {
              const newCols = [...columns]
              newCols[i] = { content: e.target.value }
              onUpdate({ columns: newCols })
            }}
            rows={2}
          />
        </div>
      ))}
      <div className="prop-group">
        <label className="prop-label">Gap</label>
        <div className="prop-row">
          <input
            type="number"
            className="prop-input"
            value={(p.gap as number) ?? 16}
            onChange={(e) => onUpdate({ gap: Number(e.target.value) })}
            min={0}
            max={48}
          />
          <span className="prop-unit">px</span>
        </div>
      </div>
      <PaddingProp value={(p.padding as number) ?? 16} onChange={(v) => onUpdate({ padding: v })} />
    </>
  )
}

function AlignmentProp({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="prop-group">
      <label className="prop-label">Alignment</label>
      <div className="prop-alignment">
        {(['left', 'center', 'right'] as const).map((a) => (
          <button
            key={a}
            className={`prop-align-btn ${value === a ? 'active' : ''}`}
            onClick={() => onChange(a)}
          >
            {a === 'left' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M2 8H10M2 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {a === 'center' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M4 8H12M3 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            {a === 'right' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M6 8H14M4 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function PaddingProp({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="prop-group">
      <label className="prop-label">Padding</label>
      <div className="prop-row">
        <input
          type="number"
          className="prop-input"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={0}
          max={64}
        />
        <span className="prop-unit">px</span>
      </div>
    </div>
  )
}

export function PropertiesPanel({ block, onUpdate, onDelete }: PropertiesPanelProps) {
  if (!block) {
    return (
      <div className="properties-panel" data-testid="properties-panel">
        <div className="properties-empty">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 8V24M8 16H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          </svg>
          <p>Select a block to edit its properties</p>
        </div>
      </div>
    )
  }

  const handleUpdate = (props: Record<string, unknown>) => {
    onUpdate(block.id, props)
  }

  return (
    <div className="properties-panel" data-testid="properties-panel">
      <div className="properties-header">
        <h3>{block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block</h3>
      </div>
      <div className="properties-body">
        {block.type === 'text' && <TextProperties block={block} onUpdate={handleUpdate} />}
        {block.type === 'image' && <ImageProperties block={block} onUpdate={handleUpdate} />}
        {block.type === 'button' && <ButtonProperties block={block} onUpdate={handleUpdate} />}
        {block.type === 'divider' && <DividerProperties block={block} onUpdate={handleUpdate} />}
        {block.type === 'spacer' && <SpacerProperties block={block} onUpdate={handleUpdate} />}
        {block.type === 'columns' && <ColumnsProperties block={block} onUpdate={handleUpdate} />}
      </div>
      <div className="properties-footer">
        <button className="btn-delete" onClick={() => onDelete(block.id)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4H12M5 4V2.5C5 2.22 5.22 2 5.5 2H8.5C8.78 2 9 2.22 9 2.5V4M3 4V12C3 12.55 3.45 13 4 13H10C10.55 13 11 12.55 11 12V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Delete Block
        </button>
      </div>
    </div>
  )
}
