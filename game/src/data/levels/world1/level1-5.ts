import type { LevelDef } from '../../../types/game';

export const level15: LevelDef = {
  id: '1-5',
  world: 1,
  levelNum: 5,
  title: 'Picking the Right Breed',
  subtitle: 'Match tasks to the best AI model',
  concept: 'Choosing the right AI model for different tasks',
  isBoss: false,

  narrativeIntro:
    'You step into the Model Menagerie, a grand hall lined with glowing cat portraits. Each ' +
    'frame holds a different breed of Cursor Cat — Quickpaw the Shorthair, nimble and fast; ' +
    'Bigbrain the Maine Coon, massive and deeply intelligent; Speedster the Siamese, ' +
    'sleek and efficient; and Thinker the Persian, patient and contemplative. "Not every ' +
    'task needs the same cat," Professor Whiskers explains, gesturing to the portraits with ' +
    'his cane. "Quickpaw handles simple fixes in a flash — typos, boilerplate, renaming. ' +
    'Bigbrain tackles sprawling refactors across dozens of files. Speedster writes tests at ' +
    'lightning speed. And Thinker? Thinker unravels the gnarliest race conditions and ' +
    'architectural puzzles." He turns to you. "A master Cursor Cat knows which breed to call ' +
    'for each job. Choose wisely, and you\'ll save time and tokens. Choose poorly, and you\'ll ' +
    'wait for a Maine Coon to fix a typo." Your ears perk up. Time to learn the art of selection.',

  briefing:
    'Five coding tasks are described below. For each one, select the Cursor Cat breed ' +
    '(AI model) best suited for the job. You need at least 4 out of 5 correct to pass.',

  challengeSteps: [
    {
      id: '1-5-step1',
      type: 'model_select',
      instruction:
        'Read each task description and select the best Cursor Cat breed for the job. ' +
        'Quickpaw is fast and cheap (small model), Bigbrain is powerful for complex multi-file ' +
        'tasks (large model), Speedster is balanced for routine coding (mid-tier model), and ' +
        'Thinker is best for deep reasoning and tricky bugs (reasoning model).',
      scenarios: [
        {
          id: 'scenario-1',
          description: 'Fix a typo in a string literal: "Conncet" should be "Connect".',
          correctBreedId: 'quickpaw',
          explanation:
            'A simple typo fix is a low-complexity task. Quickpaw (small/fast model) handles ' +
            'it instantly without wasting tokens on a more powerful model.',
        },
        {
          id: 'scenario-2',
          description:
            'Refactor the authentication system across 8 files: extract shared middleware, ' +
            'update all route guards, and migrate from session-based to JWT tokens.',
          correctBreedId: 'bigbrain',
          explanation:
            'This is a complex, multi-file architectural change that requires understanding ' +
            'the full codebase. Bigbrain (large model) can hold the entire context and make ' +
            'coherent changes across many files.',
        },
        {
          id: 'scenario-3',
          description:
            'Write unit tests for a pure utility function that formats dates into ' +
            '"YYYY-MM-DD" strings.',
          correctBreedId: 'speedster',
          explanation:
            'Writing tests for a well-defined utility function is routine coding work. ' +
            'Speedster (mid-tier model) balances speed and quality for standard tasks ' +
            'like test generation.',
        },
        {
          id: 'scenario-4',
          description:
            'Debug a race condition where two concurrent API requests occasionally produce ' +
            'duplicate database entries despite a uniqueness constraint.',
          correctBreedId: 'thinker',
          explanation:
            'Race conditions require deep reasoning about timing, concurrency, and state. ' +
            'Thinker (reasoning model) excels at analyzing complex, non-obvious bugs that ' +
            'need step-by-step logical deduction.',
        },
        {
          id: 'scenario-5',
          description:
            'Generate the boilerplate for a new React component: functional component, ' +
            'props interface, default export, and a CSS module file.',
          correctBreedId: 'quickpaw',
          explanation:
            'Boilerplate generation follows a well-known pattern with no ambiguity. Quickpaw ' +
            '(small/fast model) produces this instantly — no need for a heavier model.',
        },
      ],
      minCorrect: 4,
    },
  ],

  debrief:
    'Excellent judgment, kitten! Picking the right model for the task is one of the most ' +
    'practical skills a Cursor user can develop. In the real world, Cursor lets you switch ' +
    'models in the chat panel dropdown. Here\'s the cheat sheet:\n\n' +
    '• **Small/fast models** (like GPT-4o-mini or Claude Haiku): Perfect for typos, renames, ' +
    'boilerplate, and simple questions. Fast and cheap.\n' +
    '• **Mid-tier models** (like GPT-4o or Claude Sonnet): Great for everyday coding — ' +
    'writing tests, implementing features, explaining code.\n' +
    '• **Large models** (like Claude Opus): Best for complex, multi-file tasks that need ' +
    'deep context understanding.\n' +
    '• **Reasoning models** (like o1 or DeepSeek R1): Ideal for tricky bugs, algorithms, ' +
    'and problems that require step-by-step logical analysis.\n\n' +
    'Pro tip: start with a fast model. If the result isn\'t good enough, switch to a more ' +
    'powerful one. This saves tokens and time on the majority of tasks.',

  realWorldMapping: 'Cursor model selector — choosing between AI models for different coding tasks',

  quiz: [
    {
      question: 'Which type of model is best for fixing a simple typo?',
      options: [
        'The largest, most powerful model available',
        'A reasoning model designed for deep analysis',
        'A small, fast model that handles simple tasks efficiently',
        'Any model — they all perform identically on every task',
      ],
      correctIndex: 2,
    },
    {
      question: 'When should you use a reasoning model like Thinker?',
      options: [
        'For generating boilerplate code',
        'For fixing typos and renaming variables',
        'For debugging complex race conditions and tricky logic problems',
        'For writing CSS styles',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 75, accessory: 'breed-badge', accessoryEmoji: '🏅' },

  hints: [
    { text: 'Think about complexity: simple tasks need small models, complex tasks need big ones.', xpCost: 0 },
    { text: 'Typos and boilerplate → Quickpaw. Multi-file refactors → Bigbrain. Tests → Speedster. Deep bugs → Thinker.', xpCost: 10 },
    { text: 'Scenario 1: quickpaw, Scenario 2: bigbrain, Scenario 3: speedster, Scenario 4: thinker, Scenario 5: quickpaw.', xpCost: 25 },
  ],

  parTimeSeconds: 180,
};
