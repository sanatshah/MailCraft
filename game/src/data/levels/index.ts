import type { LevelDef } from '../../types/game'

// World 1
import { level11 } from './world1/level1-1'
import { level12 } from './world1/level1-2'
import { level13 } from './world1/level1-3'
import { level14 } from './world1/level1-4'
import { level15 } from './world1/level1-5'
import { boss1 } from './world1/boss1'

// World 2
import { level2_1 } from './world2/level2-1'
import { level2_2 } from './world2/level2-2'
import { level2_3 } from './world2/level2-3'
import { level2_4 } from './world2/level2-4'
import { boss2 } from './world2/boss2'

// World 3
import { level3_1 } from './world3/level3-1'
import { level3_2 } from './world3/level3-2'
import { level3_3 } from './world3/level3-3'
import { level3_4 } from './world3/level3-4'
import { boss3 } from './world3/boss3'

// Final boss
import { finalBoss } from './final-boss'

const ALL_LEVELS: LevelDef[] = [
  // World 1
  level11,
  level12,
  level13,
  level14,
  level15,
  boss1,
  // World 2
  level2_1,
  level2_2,
  level2_3,
  level2_4,
  boss2,
  // World 3
  level3_1,
  level3_2,
  level3_3,
  level3_4,
  boss3,
  // Final
  finalBoss,
]

// Ordered list of level IDs — used for unlock logic
const LEVEL_ORDER = ALL_LEVELS.map((l) => l.id)

export function getAllLevels(): LevelDef[] {
  return ALL_LEVELS
}

export function getLevelById(id: string): LevelDef | undefined {
  return ALL_LEVELS.find((l) => l.id === id)
}

export function getWorldLevels(worldNum: number): LevelDef[] {
  return ALL_LEVELS.filter((l) => l.world === worldNum)
}

export function isLevelUnlocked(id: string, completedLevels: string[]): boolean {
  if (id === '1-1') return true
  const idx = LEVEL_ORDER.indexOf(id)
  if (idx <= 0) return false
  return completedLevels.includes(LEVEL_ORDER[idx - 1])
}
