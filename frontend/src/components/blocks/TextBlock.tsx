import type { Block } from '../../types'

export function TextBlock({ block }: { block: Block }) {
  const { content, fontSize, color, alignment, padding } = block.properties as {
    content?: string
    fontSize?: number
    color?: string
    alignment?: string
    padding?: number
  }

  return (
    <div
      style={{
        padding: `${padding ?? 16}px`,
        fontSize: `${fontSize ?? 16}px`,
        color: color ?? '#232426',
        textAlign: (alignment as 'left' | 'center' | 'right') ?? 'left',
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: content ?? 'Enter your text here...' }}
    />
  )
}
