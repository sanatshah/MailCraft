import type { LevelDef } from '../../../types/game';

export const level2_4: LevelDef = {
  id: '2-4',
  world: 2,
  levelNum: 4,
  title: 'The Picky Eater',
  subtitle: 'Scope your rules to the right files and folders',
  concept: 'Scoping rules to specific file types, folders, or languages',
  isBoss: false,

  narrativeIntro:
    'Madame Fluffington places three bowls on the salon counter, each labeled with a different ' +
    'pattern: *.py, *.ts, /api/**. "Not every rule applies everywhere, darling. My Persian cats ' +
    'eat salmon, my Siamese prefer tuna, and the alley cats will eat anything — but I don\'t ' +
    'put salmon in every bowl." She gives you a knowing look. "In Cursor, you can scope rules ' +
    'to specific file types, folders, or even languages. A Python rule about type hints shouldn\'t ' +
    'fire when you\'re editing a CSS file. A rate-limiting rule belongs in the API folder, not ' +
    'in your React components." She arranges three rule cards on the counter, each with a glob ' +
    'pattern and a hint. "Match each rule to its proper scope. A picky eater is a healthy eater, ' +
    'and a well-scoped rule is a productive rule." She taps the counter. "Begin!"',

  briefing:
    'Three coding rules need to be scoped to the right parts of the codebase. For each glob ' +
    'pattern, write a rule that makes sense for that scope. A Python rule for *.py files, ' +
    'a TypeScript rule for *.ts files, and an API rule for the /api/** folder.',

  challengeSteps: [
    {
      id: '2-4-step1',
      type: 'scope_rules',
      instruction:
        'Match each glob pattern with an appropriate rule. Write a rule for each scope:\n\n' +
        '• ***.py** — Python files need a rule about type annotations\n' +
        '• ***.ts** — TypeScript files need a rule about prop interfaces\n' +
        '• **/api/\\*\\*** — API routes need a rule about middleware\n\n' +
        'For each scope, write a concise rule that the AI should follow when editing files ' +
        'matching that pattern.',
      scopeTargets: [
        { glob: '*.py', ruleHint: 'Python type hints' },
        { glob: '*.ts', ruleHint: 'TypeScript interfaces for props' },
        { glob: '/api/**', ruleHint: 'Rate limiting middleware' },
      ],
    },
  ],

  debrief:
    'Exquisite taste, kitten! You\'ve learned that rules are most powerful when they\'re ' +
    'precisely scoped. Here\'s why this matters:\n\n' +
    '• ***.py → Type hints**: Python\'s optional typing means the AI might skip annotations ' +
    'unless you explicitly require them. Scoping to *.py means this rule only applies to Python files.\n' +
    '• ***.ts → Prop interfaces**: In TypeScript projects, defining explicit interfaces for ' +
    'component props improves type safety. This rule wouldn\'t make sense in a CSS file.\n' +
    '• **/api/\\*\\* → Rate limiting**: Rate limiting is an API concern. Scoping it to the API ' +
    'folder prevents the AI from randomly adding rate limiting to your frontend components.\n\n' +
    'In Cursor, scoped rules can be defined in the Rules section of Settings with glob patterns, ' +
    'or by placing .cursorrules files in specific subdirectories. The AI checks which rules match ' +
    'the files being edited and applies only the relevant ones.\n\n' +
    'Pro tip: start broad (project-wide rules), then add scoped rules as your project grows.',

  realWorldMapping: 'Cursor scoped rules with glob patterns and directory-level .cursorrules files',

  quiz: [
    {
      question: 'Why should you scope rules to specific file types instead of making all rules global?',
      options: [
        'Scoped rules run faster than global rules',
        'Global rules are not supported in Cursor',
        'Different file types and folders have different conventions; scoping prevents irrelevant rules from confusing the AI',
        'Scoped rules use less disk space',
      ],
      correctIndex: 2,
    },
    {
      question: 'Which glob pattern would match all files inside the "components" folder and its subfolders?',
      options: [
        'components.*',
        '/components/**',
        '*.components',
        'components/',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 80, accessory: 'gourmet-bowl', accessoryEmoji: '🍽️' },

  hints: [
    { text: 'Each scope has a hint about what kind of rule fits. Think about what convention matters most for that file type.', xpCost: 0 },
    { text: 'For *.py, write something about type annotations. For *.ts, mention interface definitions for props. For /api/**, mention rate limiting or middleware.', xpCost: 10 },
    { text: 'Example rules: "Always add type hints to function parameters and return types" (*.py), "Define an interface for all component props" (*.ts), "Include rate limiting middleware on all public endpoints" (/api/**).', xpCost: 25 },
  ],

  parTimeSeconds: 300,
};
