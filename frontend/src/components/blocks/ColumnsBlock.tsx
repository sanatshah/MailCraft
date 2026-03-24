import type { Block } from '../../types'

interface ColumnContent {
  content: string
}

export function ColumnsBlock({ block }: { block: Block }) {
  const { columns, gap, padding } = block.properties as {
    columns?: ColumnContent[]
    gap?: number
    padding?: number
  }

  const cols = columns ?? [{ content: 'Column 1' }, { content: 'Column 2' }]

  return (
    <div style={{ padding: `${padding ?? 16}px` }}>
      <div
        style={{
          display: 'flex',
          gap: `${gap ?? 16}px`,
        }}
      >
        {cols.map((col, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: '12px',
              background: '#FAFAF8',
              borderRadius: '4px',
              border: '1px dashed #E8E5E0',
              fontSize: '14px',
              color: '#6B6E73',
              minHeight: '60px',
            }}
            dangerouslySetInnerHTML={{ __html: col.content }}
          />
        ))}
      </div>
    </div>
  )
}
