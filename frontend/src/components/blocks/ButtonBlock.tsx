import type { Block } from '../../types'

export function ButtonBlock({ block }: { block: Block }) {
  const { text, url, backgroundColor, textColor, borderRadius, alignment, padding } =
    block.properties as {
      text?: string
      url?: string
      backgroundColor?: string
      textColor?: string
      borderRadius?: number
      alignment?: string
      padding?: number
    }

  return (
    <div
      style={{
        padding: `${padding ?? 16}px`,
        textAlign: (alignment as 'left' | 'center' | 'right') ?? 'center',
      }}
    >
      <a
        href={url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          backgroundColor: backgroundColor ?? '#EF6351',
          color: textColor ?? '#FFFFFF',
          textDecoration: 'none',
          padding: '12px 32px',
          borderRadius: `${borderRadius ?? 6}px`,
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: 1.5,
        }}
        onClick={(e) => e.preventDefault()}
      >
        {text ?? 'Click Here'}
      </a>
    </div>
  )
}
