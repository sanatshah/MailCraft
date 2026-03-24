import type { Block } from '../../types'

export function SpacerBlock({ block }: { block: Block }) {
  const { height } = block.properties as { height?: number }

  return (
    <div
      style={{
        height: `${height ?? 32}px`,
        background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px)',
        borderRadius: '2px',
      }}
    />
  )
}
