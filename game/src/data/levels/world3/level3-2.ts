import type { LevelDef } from '../../../types/game';

export const level3_2: LevelDef = {
  id: '3-2',
  world: 3,
  levelNum: 2,
  title: 'The Assembly Line',
  subtitle: 'Break big features into agent-sized tasks',
  concept: 'Breaking a large task into subtasks for multiple agents',
  isBoss: false,

  narrativeIntro:
    'Commander Whiskersworth leads you to the Colony\'s war room — a circular chamber with a ' +
    'massive holographic table at the center. Floating above it is the spec for a new feature: ' +
    '"Cat Adoption Application." It\'s enormous. User auth, cat listings, adoption forms, an ' +
    'admin dashboard, email notifications — the whole nine lives. "A single agent tackling all ' +
    'of this would be like one cat herding a hundred mice," the Commander says. "It\'d get ' +
    'confused, lose context, and produce spaghetti. Instead, we decompose." He swipes the ' +
    'hologram, and the feature splits into distinct colored blocks. "Each block is a focused ' +
    'subtask — small enough for one agent to handle well, large enough to be meaningful. The ' +
    'trick is finding the right granularity." He slides the spec to you. "Break it down, recruit. ' +
    'Think about boundaries: which pieces are independent? Which have shared interfaces? ' +
    'Where are the natural seams?" He taps his clipboard. "Minimum three subtasks. Make them clean."',

  briefing:
    'A feature request for a "Cat Adoption Application" needs to be broken into independent ' +
    'subtasks that can be assigned to separate agents. Read the feature description and decompose ' +
    'it into at least 3 clear, focused subtasks.',

  challengeSteps: [
    {
      id: '3-2-step1',
      type: 'decompose_tasks',
      instruction:
        'Read the feature description below and break it into subtasks. Each subtask should be:\n' +
        '• Focused on one concern (auth, UI, data, etc.)\n' +
        '• Independent enough to be worked on in parallel\n' +
        '• Clear about its inputs, outputs, and boundaries\n\n' +
        '**Feature: Cat Adoption Application**\n' +
        'Build a cat adoption application with:\n' +
        '- User authentication (signup, login, password reset)\n' +
        '- Cat listing page (browse available cats, filter by breed/age)\n' +
        '- Adoption form (submit adoption request with personal details)\n' +
        '- Admin dashboard (view/approve/reject adoption requests)\n' +
        '- Email notifications (confirmation emails, status updates)\n\n' +
        'Create at least 3 subtasks that cover this feature.',
      featureDescription:
        'Build a cat adoption application with: user auth, cat listing page, adoption form, ' +
        'admin dashboard, and email notifications',
      minSubtasks: 3,
    },
  ],

  debrief:
    'Excellent decomposition, recruit! Breaking large features into agent-sized subtasks is one ' +
    'of the most important skills in AI-assisted development. Here\'s why it matters:\n\n' +
    '• **Context limits**: AI models have finite context windows. A task that touches 5 modules ' +
    'simultaneously will lose important details. Smaller tasks stay within context limits.\n' +
    '• **Parallelism**: Independent subtasks can run as separate background agents simultaneously, ' +
    'dramatically speeding up development.\n' +
    '• **Quality**: A focused agent produces better code than one juggling too many concerns.\n' +
    '• **Reviewability**: Smaller PRs are easier to review than a single 2000-line monster.\n\n' +
    'A good decomposition follows natural architectural boundaries: authentication is separate from ' +
    'UI, data models are separate from API routes, and email notifications are their own service.\n\n' +
    'Pro tip: when decomposing, define the interfaces between subtasks first (shared types, API ' +
    'contracts, database schemas). This prevents agents from making incompatible assumptions.',

  realWorldMapping: 'Task decomposition for parallel AI agent workflows',

  quiz: [
    {
      question: 'Why should you break large features into subtasks before assigning them to AI agents?',
      options: [
        'AI agents can only write 50 lines of code at a time',
        'Smaller, focused tasks produce better results and can run in parallel',
        'Cursor charges per subtask, so smaller tasks are cheaper',
        'Large features are not supported by Agent mode',
      ],
      correctIndex: 1,
    },
    {
      question: 'What should you define between subtasks to prevent incompatible implementations?',
      options: [
        'Code comments explaining the full feature',
        'Shared interfaces, API contracts, and database schemas',
        'A single test file that covers all subtasks',
        'A timeline with deadlines for each agent',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 85, accessory: 'assembly-hat', accessoryEmoji: '🏭' },

  hints: [
    { text: 'Look for natural boundaries in the feature: auth is separate from cat listings, which is separate from admin tools.', xpCost: 0 },
    { text: 'Good subtask boundaries: (1) Auth system, (2) Cat listing + search, (3) Adoption form + workflow, (4) Admin dashboard, (5) Email notifications.', xpCost: 10 },
    { text: 'You need at least 3. A clean split: "Implement user auth with signup/login/reset", "Build cat listing page with filtering", and "Create adoption form, admin dashboard, and email notifications".', xpCost: 25 },
  ],

  parTimeSeconds: 360,
};
