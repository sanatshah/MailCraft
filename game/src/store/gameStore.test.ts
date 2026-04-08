import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, getRankForXp, getNextRank } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.getState().resetGame()
  })

  describe('initial state', () => {
    it('has empty player name', () => {
      expect(useGameStore.getState().playerName).toBe('')
    })

    it('has empty cat name', () => {
      expect(useGameStore.getState().catName).toBe('')
    })

    it('starts with 0 XP', () => {
      expect(useGameStore.getState().xp).toBe(0)
    })

    it('has no completed levels', () => {
      expect(useGameStore.getState().completedLevels).toEqual([])
    })

    it('has no accessories', () => {
      expect(useGameStore.getState().accessories).toEqual([])
    })

    it('has no hints used', () => {
      expect(useGameStore.getState().hintsUsed).toEqual({})
    })
  })

  describe('setPlayerName', () => {
    it('sets the player name', () => {
      useGameStore.getState().setPlayerName('Alice')
      expect(useGameStore.getState().playerName).toBe('Alice')
    })
  })

  describe('setCatName', () => {
    it('sets the cat name', () => {
      useGameStore.getState().setCatName('Whiskers')
      expect(useGameStore.getState().catName).toBe('Whiskers')
    })
  })

  describe('addXp', () => {
    it('increases XP', () => {
      useGameStore.getState().addXp(100)
      expect(useGameStore.getState().xp).toBe(100)
    })

    it('accumulates XP across calls', () => {
      useGameStore.getState().addXp(100)
      useGameStore.getState().addXp(150)
      expect(useGameStore.getState().xp).toBe(250)
    })

    it('can subtract XP (hint cost)', () => {
      useGameStore.getState().addXp(100)
      useGameStore.getState().addXp(-10)
      expect(useGameStore.getState().xp).toBe(90)
    })
  })

  describe('completeLevel', () => {
    it('adds level to completed list', () => {
      useGameStore.getState().completeLevel('1-1')
      expect(useGameStore.getState().completedLevels).toContain('1-1')
    })

    it('does not duplicate completed levels', () => {
      useGameStore.getState().completeLevel('1-1')
      useGameStore.getState().completeLevel('1-1')
      expect(useGameStore.getState().completedLevels).toEqual(['1-1'])
    })

    it('tracks multiple completed levels', () => {
      useGameStore.getState().completeLevel('1-1')
      useGameStore.getState().completeLevel('1-2')
      useGameStore.getState().completeLevel('1-3')
      expect(useGameStore.getState().completedLevels).toEqual(['1-1', '1-2', '1-3'])
    })
  })

  describe('addAccessory', () => {
    it('adds an accessory', () => {
      useGameStore.getState().addAccessory('tiny-bell')
      expect(useGameStore.getState().accessories).toContain('tiny-bell')
    })

    it('does not duplicate accessories', () => {
      useGameStore.getState().addAccessory('tiny-bell')
      useGameStore.getState().addAccessory('tiny-bell')
      expect(useGameStore.getState().accessories).toEqual(['tiny-bell'])
    })
  })

  describe('useHint', () => {
    it('records hint usage for a level', () => {
      useGameStore.getState().useHint('1-1', 0)
      expect(useGameStore.getState().hintsUsed['1-1']).toBe(0)
    })

    it('tracks highest tier used', () => {
      useGameStore.getState().useHint('1-1', 0)
      useGameStore.getState().useHint('1-1', 2)
      expect(useGameStore.getState().hintsUsed['1-1']).toBe(2)
    })

    it('does not downgrade hint tier', () => {
      useGameStore.getState().useHint('1-1', 2)
      useGameStore.getState().useHint('1-1', 0)
      expect(useGameStore.getState().hintsUsed['1-1']).toBe(2)
    })
  })

  describe('resetGame', () => {
    it('resets all state to initial values', () => {
      useGameStore.getState().setPlayerName('Alice')
      useGameStore.getState().setCatName('Whiskers')
      useGameStore.getState().addXp(500)
      useGameStore.getState().completeLevel('1-1')
      useGameStore.getState().addAccessory('tiny-bell')
      useGameStore.getState().useHint('1-1', 2)

      useGameStore.getState().resetGame()

      const state = useGameStore.getState()
      expect(state.playerName).toBe('')
      expect(state.catName).toBe('')
      expect(state.xp).toBe(0)
      expect(state.completedLevels).toEqual([])
      expect(state.accessories).toEqual([])
      expect(state.hintsUsed).toEqual({})
    })
  })
})

describe('getRankForXp', () => {
  it('returns Stray Kitten for 0 XP', () => {
    expect(getRankForXp(0).rank).toBe('stray_kitten')
  })

  it('returns House Cat for 200 XP', () => {
    expect(getRankForXp(200).rank).toBe('house_cat')
  })

  it('returns Clever Cat for 500 XP', () => {
    expect(getRankForXp(500).rank).toBe('clever_cat')
  })

  it('returns Code Cat for 900 XP', () => {
    expect(getRankForXp(900).rank).toBe('code_cat')
  })

  it('returns Shadow Cat for 1400 XP', () => {
    expect(getRankForXp(1400).rank).toBe('shadow_cat')
  })

  it('returns Cursor Cat Master for 2000 XP', () => {
    expect(getRankForXp(2000).rank).toBe('cursor_cat_master')
  })

  it('returns correct rank for values between thresholds', () => {
    expect(getRankForXp(199).rank).toBe('stray_kitten')
    expect(getRankForXp(499).rank).toBe('house_cat')
    expect(getRankForXp(899).rank).toBe('clever_cat')
  })
})

describe('getNextRank', () => {
  it('returns House Cat as next rank at 0 XP', () => {
    expect(getNextRank(0)?.rank).toBe('house_cat')
  })

  it('returns null when at max rank', () => {
    expect(getNextRank(2000)).toBeNull()
  })

  it('returns correct next rank at intermediate XP', () => {
    expect(getNextRank(300)?.rank).toBe('clever_cat')
  })
})
