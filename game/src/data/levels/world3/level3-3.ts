import type { LevelDef } from '../../../types/game';

export const level3_3: LevelDef = {
  id: '3-3',
  world: 3,
  levelNum: 3,
  title: 'Nightshift Cats',
  subtitle: 'Automate your agents to work while you sleep',
  concept: 'Setting up automated agent workflows triggered by events',
  isBoss: false,

  narrativeIntro:
    'The Colony\'s clock tower strikes midnight, but the workshop doesn\'t sleep. Through a ' +
    'frosted window, you see rows of cats in tiny hard hats, each one tending a different ' +
    'automated pipeline. "The nightshift," Commander Whiskersworth explains, leading you inside. ' +
    '"These cats don\'t wait for commands. They\'re triggered by events — a PR gets opened, a ' +
    'bug lands in the tracker, a cron tick fires at dawn. Each one springs into action automatically.' +
    '" He stops at a control panel with three empty slots. "We need three new automations, recruit. ' +
    'A PR Review Cat that wakes up when a pull request is opened and reviews the code. A Bug Triage ' +
    'Cat that activates when a new bug is created and writes an initial analysis. And a Daily Digest ' +
    'Cat that runs every morning and summarizes yesterday\'s changes." He hands you three blank ' +
    'automation cards. "For each one, choose the right trigger, write the prompt, and select ' +
    'which tools it needs. Get it right, and the nightshift runs itself."',

  briefing:
    'Set up three automated agent workflows. For each automation, select the correct trigger ' +
    'event, configure the prompt, and choose the required MCPs.',

  challengeSteps: [
    {
      id: '3-3-step1',
      type: 'setup_automation',
      instruction:
        'Configure all three automations. For each one, select the correct trigger from the ' +
        'options and note which MCPs it needs:\n\n' +
        '🐱 **PR Review Cat** — Reviews code when a PR is opened\n' +
        '🐱 **Bug Triage Cat** — Analyzes new bugs when they\'re created\n' +
        '🐱 **Daily Digest Cat** — Summarizes changes every morning',
      automations: [
        {
          id: 'pr-review-cat',
          name: 'PR Review Cat',
          triggerOptions: ['PR opened', 'Bug created', 'Daily schedule', 'Manual trigger', 'Commit pushed'],
          correctTrigger: 'PR opened',
          promptHint: 'Review the PR diff for security issues, missing tests, and code quality. Leave inline comments.',
          requiredMcps: ['github'],
        },
        {
          id: 'bug-triage-cat',
          name: 'Bug Triage Cat',
          triggerOptions: ['PR opened', 'Bug created', 'Daily schedule', 'Manual trigger', 'Deploy completed'],
          correctTrigger: 'Bug created',
          promptHint: 'Read the bug report, check related code, and write an initial analysis with suspected root cause and affected files.',
          requiredMcps: ['jira-linear'],
        },
        {
          id: 'daily-digest-cat',
          name: 'Daily Digest Cat',
          triggerOptions: ['PR opened', 'Bug created', 'Daily schedule', 'Manual trigger', 'Commit pushed'],
          correctTrigger: 'Daily schedule',
          promptHint: 'Summarize all PRs merged, issues closed, and deploys completed in the last 24 hours. Post to the team channel.',
          requiredMcps: ['github', 'jira-linear'],
        },
      ],
    },
  ],

  debrief:
    'The nightshift is fully staffed! Here\'s what each automation does:\n\n' +
    '• **PR Review Cat** (trigger: PR opened) — Automatically reviews every pull request for ' +
    'security issues, missing tests, and code quality. This catches problems before human ' +
    'reviewers even look at the code.\n' +
    '• **Bug Triage Cat** (trigger: Bug created) — When a bug is filed, this agent reads the ' +
    'report, searches the codebase for related files, and writes a preliminary analysis. ' +
    'This gives developers a head start on debugging.\n' +
    '• **Daily Digest Cat** (trigger: Daily schedule) — Every morning, this agent compiles ' +
    'a summary of yesterday\'s activity: merged PRs, closed issues, and deployments.\n\n' +
    'In the real world, automated agents can be configured through Cursor\'s automation features ' +
    'or integrated with CI/CD pipelines, GitHub Actions, or webhook triggers. The key is matching ' +
    'the right trigger to the right task.\n\n' +
    'Pro tip: start with low-risk automations (like summaries and code review suggestions) ' +
    'before graduating to automations that make changes (like auto-fixing lint errors or ' +
    'auto-closing stale issues).',

  realWorldMapping: 'Cursor automated agent workflows, CI/CD-triggered AI agents',

  quiz: [
    {
      question: 'What is the best trigger for an automated code review agent?',
      options: [
        'Every time a file is saved',
        'When a pull request is opened or updated',
        'On a daily schedule',
        'When the developer presses a keyboard shortcut',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why should you start with low-risk automations before ones that make code changes?',
      options: [
        'High-risk automations are more expensive to run',
        'Low-risk automations (summaries, reviews) let you build trust and validate quality before allowing autonomous changes',
        'Cursor limits you to three automations at first',
        'Automated changes always produce bugs',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 85, accessory: 'night-cap', accessoryEmoji: '🌙' },

  hints: [
    { text: 'Match each cat to the event that should wake it up. When does a PR review happen? When does triage happen?', xpCost: 0 },
    { text: 'PR Review → PR opened. Bug Triage → Bug created. Daily Digest → Daily schedule. The names give it away!', xpCost: 10 },
    { text: 'Triggers: PR opened, Bug created, Daily schedule. MCPs: PR Review needs GitHub, Bug Triage needs Jira/Linear, Digest needs both.', xpCost: 25 },
  ],

  parTimeSeconds: 360,
};
