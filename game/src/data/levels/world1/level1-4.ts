import type { LevelDef } from '../../../types/game';

export const level14: LevelDef = {
  id: '1-4',
  world: 1,
  levelNum: 4,
  title: 'Hairball Detective',
  subtitle: 'Track down bugs with terminal output and context',
  concept: 'Using the agent to debug errors with terminal output and context',
  isBoss: false,

  narrativeIntro:
    'A siren wails through the Kitten Academy halls. Red lights flash. "CODE RED!" yells ' +
    'Professor Whiskers, leaping onto the emergency podium. "The Kitten Dashboard is down! ' +
    'Errors everywhere! Hairballs in the pipeline!" The kittens scramble to their stations. ' +
    'On your terminal, stack traces scroll past like angry red yarn. "Don\'t panic," the ' +
    'professor says, adjusting his monocle. "A good Cursor Cat doesn\'t just stare at errors — ' +
    'they attach the terminal output to the chat and let the AI help diagnose. Context is ' +
    'everything." He points to the error log. "Copy that stack trace, paste it into Cursor, ' +
    'and ask what went wrong. The AI can read error messages faster than any cat can chase a ' +
    'laser pointer." You crack your knuckles (do cats have knuckles?) and lean in. Time to ' +
    'play detective.',

  briefing:
    'Two bugs have appeared in the Kitten Dashboard codebase. For each one, attach the ' +
    'terminal error output to Cursor and ask it to diagnose and fix the issue.',

  challengeSteps: [
    {
      id: '1-4-step1',
      type: 'debug_attach',
      instruction:
        'The server crashes on startup with a TypeError. Attach the error output below to ' +
        'Cursor and ask it to find and fix the bug.',
      files: [
        {
          name: 'services/catService.js',
          language: 'javascript',
          content:
`// services/catService.js
const fetch = require('node-fetch');

async function fetchCats() {
  const response = fetch('https://api.kittens.dev/cats');
  const data = response.json();
  return data;
}

async function getCatById(id) {
  const cats = await fetchCats();
  return cats.find(cat => cat.id === id);
}

module.exports = { fetchCats, getCatById };`,
        },
      ],
      terminalLines: [
        { text: '$ node server.js', type: 'info' },
        { text: 'Server starting on port 3000...', type: 'info' },
        { text: '', type: 'info' },
        { text: 'TypeError: response.json is not a function', type: 'error' },
        { text: '    at fetchCats (services/catService.js:5:24)', type: 'error' },
        { text: '    at getCatById (services/catService.js:10:16)', type: 'error' },
        { text: '    at Object.<anonymous> (server.js:12:3)', type: 'error' },
        { text: '', type: 'info' },
        { text: 'Process exited with code 1', type: 'error' },
      ],
      expectedAttach: 'TypeError: response.json is not a function',
      debugResponse:
        'The issue is in `fetchCats()` on line 4: `fetch()` returns a Promise, but the `await` ' +
        'keyword is missing. Without `await`, `response` is a Promise object (not a Response), ' +
        'so calling `.json()` on it fails. The same issue occurs on line 5 — `.json()` also ' +
        'returns a Promise that needs `await`.\n\n' +
        '**Fix:** Add `await` to both lines:\n' +
        '```js\nconst response = await fetch(...);\nconst data = await response.json();\n```',
    },
    {
      id: '1-4-step2',
      type: 'debug_attach',
      instruction:
        'A unit test is failing with unexpected output. Attach the test failure to Cursor ' +
        'and ask it to fix the logic bug.',
      files: [
        {
          name: 'utils/ageCalculator.js',
          language: 'javascript',
          content:
`// utils/ageCalculator.js

function catYearsToHuman(catAge) {
  if (catAge <= 0) return 0;
  if (catAge === 1) return 15;
  if (catAge === 2) return 24;
  return 24 + (catAge - 2) * 4;
}

function isKitten(catAge) {
  return catAge > 1;
}

module.exports = { catYearsToHuman, isKitten };`,
        },
        {
          name: 'utils/ageCalculator.test.js',
          language: 'javascript',
          content:
`// utils/ageCalculator.test.js
const { catYearsToHuman, isKitten } = require('./ageCalculator');

describe('ageCalculator', () => {
  test('converts 1 cat year to 15 human years', () => {
    expect(catYearsToHuman(1)).toBe(15);
  });

  test('converts 3 cat years to 28 human years', () => {
    expect(catYearsToHuman(3)).toBe(28);
  });

  test('kittens are cats under 1 year old', () => {
    expect(isKitten(0.5)).toBe(true);
    expect(isKitten(2)).toBe(false);
  });
});`,
        },
      ],
      terminalLines: [
        { text: '$ npm test', type: 'info' },
        { text: '', type: 'info' },
        { text: ' PASS  utils/ageCalculator.test.js', type: 'info' },
        { text: '  ageCalculator', type: 'info' },
        { text: '    ✓ converts 1 cat year to 15 human years (2ms)', type: 'success' },
        { text: '    ✓ converts 3 cat years to 28 human years (1ms)', type: 'success' },
        { text: '    ✗ kittens are cats under 1 year old (3ms)', type: 'error' },
        { text: '', type: 'info' },
        { text: '  ● ageCalculator › kittens are cats under 1 year old', type: 'error' },
        { text: '', type: 'info' },
        { text: '    expect(received).toBe(expected)', type: 'error' },
        { text: '', type: 'info' },
        { text: '    Expected: true', type: 'error' },
        { text: '    Received: false', type: 'error' },
        { text: '', type: 'info' },
        { text: '      12 |   test(\'kittens are cats under 1 year old\', () => {', type: 'info' },
        { text: '      13 |     expect(isKitten(0.5)).toBe(true);  // <-- FAILS', type: 'error' },
        { text: '      14 |     expect(isKitten(2)).toBe(false);', type: 'info' },
        { text: '', type: 'info' },
        { text: 'Tests: 1 failed, 2 passed, 3 total', type: 'warning' },
      ],
      expectedAttach: 'expect(received).toBe(expected)',
      debugResponse:
        'The `isKitten` function has inverted logic. It currently returns `catAge > 1`, which ' +
        'means a 0.5-year-old cat returns `false` (not a kitten) and a 2-year-old returns ' +
        '`true` (is a kitten) — the exact opposite of what\'s correct.\n\n' +
        '**Fix:** Change the comparison operator:\n' +
        '```js\nfunction isKitten(catAge) {\n  return catAge < 1;\n}\n```\n\n' +
        'A kitten is a cat *under* 1 year old, so we need `<` not `>`.',
    },
  ],

  debrief:
    'Great detective work, kitten! You diagnosed two common bugs by attaching terminal ' +
    'output to Cursor. The first was a missing `await` — one of the most frequent async/await ' +
    'pitfalls in JavaScript. The second was inverted boolean logic, a subtle bug that passes ' +
    'a quick glance but fails under test. In the real world, when you hit an error, copy the ' +
    'relevant terminal output (stack trace, test failure, build error) and paste it into ' +
    'Cursor\'s chat. The AI uses that context to pinpoint the issue faster than reading ' +
    'through code manually. You can also attach specific files with @-mentions to give the ' +
    'AI more context. ' +
    'Pro tip: include the full stack trace, not just the error message. The file paths and ' +
    'line numbers in the trace are crucial for accurate diagnosis.',

  realWorldMapping: 'Attaching terminal output and error logs to Cursor chat for AI-assisted debugging',

  quiz: [
    {
      question: 'When debugging with Cursor, what should you attach to the chat?',
      options: [
        'Only the error message, one line is enough',
        'The full stack trace and relevant terminal output',
        'A screenshot of your desktop',
        'The entire project codebase',
      ],
      correctIndex: 1,
    },
    {
      question: 'What was the root cause of the TypeError in step 1?',
      options: [
        'The API URL was wrong',
        'node-fetch was not installed',
        'The fetch() call was missing await, so response was a Promise instead of a Response',
        'The server port was already in use',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 80, accessory: 'detective-magnifier', accessoryEmoji: '🔍' },

  hints: [
    { text: 'Read the error messages carefully. They tell you exactly which line and function failed.', xpCost: 0 },
    { text: 'In step 1, look at line 4 of catService.js. What does fetch() return without await?', xpCost: 10 },
    { text: 'Step 1: add "await" before fetch() and response.json(). Step 2: isKitten uses ">" but should use "<".', xpCost: 25 },
  ],

  parTimeSeconds: 300,
};
