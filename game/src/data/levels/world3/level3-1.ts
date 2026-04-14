import type { LevelDef } from '../../../types/game';

export const level3_1: LevelDef = {
  id: '3-1',
  world: 3,
  levelNum: 1,
  title: 'Cloud Kittens',
  subtitle: 'Send agents to the cloud while you keep coding',
  concept: 'Launching background agents that work in the cloud',
  isBoss: false,

  narrativeIntro:
    'You step into the Cat Colony — a sprawling, bustling workshop where dozens of cats work ' +
    'in parallel, each one focused on a different task. At the center stands Commander Whiskersworth, ' +
    'a battle-scarred tabby with a headset and three monitors. "Welcome to orchestration, recruit," ' +
    'he growls. "In the real world, you don\'t do everything yourself. You delegate." He points to a ' +
    'cloud-shaped portal on the ceiling. "That\'s the Background Agent portal. You toss a task up ' +
    'there — writing tests, refactoring a module, generating docs — and a cloud kitten handles it ' +
    'while you keep working locally." He tosses you two task cards. "One goes to the cloud. One ' +
    'stays with you. A good commander knows which tasks can run unsupervised and which need your ' +
    'eyes on the screen." He leans in. "Don\'t send CSS fixes to the cloud, recruit. Those need ' +
    'visual feedback. Send the grunt work — the tests, the boilerplate, the repetitive stuff. ' +
    'That\'s what background agents are for."',

  briefing:
    'You have two tasks: writing comprehensive unit tests for the auth module (time-consuming, ' +
    'no visual feedback needed) and fixing a CSS bug where header text is black instead of white ' +
    '(quick, needs visual confirmation). Send one to a background agent and fix the other locally.',

  challengeSteps: [
    {
      id: '3-1-step1',
      type: 'launch_background',
      instruction:
        'Review the two tasks below. Send the appropriate task to a background agent in the ' +
        'cloud, and keep the other task for yourself to fix locally.\n\n' +
        '**Task A:** Write comprehensive unit tests for the auth module — test login, logout, ' +
        'token refresh, permission checks, and edge cases. This will generate 200+ lines of test code.\n\n' +
        '**Task B:** Fix the CSS bug: the header text should be white (#fff), not black (#000). ' +
        'This needs visual confirmation in the browser.\n\n' +
        'Which task should go to the background agent?',
      cloudTask: 'Write comprehensive unit tests for the auth module',
      localTask: {
        instruction: 'Fix the CSS bug: the header text should be white, not black',
        files: [
          {
            name: 'header.css',
            content: `.site-header {
  background: #1a1a2e;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-header h1 {
  color: #000; /* BUG: should be #fff for contrast against dark background */
  font-size: 1.5rem;
  font-weight: 600;
}

.site-header nav a {
  color: #6c63ff;
  text-decoration: none;
  margin-left: 16px;
}`,
            language: 'css',
          },
        ],
      },
    },
  ],

  debrief:
    'Smart delegation, recruit! You correctly identified that writing unit tests is the perfect ' +
    'background agent task — it\'s time-consuming, well-defined, doesn\'t need visual feedback, ' +
    'and the agent can work on it independently while you fix the CSS bug locally.\n\n' +
    'In the real world, Cursor\'s Background Agents (also called Cloud Agents) spin up a full ' +
    'development environment in the cloud and work on tasks asynchronously. They can create ' +
    'branches, write code, run tests, and even open pull requests — all while you\'re focused ' +
    'on something else.\n\n' +
    'Best tasks for background agents:\n' +
    '• Writing tests (unit, integration, e2e)\n' +
    '• Refactoring repetitive patterns across many files\n' +
    '• Generating boilerplate (CRUD routes, model schemas)\n' +
    '• Documentation and type definition generation\n\n' +
    'Keep locally: tasks that need visual feedback, interactive debugging, or rapid iteration.\n\n' +
    'Pro tip: write a detailed prompt for background agents. Since you won\'t be there to ' +
    'answer follow-up questions, front-load all the context they need.',

  realWorldMapping: 'Cursor Background Agents (Cloud Agents) for async, parallelized development',

  quiz: [
    {
      question: 'Which type of task is best suited for a background agent?',
      options: [
        'Fixing a visual CSS bug that needs browser confirmation',
        'Writing comprehensive unit tests for a well-defined module',
        'Debugging a race condition that requires step-by-step inspection',
        'Designing a new UI layout that needs frequent visual feedback',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why should you write detailed prompts for background agents?',
      options: [
        'Background agents are less intelligent than foreground agents',
        'Background agents work asynchronously and can\'t ask you follow-up questions',
        'Detailed prompts make the agent work faster',
        'Background agents can only process one sentence at a time',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 80, accessory: 'cloud-badge', accessoryEmoji: '☁️' },

  hints: [
    { text: 'Think about which task needs your eyes on the screen and which can run unsupervised.', xpCost: 0 },
    { text: 'Writing tests is repetitive and well-defined — a background agent can handle it. CSS bugs need visual confirmation.', xpCost: 10 },
    { text: 'Send "Write unit tests for auth module" to the background agent. Fix the CSS color (#000 → #fff) yourself.', xpCost: 25 },
  ],

  parTimeSeconds: 300,
};
