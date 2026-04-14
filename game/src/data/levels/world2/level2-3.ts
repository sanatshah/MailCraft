import type { LevelDef } from '../../../types/game';

export const level2_3: LevelDef = {
  id: '2-3',
  world: 2,
  levelNum: 3,
  title: 'Memory Lane',
  subtitle: 'Give your cat perfect recall with @-mentions',
  concept: 'Teaching the agent persistent context with @-mentions',
  isBoss: false,

  narrativeIntro:
    'Madame Fluffington snaps her fingers, and the salon\'s walls transform into towering ' +
    'bookshelves filled with project documentation, style guides, and code files. "A cat with ' +
    'no memory," she sighs, "is a cat that asks the same question twice. And I do NOT repeat ' +
    'myself." She pulls a shimmering ribbon from a drawer. "This is the @-mention — the most ' +
    'elegant way to give your AI assistant context. Instead of copying and pasting entire files ' +
    'into your prompt, you simply reference them: @file for specific files, @docs for documentation, ' +
    'and @rules for your project conventions." She pins three tasks to the salon board, each ' +
    'requiring a different type of context. "Match the right @-mention to each task, darling. ' +
    'A well-informed cat is a productive cat. Point your AI to exactly the knowledge it needs, ' +
    'and watch it work wonders."',

  briefing:
    'Three tasks are pinned to the board. Each one needs a different kind of context to complete ' +
    'properly. Match the right @-mention type to each task so Cursor has the information it needs.',

  challengeSteps: [
    {
      id: '2-3-step1',
      type: 'at_mention',
      instruction:
        'Task 1: "The login form validation doesn\'t match our design system spacing." ' +
        'You need Cursor to reference the project\'s style guide. Which @-mention provides ' +
        'documentation context?',
      availableMentions: [
        { type: '@docs', label: '@docs', value: 'style-guide.md' },
        { type: '@file', label: '@file', value: 'userValidation.ts' },
        { type: '@rules', label: '.cursorrules', value: 'API envelope format' },
      ],
      expectedMentionType: '@docs',
    },
    {
      id: '2-3-step2',
      type: 'at_mention',
      instruction:
        'Task 2: "The signup endpoint returns data in the wrong shape — it should use our ' +
        'standard API envelope." You need Cursor to know your response format convention. ' +
        'Which @-mention provides project rules?',
      availableMentions: [
        { type: '@docs', label: '@docs', value: 'style-guide.md' },
        { type: '@file', label: '@file', value: 'userValidation.ts' },
        { type: '@rules', label: '.cursorrules', value: 'API envelope format' },
      ],
      expectedMentionType: '@rules',
    },
    {
      id: '2-3-step3',
      type: 'at_mention',
      instruction:
        'Task 3: "Add email format validation to the signup form — reuse the same regex pattern ' +
        'from our existing validation file." You need Cursor to see a specific source file. ' +
        'Which @-mention points to a file?',
      availableMentions: [
        { type: '@docs', label: '@docs', value: 'style-guide.md' },
        { type: '@file', label: '@file', value: 'userValidation.ts' },
        { type: '@rules', label: '.cursorrules', value: 'API envelope format' },
      ],
      expectedMentionType: '@file',
    },
  ],

  debrief:
    'Beautifully done, kitten! You matched each task with the perfect context source:\n\n' +
    '• **@docs** pointed Cursor to the style guide for design-system spacing.\n' +
    '• **@rules** reminded Cursor of the API envelope convention from .cursorrules.\n' +
    '• **@file** showed Cursor the existing validation file to reuse the regex.\n\n' +
    'In the real world, @-mentions are how you feed precise context to Cursor without dumping ' +
    'your entire codebase into the prompt. Use @file to reference specific source files, @docs ' +
    'to point to documentation pages, @codebase for broad project-wide search, and @rules (or ' +
    '.cursorrules) for project conventions. The AI performs dramatically better when it has ' +
    'exactly the context it needs — no more, no less.\n\n' +
    'Pro tip: combine @-mentions! "Using the patterns from @file userValidation.ts and following ' +
    '@rules, add phone number validation" gives the AI both a reference implementation and your ' +
    'project standards in one prompt.',

  realWorldMapping: 'Cursor @-mentions (@file, @docs, @codebase, @rules) for targeted context',

  quiz: [
    {
      question: 'What is the primary benefit of using @-mentions instead of copy-pasting code into prompts?',
      options: [
        'It makes the prompt shorter, which makes the AI faster',
        'It gives the AI precise, targeted context without manual copy-paste',
        'It automatically fixes the referenced files',
        'It prevents the AI from modifying those files',
      ],
      correctIndex: 1,
    },
    {
      question: 'Which @-mention would you use to reference your project\'s coding conventions?',
      options: [
        '@file',
        '@docs',
        '@rules (or reference .cursorrules)',
        '@codebase',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 80, accessory: 'memory-ribbon', accessoryEmoji: '🎀' },

  hints: [
    { text: 'Think about what type of information each task needs: a document, a convention, or a specific file.', xpCost: 0 },
    { text: 'Style guide = documentation (@docs). API envelope format = project rule (@rules). Existing validation file = specific file (@file).', xpCost: 10 },
    { text: 'Task 1: @docs (style-guide.md). Task 2: @rules (API envelope convention). Task 3: @file (userValidation.ts).', xpCost: 25 },
  ],

  parTimeSeconds: 300,
};
