import type { Block } from '../../types'

export function ImageBlock({ block }: { block: Block }) {
  const { src, alt, width, alignment, padding, linkUrl } = block.properties as {
    src?: string
    alt?: string
    width?: string
    alignment?: string
    padding?: number
    linkUrl?: string
  }

  const imgStyle: React.CSSProperties = {
    maxWidth: '100%',
    width: width ?? '100%',
    height: 'auto',
    display: 'block',
  }

  const img = src ? (
    <img src={src} alt={alt ?? ''} style={imgStyle} />
  ) : (
    <div
      style={{
        width: '100%',
        height: '120px',
        background: '#F0EDE8',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9CA0A6',
        fontSize: '13px',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 17L8 12L13 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M13 15L16 12L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      Add an image
    </div>
  )

  const content = linkUrl ? <a href={linkUrl} target="_blank" rel="noopener noreferrer">{img}</a> : img

  return (
    <div
      style={{
        padding: `${padding ?? 16}px`,
        textAlign: (alignment as 'left' | 'center' | 'right') ?? 'center',
      }}
    >
      {content}
    </div>
  )
}
