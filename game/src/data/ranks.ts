import type { RankInfo } from '../types/game';

export const RANKS: RankInfo[] = [
  { rank: 'stray_kitten', threshold: 0, name: 'Stray Kitten', badge: '🐱' },
  { rank: 'house_cat', threshold: 200, name: 'House Cat', badge: '🐈' },
  { rank: 'clever_cat', threshold: 500, name: 'Clever Cat', badge: '😺' },
  { rank: 'code_cat', threshold: 900, name: 'Code Cat', badge: '😸' },
  { rank: 'shadow_cat', threshold: 1400, name: 'Shadow Cat', badge: '🐈\u200D⬛' },
  { rank: 'cursor_cat_master', threshold: 2000, name: 'Cursor Cat Master', badge: '👑🐱' },
];
