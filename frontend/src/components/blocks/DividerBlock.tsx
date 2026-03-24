import type { Block } from '../../types'

export function DividerBlock({ block }: { block: Block }) {
  const { color, thickness, width, padding } = block.properties as {
    color?: string
    thickness?: number
    width?: number
    padding?: number
  }

  return (
    <div style={{ padding: `${padding ?? 16}px` }}>
      <hr
        style={{
          border: 'none',
          borderTop: `${thickness ?? 1}px solid ${color ?? '#E8E5E0'}`,
          width: `${width ?? 100}%`,
          margin: '0 auto',
        }}
      />
    </div>
  )
}
