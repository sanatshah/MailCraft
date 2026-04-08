import type { AccessoryDef } from '../types/game';

export const ACCESSORIES: Record<string, AccessoryDef> = {
  // World 1 — Kitten Academy
  'tiny-bell': {
    id: 'tiny-bell',
    name: 'Tiny Bell',
    emoji: '🔔',
    description: 'A small silver bell that jingles when your cat moves. Earned by mastering Ask Mode.',
  },
  'thinking-cap': {
    id: 'thinking-cap',
    name: 'Thinking Cap',
    emoji: '🎩',
    description: 'A tiny top hat that helps your cat plan ahead. Earned by mastering Plan Mode.',
  },
  'keyboard-paws': {
    id: 'keyboard-paws',
    name: 'Keyboard Paws',
    emoji: '⌨️',
    description: 'Special mechanical keycap gloves. Earned by mastering Agent Mode.',
  },
  'detective-magnifier': {
    id: 'detective-magnifier',
    name: 'Detective Magnifier',
    emoji: '🔍',
    description: 'A tiny magnifying glass on a chain. Earned by mastering Debug Mode.',
  },
  'breed-badge': {
    id: 'breed-badge',
    name: 'Breed Badge',
    emoji: '🏅',
    description: 'A golden badge showing all known cat breeds. Earned by mastering Model Selection.',
  },
  'graduation-cap': {
    id: 'graduation-cap',
    name: 'Graduation Cap',
    emoji: '🎓',
    description: 'A miniature mortarboard for a very smart cat. Earned by completing Kitten Academy.',
  },

  // World 2 — Grooming Salon
  'house-collar': {
    id: 'house-collar',
    name: 'House Collar',
    emoji: '🏠',
    description: 'A collar with a house-shaped tag. Earned by mastering Project Rules.',
  },
  'tool-belt': {
    id: 'tool-belt',
    name: 'Tool Belt',
    emoji: '🔧',
    description: 'A tiny utility belt packed with MCP tools. Earned by mastering Skills.',
  },
  'memory-ribbon': {
    id: 'memory-ribbon',
    name: 'Memory Ribbon',
    emoji: '🎀',
    description: 'A purple ribbon that helps your cat remember everything. Earned by mastering Context.',
  },
  'gourmet-bowl': {
    id: 'gourmet-bowl',
    name: 'Gourmet Bowl',
    emoji: '🍽️',
    description: 'A fancy food bowl for a picky eater. Earned by mastering Scoping Rules.',
  },
  'bow-tie': {
    id: 'bow-tie',
    name: 'Bow Tie',
    emoji: '🎀',
    description: 'An elegant bow tie for the cat show champion. Earned by completing the Grooming Salon.',
  },

  // World 3 — Cat Colony
  'cloud-badge': {
    id: 'cloud-badge',
    name: 'Cloud Badge',
    emoji: '☁️',
    description: 'A fluffy cloud pin for a cat who works remotely. Earned by mastering Background Agents.',
  },
  'assembly-hat': {
    id: 'assembly-hat',
    name: 'Assembly Hat',
    emoji: '🏭',
    description: 'A hard hat for the assembly line foreman. Earned by mastering Task Orchestration.',
  },
  'night-cap': {
    id: 'night-cap',
    name: 'Night Cap',
    emoji: '🌙',
    description: 'A cozy nightcap for cats that work while you sleep. Earned by mastering Automations.',
  },
  'reviewer-glasses': {
    id: 'reviewer-glasses',
    name: 'Reviewer Glasses',
    emoji: '👓',
    description: 'Sharp spectacles for code review experts. Earned by mastering PR Review.',
  },
  'crown': {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    description: 'A golden crown for the colony leader. Earned by completing the Cat Colony.',
  },

  // Final Boss
  'championship-trophy': {
    id: 'championship-trophy',
    name: 'Championship Trophy',
    emoji: '🏆',
    description: 'The ultimate prize for the Cursor Cat Champion. Earned by completing the Championship.',
  },
};
