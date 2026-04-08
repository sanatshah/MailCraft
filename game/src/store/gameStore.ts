import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, GameActions, RankInfo } from '../types/game';
import { RANKS } from '../data/ranks';

const initialState: GameState = {
  playerName: '',
  catName: '',
  xp: 0,
  completedLevels: [],
  accessories: [],
  hintsUsed: {},
};

export function getRankForXp(xp: number): RankInfo {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.threshold) {
      current = rank;
    } else {
      break;
    }
  }
  return current;
}

export function getNextRank(xp: number): RankInfo | null {
  for (const rank of RANKS) {
    if (xp < rank.threshold) {
      return rank;
    }
  }
  return null;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set) => ({
      ...initialState,

      setPlayerName: (name: string) => set({ playerName: name }),

      setCatName: (name: string) => set({ catName: name }),

      addXp: (amount: number) =>
        set((state) => ({ xp: state.xp + amount })),

      completeLevel: (levelId: string) =>
        set((state) => ({
          completedLevels: state.completedLevels.includes(levelId)
            ? state.completedLevels
            : [...state.completedLevels, levelId],
        })),

      addAccessory: (accessoryId: string) =>
        set((state) => ({
          accessories: state.accessories.includes(accessoryId)
            ? state.accessories
            : [...state.accessories, accessoryId],
        })),

      useHint: (levelId: string, tier: number) =>
        set((state) => ({
          hintsUsed: {
            ...state.hintsUsed,
            [levelId]: Math.max(state.hintsUsed[levelId] ?? -1, tier),
          },
        })),

      resetGame: () => set({ ...initialState }),
    }),
    {
      name: 'cursor-cats-save',
    },
  ),
);
