import type { LevelDef } from '../../../types/game';

const greetingJs = `// greeting.js
function greet(x) {
  const message = "Welcoem, " + x + "!";
  console.log(message);
}

greet("Whiskers");
greet("Professor Paws");`;

const greetingJsFixedTypo = `// greeting.js
function greet(x) {
  const message = "Welcome, " + x + "!";
  console.log(message);
}

greet("Whiskers");
greet("Professor Paws");`;

const greetingJsRenamed = `// greeting.js
function greet(userName) {
  const message = "Welcome, " + userName + "!";
  console.log(message);
}

greet("Whiskers");
greet("Professor Paws");`;

const greetingJsWithReturn = `// greeting.js
function greet(userName) {
  const message = "Welcome, " + userName + "!";
  console.log(message);
  return message;
}

greet("Whiskers");
greet("Professor Paws");`;

export const level11: LevelDef = {
  id: '1-1',
  world: 1,
  levelNum: 1,
  title: 'First Meow',
  subtitle: 'Learn to ask your AI assistant quick questions',
  concept: 'Using Ask mode for quick, inline questions and edits',
  isBoss: false,

  narrativeIntro:
    'Welcome to the Kitten Academy, young apprentice! Your cat companion stretches ' +
    'lazily across the keyboard and blinks at the glowing screen. "Every great Cursor Cat ' +
    'starts with a single meow," purrs Professor Whiskers from the top of the bookshelf. ' +
    '"Ask mode is your bread and butter — a quick paw-tap to fix a typo, rename a variable, ' +
    'or add a missing line. No grand plans, no sweeping refactors. Just you, a highlight, ' +
    'and a simple question." The classroom smells of tuna treats and fresh code. A chalkboard ' +
    'reads: SELECT → ASK → DONE. Three simple words. Your tail twitches with excitement. ' +
    'Today you will learn to speak to the AI the way cats speak to cans of tuna: directly ' +
    'and without hesitation. Highlight the code, type your request, and watch the magic happen. ' +
    'Let\'s begin with the most important skill any kitten can learn — asking for help.',

  briefing:
    'A fellow kitten left some messy code in greeting.js. Use Ask mode three times: ' +
    'fix a typo, rename a confusing variable, and add a missing return statement.',

  challengeSteps: [
    {
      id: '1-1-step1',
      type: 'highlight_and_ask',
      instruction:
        'Highlight line 3 where "Welcoem" is misspelled and ask Cursor to fix the typo.',
      files: [{ name: 'greeting.js', content: greetingJs, language: 'javascript' }],
      targetLines: [3, 3],
      expectedPrompt: 'fix',
      agentResponse:
        "Fixed the typo: 'Welcoem' → 'Welcome'. The greeting message now reads correctly.",
      fixedContent: greetingJsFixedTypo,
    },
    {
      id: '1-1-step2',
      type: 'highlight_and_ask',
      instruction:
        'The parameter `x` is not descriptive. Highlight the function and ask Cursor to rename it to something meaningful.',
      files: [{ name: 'greeting.js', content: greetingJsFixedTypo, language: 'javascript' }],
      targetLines: [1, 4],
      expectedPrompt: 'rename',
      agentResponse:
        "Renamed parameter 'x' to 'userName' throughout the function for better readability.",
      fixedContent: greetingJsRenamed,
    },
    {
      id: '1-1-step3',
      type: 'highlight_and_ask',
      instruction:
        'The function logs the message but never returns it. Highlight the function body and ask Cursor to add a return statement.',
      files: [{ name: 'greeting.js', content: greetingJsRenamed, language: 'javascript' }],
      targetLines: [1, 5],
      expectedPrompt: 'return',
      agentResponse:
        'Added a return statement so callers can use the greeting message.',
      fixedContent: greetingJsWithReturn,
    },
  ],

  debrief:
    'Excellent work, kitten! You just used Ask mode three times to make quick, surgical edits. ' +
    'In the real world, Ask mode (Cmd/Ctrl+K) is your go-to for small, focused changes — ' +
    'fixing a typo, renaming a symbol, or inserting a line or two. It keeps you in flow ' +
    'because you never leave your editor. Remember: highlight first, then describe what you ' +
    'want in plain English. The AI reads the selected code as context and responds with a ' +
    'targeted edit. No need to explain the whole project — just point and ask. ' +
    'Pro tip: the more specific your prompt, the better the result. "Fix the typo" beats ' +
    '"make this better" every time.',

  realWorldMapping: 'Cursor Ask mode (Cmd/Ctrl+K inline edit)',

  quiz: [
    {
      question: 'When is Ask mode most useful?',
      options: [
        'When you need to refactor an entire project',
        'When you have a quick, focused edit on a few lines',
        'When you want the AI to build a feature from scratch',
        'When you need to run terminal commands',
      ],
      correctIndex: 1,
    },
    {
      question: 'What should you do before typing an Ask mode prompt?',
      options: [
        'Close all other files',
        'Write a detailed project specification',
        'Highlight the relevant code you want to change',
        'Switch to a different AI model',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 50, accessory: 'tiny-bell', accessoryEmoji: '🔔' },

  hints: [
    { text: 'Select the code with the issue, then press Cmd/Ctrl+K to open the Ask bar.', xpCost: 0 },
    { text: 'Type a short, direct instruction like "fix the typo" or "rename x to userName".', xpCost: 10 },
    { text: 'For step 3, highlight the function body and type "add a return statement for the message variable".', xpCost: 25 },
  ],

  parTimeSeconds: 180,
};
