import type { CatMood } from '../../types/game'
import './CatAvatar.css'

interface CatAvatarProps {
  mood: CatMood
  accessories: string[]
  size?: 'sm' | 'md' | 'lg'
}

const CAT_ART: Record<CatMood, string> = {
  idle: `
    /\\_/\\  
   ( o.o ) 
    > ^ <  
   /|   |\\
  (_|   |_)`,
  happy: `
    /\\_/\\  
   ( ^.^ ) 
    > ^ <  ~~
   /|   |\\  ✨
  (_|   |_)`,
  thinking: `
    /\\_/\\    ?
   ( o.o )  💭
    > ^ <  
   /|   |\\
  (_|   |_)`,
  error: `
    /\\_/\\  
   ( >_< ) !!
    > ~ <  💢
   /|   |\\
  (_|   |_)`,
  sleeping: `
    /\\_/\\  
   ( -.- ) zZz
    > ^ <  
   /|   |\\
  (_|   |_)`,
}

const ACCESSORY_OVERLAYS: Record<string, { position: 'top' | 'face' | 'neck' | 'body'; art: string }> = {
  'tiny-bell': { position: 'neck', art: '🔔' },
  'thinking-cap': { position: 'top', art: '🎩' },
  'keyboard-paws': { position: 'body', art: '⌨️' },
  'detective-magnifier': { position: 'face', art: '🔍' },
  'breed-badge': { position: 'neck', art: '🏅' },
  'graduation-cap': { position: 'top', art: '🎓' },
  'house-collar': { position: 'neck', art: '🏠' },
  'tool-belt': { position: 'body', art: '🔧' },
  'memory-ribbon': { position: 'neck', art: '🎀' },
  'gourmet-bowl': { position: 'body', art: '🍽️' },
  'bow-tie': { position: 'neck', art: '🎀' },
  'cloud-badge': { position: 'neck', art: '☁️' },
  'assembly-hat': { position: 'top', art: '🏭' },
  'night-cap': { position: 'top', art: '🌙' },
  'reviewer-glasses': { position: 'face', art: '👓' },
  'crown': { position: 'top', art: '👑' },
  'championship-trophy': { position: 'top', art: '🏆' },
}

export function CatAvatar({ mood, accessories, size = 'md' }: CatAvatarProps) {
  const topAccessories = accessories
    .filter((a) => ACCESSORY_OVERLAYS[a]?.position === 'top')
    .map((a) => ACCESSORY_OVERLAYS[a].art)
  const faceAccessories = accessories
    .filter((a) => ACCESSORY_OVERLAYS[a]?.position === 'face')
    .map((a) => ACCESSORY_OVERLAYS[a].art)
  const neckAccessories = accessories
    .filter((a) => ACCESSORY_OVERLAYS[a]?.position === 'neck')
    .map((a) => ACCESSORY_OVERLAYS[a].art)
  const bodyAccessories = accessories
    .filter((a) => ACCESSORY_OVERLAYS[a]?.position === 'body')
    .map((a) => ACCESSORY_OVERLAYS[a].art)

  return (
    <div className={`cat-avatar cat-avatar--${size} cat-avatar--${mood}`} data-testid="cat-avatar">
      {topAccessories.length > 0 && (
        <div className="cat-avatar__accessories cat-avatar__accessories--top">
          {topAccessories.join(' ')}
        </div>
      )}
      <pre className="cat-avatar__art">{CAT_ART[mood]}</pre>
      {faceAccessories.length > 0 && (
        <div className="cat-avatar__accessories cat-avatar__accessories--face">
          {faceAccessories.join(' ')}
        </div>
      )}
      {neckAccessories.length > 0 && (
        <div className="cat-avatar__accessories cat-avatar__accessories--neck">
          {neckAccessories.join(' ')}
        </div>
      )}
      {bodyAccessories.length > 0 && (
        <div className="cat-avatar__accessories cat-avatar__accessories--body">
          {bodyAccessories.join(' ')}
        </div>
      )}
    </div>
  )
}
