/* ──────────────────────────────────────────────
 * Core type definitions for Cursor Cats
 * ────────────────────────────────────────────── */

// Rank progression
export type Rank =
  | 'stray_kitten'
  | 'house_cat'
  | 'clever_cat'
  | 'code_cat'
  | 'shadow_cat'
  | 'cursor_cat_master';

export interface RankInfo {
  rank: Rank;
  threshold: number;
  name: string;
  badge: string;
}

// Game state persisted in localStorage
export interface GameState {
  playerName: string;
  catName: string;
  xp: number;
  completedLevels: string[];
  accessories: string[];
  hintsUsed: Record<string, number>; // levelId → highest tier used (0-2)
}

// Store actions
export interface GameActions {
  setPlayerName: (name: string) => void;
  setCatName: (name: string) => void;
  addXp: (amount: number) => void;
  completeLevel: (levelId: string) => void;
  addAccessory: (accessoryId: string) => void;
  useHint: (levelId: string, tier: number) => void;
  resetGame: () => void;
}

// Quiz
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Hints
export interface HintTier {
  text: string;
  xpCost: number; // 0 = free
}

// Challenge step types — discriminated union key
export type ChallengeStepType =
  | 'highlight_and_ask'
  | 'review_plan'
  | 'agent_diff_review'
  | 'debug_attach'
  | 'model_select'
  | 'write_rules'
  | 'enable_mcps'
  | 'at_mention'
  | 'scope_rules'
  | 'launch_background'
  | 'decompose_tasks'
  | 'setup_automation'
  | 'review_pr'
  | 'multi_step';

// Code file used in simulated editor
export interface CodeFile {
  name: string;
  content: string;
  language: string;
}

// Chat message in simulated chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  toolCall?: string; // e.g., "📋 Linear: Reading ticket CAT-123..."
}

// Diff entry for agent_diff_review steps
export interface DiffEntry {
  fileName: string;
  before: string;
  after: string;
  hasIssue: boolean;
  issueDescription?: string;
}

// Plan step for review_plan steps
export interface PlanStep {
  id: string;
  text: string;
  isBad: boolean;
  explanation?: string; // Shown if player identifies it
}

// Model/cat breed info
export interface CatBreed {
  id: string;
  name: string;
  realModel: string;
  traits: string;
  speed: number; // 1-5
  intelligence: number; // 1-5
  ascii: string;
}

// Model selection scenario
export interface ModelScenario {
  id: string;
  description: string;
  correctBreedId: string;
  explanation: string;
}

// MCP skill card
export interface MCPSkill {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// Automation trigger/action
export interface AutomationDef {
  id: string;
  name: string;
  triggerOptions: string[];
  correctTrigger: string;
  promptHint: string;
  requiredMcps: string[];
}

// PR review item
export interface PRReviewItem {
  id: string;
  title: string;
  diff: DiffEntry;
  issueType: string; // 'security' | 'complexity' | 'testing' | 'style' | 'correctness'
  issueDescription: string;
}

// Generic challenge step
export interface ChallengeStep {
  id: string;
  type: ChallengeStepType;
  instruction: string;

  // Type-specific data — used by the level engine to render the right UI
  // highlight_and_ask
  files?: CodeFile[];
  targetLines?: [number, number]; // start, end line to highlight
  expectedPrompt?: string; // keyword(s) the player should type
  agentResponse?: string; // pre-scripted response
  fixedContent?: string; // content after fix is applied

  // review_plan
  planSteps?: PlanStep[];

  // agent_diff_review
  diffs?: DiffEntry[];
  followUpPrompt?: string;
  followUpDiff?: DiffEntry;

  // debug_attach
  terminalLines?: { text: string; type: 'error' | 'success' | 'info' | 'warning' }[];
  expectedAttach?: string; // what error text must be attached
  debugResponse?: string;

  // model_select
  scenarios?: ModelScenario[];
  minCorrect?: number; // minimum correct to pass

  // write_rules
  requiredRules?: string[]; // keywords that must appear in rules
  beforeCode?: string;
  afterCode?: string;

  // enable_mcps
  availableMcps?: MCPSkill[];
  requiredMcpIds?: string[];

  // at_mention
  availableMentions?: { type: string; label: string; value: string }[];
  expectedMentionType?: string;

  // scope_rules
  scopeTargets?: { glob: string; ruleHint: string }[];

  // launch_background
  cloudTask?: string;
  localTask?: { instruction: string; files?: CodeFile[]; };

  // decompose_tasks
  featureDescription?: string;
  minSubtasks?: number;

  // setup_automation
  automations?: AutomationDef[];

  // review_pr
  prs?: PRReviewItem[];

  // multi_step — nested steps
  subSteps?: ChallengeStep[];
}

// Complete level definition
export interface LevelDef {
  id: string; // e.g. "1-1", "boss-1", "final"
  world: number; // 1, 2, 3, or 0 for final boss
  levelNum: number;
  title: string;
  subtitle: string;
  concept: string;
  isBoss: boolean;
  narrativeIntro: string;
  briefing: string;
  challengeSteps: ChallengeStep[];
  debrief: string;
  realWorldMapping: string;
  quiz: QuizQuestion[];
  reward: {
    xp: number;
    accessory: string;
    accessoryEmoji: string;
  };
  hints: [HintTier, HintTier, HintTier];
  parTimeSeconds: number;
}

// Phase tracking for the level engine
export type LevelPhase =
  | 'briefing'
  | 'challenge'
  | 'debrief'
  | 'quiz'
  | 'complete';

// Accessory definition
export interface AccessoryDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// Cat mood for avatar
export type CatMood = 'idle' | 'happy' | 'thinking' | 'error' | 'sleeping';
