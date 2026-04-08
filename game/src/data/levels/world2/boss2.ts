import type { LevelDef } from '../../../types/game';

export const boss2: LevelDef = {
  id: 'boss-2',
  world: 2,
  levelNum: 5,
  title: 'The Cat Show',
  subtitle: 'Build a complete agent customization profile',
  concept: 'Build a complete agent customization profile',
  isBoss: true,

  narrativeIntro:
    'The annual Cat Show has arrived, and every Cursor Cat in the salon is buzzing with excitement. ' +
    'Madame Fluffington unveils a grand stage draped in velvet, with spotlights trained on a single ' +
    'workstation. "The Cat Show isn\'t about who has the fluffiest fur," she announces to the packed ' +
    'crowd. "It\'s about who has the most refined setup. The best-configured AI assistant. The most ' +
    'elegant rules, the sharpest tools, the most precise context." The judges — three senior Cursor ' +
    'Cats with monocles and clipboards — take their seats. "You will build a COMPLETE agent ' +
    'customization profile from scratch," Madame continues. "Project rules, scoped rules, MCPs, ' +
    'and context references — all woven together into a single, harmonious configuration." She ' +
    'looks you dead in the eyes. "Show them what you\'ve learned, darling. This is your moment ' +
    'to shine. Every trick, every rule, every @ — bring it all together." The spotlight finds you. ' +
    'Your fur is immaculate. Time to perform.',

  briefing:
    'Build a complete agent customization profile for a full-stack TypeScript project. You\'ll ' +
    'need to write project rules, scope them to the right files, enable the right MCPs for the ' +
    'team\'s workflow, and use @-mentions to provide context. Complete all four sub-challenges ' +
    'to impress the judges!',

  challengeSteps: [
    {
      id: 'boss-2-main',
      type: 'multi_step',
      instruction:
        'Complete all four sub-challenges to build a polished agent customization profile.',
      subSteps: [
        {
          id: 'boss-2-sub1',
          type: 'write_rules',
          instruction:
            'Round 1 — Foundation Rules: Write three core project rules for a full-stack ' +
            'TypeScript app:\n' +
            '1. Use strict TypeScript — no "any" types\n' +
            '2. All API responses must use the { data, error, status } envelope\n' +
            '3. Use Tailwind CSS utility classes, never inline styles',
          requiredRules: ['strict', 'envelope', 'tailwind'],
          beforeCode:
`// api/users.ts
export async function getUsers(req: any, res: any) {
  const users: any[] = await db.query("SELECT * FROM users");
  res.json(users);
}

// components/Card.tsx
export function Card({ title }: any) {
  return <div style={{padding: '16px', border: '1px solid gray'}}>{title}</div>;
}`,
          afterCode:
`// api/users.ts
interface User { id: string; name: string; email: string; }
interface ApiResponse<T> { data: T; error: string | null; status: number; }

export async function getUsers(req: Request, res: Response) {
  const users: User[] = await db.query<User>('SELECT * FROM users');
  res.json({ data: users, error: null, status: 200 } satisfies ApiResponse<User[]>);
}

// components/Card.tsx
interface CardProps { title: string; }

export function Card({ title }: CardProps) {
  return <div className="p-4 border border-gray-300 rounded-lg">{title}</div>;
}`,
        },
        {
          id: 'boss-2-sub2',
          type: 'scope_rules',
          instruction:
            'Round 2 — Scoped Rules: The project has Python ML scripts, TypeScript app code, ' +
            'and an API folder. Scope specific rules to each area:\n' +
            '• *.py files need docstrings on all public functions\n' +
            '• *.tsx files need prop interfaces (not inline types)\n' +
            '• /api/** routes need input validation with Zod schemas',
          scopeTargets: [
            { glob: '*.py', ruleHint: 'Docstrings on all public functions' },
            { glob: '*.tsx', ruleHint: 'Prop interfaces, not inline types' },
            { glob: '/api/**', ruleHint: 'Zod schemas for input validation' },
          ],
        },
        {
          id: 'boss-2-sub3',
          type: 'enable_mcps',
          instruction:
            'Round 3 — Tool Selection: The team uses Linear for tickets, Postgres for data, ' +
            'and deploys to Vercel. A sprint planning session needs the AI to read current ' +
            'tickets and check the database schema for a migration. Which MCPs do you enable?',
          availableMcps: [
            { id: 'web-search', name: 'Web Search', emoji: '🔍', description: 'Search the internet for docs and references' },
            { id: 'file-system', name: 'File System', emoji: '📁', description: 'Browse files outside the workspace' },
            { id: 'database', name: 'Database', emoji: '🗄️', description: 'Query Postgres — inspect schemas and run queries' },
            { id: 'jira-linear', name: 'Jira/Linear', emoji: '📋', description: 'Read and create Linear tickets' },
            { id: 'deployment', name: 'Deployment', emoji: '🚀', description: 'Deploy to Vercel staging' },
          ],
          requiredMcpIds: ['jira-linear', 'database'],
        },
        {
          id: 'boss-2-sub4',
          type: 'at_mention',
          instruction:
            'Round 4 — Context Mastery: A teammate asks: "Refactor the signup form to match ' +
            'our design system, reuse the validation logic from utils, and follow our API ' +
            'conventions." Which @-mention gives Cursor the design system docs?',
          availableMentions: [
            { type: '@docs', label: '@docs', value: 'design-system.md' },
            { type: '@file', label: '@file', value: 'utils/validation.ts' },
            { type: '@rules', label: '.cursorrules', value: 'API response envelope' },
          ],
          expectedMentionType: '@docs',
        },
      ],
    },
  ],

  debrief:
    'Standing ovation, kitten! The judges are on their feet! You\'ve demonstrated mastery of ' +
    'ALL the grooming fundamentals:\n\n' +
    '1. **Project Rules** — Foundation conventions that every AI interaction respects.\n' +
    '2. **Scoped Rules** — Precision targeting so rules apply only where they make sense.\n' +
    '3. **MCP Selection** — External tools chosen for the task at hand, not just enabled blindly.\n' +
    '4. **@-Mentions** — Laser-focused context that gives the AI exactly what it needs.\n\n' +
    'Together, these four pillars form your "agent customization profile" — the blueprint that ' +
    'makes your AI assistant feel like a teammate who\'s read the entire style guide, knows ' +
    'every convention, and has access to the right tools.\n\n' +
    'In the real world, teams that invest in agent customization see dramatically better AI ' +
    'output. It\'s the difference between a generic assistant and one that "gets" your project. ' +
    'The time you spend configuring rules, scopes, MCPs, and context pays back exponentially ' +
    'in every future AI interaction.',

  realWorldMapping: 'Complete Cursor workspace customization: rules, scoped rules, MCPs, and context references',

  quiz: [
    {
      question: 'What makes scoped rules better than a single global rules file for large projects?',
      options: [
        'Scoped rules load faster',
        'Different parts of a project have different conventions; scoped rules prevent irrelevant rules from being applied',
        'Global rules are deprecated',
        'Scoped rules automatically fix code on save',
      ],
      correctIndex: 1,
    },
    {
      question: 'When choosing MCPs for a task, what principle should guide your selection?',
      options: [
        'Enable all available MCPs for maximum capability',
        'Only enable the MCPs you actually need for the current task',
        'Never enable more than one MCP at a time',
        'MCPs should only be enabled by team leads',
      ],
      correctIndex: 1,
    },
    {
      question: 'Which combination gives the AI the best context for refactoring a form to match a design system?',
      options: [
        '@rules alone is enough',
        '@file pointing to the form component only',
        '@docs for the design system, @file for existing validation logic, and @rules for project conventions',
        '@codebase to search everything automatically',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 150, accessory: 'bow-tie', accessoryEmoji: '🎀' },

  hints: [
    { text: 'Take each round one at a time. Each tests a different skill from World 2.', xpCost: 0 },
    { text: 'Round 1: strict TypeScript, API envelope, Tailwind. Round 2: scope rules to file types. Round 3: match MCPs to the task. Round 4: pick the right @-mention for design docs.', xpCost: 10 },
    { text: 'Round 1 keywords: "strict"/"any", "envelope"/"data, error", "tailwind". Round 3: enable Linear + Database. Round 4: @docs for design system documentation.', xpCost: 25 },
  ],

  parTimeSeconds: 600,
};
