import type { LevelDef } from '../../../types/game';

const yarnBallJs = `// yarnBall.js
function untangle(yarn) {
  let result = [];
  for (let i = 0; i < yarn.length; i++) {
    if (yarn[i].color !== undefined) {
      let strand = yarn[i];
      strand.length = strand.segments.reduce((a, b) => a + b, 0);
      strand.knotted = strand.segments.some(s => s < 0);
      if (!strand.knotted) {
        result.push(strand);
      }
    }
  }
  return result;
}

function sortByLength(strands) {
  return strands.sort((a, b) => a.length - b.length);
}

function getColors(strands) {
  return strands.map(s => s.color);
}

module.exports = { untangle, sortByLength, getColors };`;

const yarnBallTestJs = `// yarnBall.test.js
const { untangle, sortByLength, getColors } = require('./yarnBall');

const sampleYarn = [
  { color: 'red', segments: [10, 20, 15] },
  { color: 'blue', segments: [5, -3, 8] },
  { color: 'green', segments: [30, 25] },
];

describe('yarnBall', () => {
  test('untangle removes knotted strands', () => {
    const result = untangle(sampleYarn);
    expect(result).toHaveLength(2);
    expect(result[0].color).toBe('red');
    expect(result[1].color).toBe('green');
  });

  test('sortByLength sorts ascending', () => {
    const strands = untangle(sampleYarn);
    const sorted = sortByLength(strands);
    expect(sorted[0].length).toBeLessThanOrEqual(sorted[1].length);
  });

  test('getColors returns color names', () => {
    const strands = untangle(sampleYarn);
    expect(getColors(strands)).toEqual(['red', 'green']);
  });
});`;

const yarnUtilsJs = `// yarnUtils.js
function measureStrand(strand) {
  return strand.segments.reduce((sum, seg) => sum + Math.abs(seg), 0);
}

function isKnotted(strand) {
  return strand.segments.some(s => s < 0);
}

function formatStrand(strand) {
  return strand.color + ' (' + strand.length + 'cm)';
}

module.exports = { measureStrand, isKnotted, formatStrand };`;

const yarnApiJs = `// routes/yarnApi.js
const express = require('express');
const router = express.Router();
const { untangle, sortByLength } = require('../yarnBall');
const db = require('../db');

router.get('/yarn', (req, res) => {
  const raw = db.query('SELECT * FROM yarn_inventory');
  const clean = untangle(raw);
  const sorted = sortByLength(clean);
  res.json(sorted);
});

router.post('/yarn', (req, res) => {
  const { color, segments } = req.body;
  db.insert('yarn_inventory', { color, segments: JSON.stringify(segments) });
  res.status(201).json({ success: true });
});

module.exports = router;`;

export const boss1: LevelDef = {
  id: 'boss-1',
  world: 1,
  levelNum: 6,
  title: 'The Yarn Ball Challenge',
  subtitle: 'Combine everything you have learned',
  concept: 'Combine all modes and model selection',
  isBoss: true,

  narrativeIntro:
    'The academy bell rings thirteen times — the signal for a Boss Challenge. Every kitten ' +
    'in World 1 freezes. Professor Whiskers stands before a massive, tangled ball of yarn ' +
    'suspended in a holographic display. Each strand represents a module of the Yarn Ball ' +
    'Inventory System — a legacy codebase so tangled that no single kitten has ever untangled ' +
    'it alone. "This is your final exam," the professor says, his voice unusually serious. ' +
    '"You\'ll need every skill you\'ve learned: Ask mode to understand confusing code, Plan ' +
    'mode to review refactoring strategies, Agent mode to review multi-file changes, and ' +
    'debugging skills to fix what breaks. One mode alone won\'t cut it. A true Cursor Cat ' +
    'knows when to ask, when to plan, when to delegate, and when to investigate." He drops a ' +
    'golden graduation cap onto the desk. "Untangle the yarn, and this is yours." The kittens ' +
    'exchange nervous glances. You take a deep breath, flex your claws, and open Cursor. ' +
    'Let\'s do this.',

  briefing:
    'The Yarn Ball Inventory System needs a full cleanup. Complete four challenges using ' +
    'different Cursor modes: understand a confusing function, review a refactoring plan, ' +
    'audit agent-generated diffs, and debug a test failure after the refactor.',

  challengeSteps: [
    {
      id: 'boss-1-main',
      type: 'multi_step',
      instruction:
        'Complete all four sub-challenges to untangle the Yarn Ball codebase.',
      subSteps: [
        {
          id: 'boss-1-sub1',
          type: 'highlight_and_ask',
          instruction:
            'The `untangle` function is dense and hard to read. Highlight it and ask Cursor ' +
            'to explain what it does step by step.',
          files: [{ name: 'yarnBall.js', content: yarnBallJs, language: 'javascript' }],
          targetLines: [2, 14],
          expectedPrompt: 'explain',
          agentResponse:
            'The `untangle` function processes an array of yarn objects:\n\n' +
            '1. It iterates over each item and checks if it has a `color` property (filtering out invalid entries).\n' +
            '2. For valid strands, it calculates the total `length` by summing all `segments`.\n' +
            '3. It checks if any segment is negative — if so, the strand is marked as `knotted`.\n' +
            '4. Only un-knotted strands (all positive segments) are included in the result.\n\n' +
            'In short: filter out invalid items, compute lengths, discard knotted strands, return clean ones.',
          fixedContent: yarnBallJs,
        },
        {
          id: 'boss-1-sub2',
          type: 'review_plan',
          instruction:
            'Cursor has proposed a refactoring plan for the Yarn Ball system. Review the steps ' +
            'and reject the problematic one.',
          files: [
            { name: 'yarnBall.js', content: yarnBallJs, language: 'javascript' },
            { name: 'yarnUtils.js', content: yarnUtilsJs, language: 'javascript' },
            { name: 'yarnBall.test.js', content: yarnBallTestJs, language: 'javascript' },
          ],
          planSteps: [
            {
              id: 'boss-plan-1',
              text: 'Extract the length calculation and knot detection into separate helper functions in yarnUtils.js (measureStrand and isKnotted already exist there).',
              isBad: false,
            },
            {
              id: 'boss-plan-2',
              text: 'Refactor untangle() to use Array.filter() and the new helper functions instead of a manual for-loop.',
              isBad: false,
            },
            {
              id: 'boss-plan-3',
              text: 'Delete all existing tests since the refactored code will have a different structure and we can write new ones later.',
              isBad: true,
              explanation:
                'Never delete existing tests during a refactor! Tests are your safety net — they verify that the refactored code still produces the same results. Run them after refactoring to catch regressions.',
            },
            {
              id: 'boss-plan-4',
              text: 'Update the route handler in yarnApi.js to use the refactored untangle function and add proper error handling.',
              isBad: false,
            },
          ],
        },
        {
          id: 'boss-1-sub3',
          type: 'agent_diff_review',
          instruction:
            'The agent has applied the refactoring. Review the diffs across all files and ' +
            'flag any issues.',
          files: [
            { name: 'yarnBall.js', content: yarnBallJs, language: 'javascript' },
            { name: 'yarnUtils.js', content: yarnUtilsJs, language: 'javascript' },
            { name: 'routes/yarnApi.js', content: yarnApiJs, language: 'javascript' },
          ],
          diffs: [
            {
              fileName: 'yarnBall.js',
              before:
`function untangle(yarn) {
  let result = [];
  for (let i = 0; i < yarn.length; i++) {
    if (yarn[i].color !== undefined) {
      let strand = yarn[i];
      strand.length = strand.segments.reduce((a, b) => a + b, 0);
      strand.knotted = strand.segments.some(s => s < 0);
      if (!strand.knotted) {
        result.push(strand);
      }
    }
  }
  return result;
}`,
              after:
`const { measureStrand, isKnotted } = require('./yarnUtils');

function untangle(yarn) {
  return yarn
    .filter(strand => strand.color !== undefined)
    .map(strand => ({
      ...strand,
      length: measureStrand(strand),
      knotted: isKnotted(strand),
    }))
    .filter(strand => !strand.knotted);
}`,
              hasIssue: false,
            },
            {
              fileName: 'yarnUtils.js',
              before:
`function measureStrand(strand) {
  return strand.segments.reduce((sum, seg) => sum + Math.abs(seg), 0);
}`,
              after:
`function measureStrand(strand) {
  return strand.segments.reduce((sum, seg) => sum + seg, 0);
}`,
              hasIssue: true,
              issueDescription:
                'The original measureStrand used Math.abs() to sum absolute values of segments. ' +
                'The refactored version removed Math.abs(), changing the behavior. But the original ' +
                'untangle() function summed raw values (not absolute) for the length calculation. ' +
                'This diff makes measureStrand consistent with the original untangle behavior, BUT ' +
                'it changes the existing measureStrand contract. Callers that relied on the old ' +
                'Math.abs() behavior will now get different results — this is a breaking change ' +
                'that needs a follow-up to reconcile.',
            },
            {
              fileName: 'routes/yarnApi.js',
              before:
`router.get('/yarn', (req, res) => {
  const raw = db.query('SELECT * FROM yarn_inventory');
  const clean = untangle(raw);
  const sorted = sortByLength(clean);
  res.json(sorted);
});`,
              after:
`router.get('/yarn', async (req, res) => {
  try {
    const raw = db.query('SELECT * FROM yarn_inventory');
    const clean = untangle(raw);
    const sorted = sortByLength(clean);
    res.json(sorted);
  } catch (error) {
    console.error('Failed to fetch yarn:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});`,
              hasIssue: false,
            },
          ],
          followUpPrompt:
            'The measureStrand function in yarnUtils.js was changed from using Math.abs() to not using it. Create a new measureRawLength() function for the untangle use case and keep the original measureStrand with Math.abs() for existing callers.',
          followUpDiff: {
            fileName: 'yarnUtils.js',
            before:
`function measureStrand(strand) {
  return strand.segments.reduce((sum, seg) => sum + seg, 0);
}`,
            after:
`function measureStrand(strand) {
  return strand.segments.reduce((sum, seg) => sum + Math.abs(seg), 0);
}

function measureRawLength(strand) {
  return strand.segments.reduce((sum, seg) => sum + seg, 0);
}`,
            hasIssue: false,
          },
        },
        {
          id: 'boss-1-sub4',
          type: 'debug_attach',
          instruction:
            'After the refactor, the tests are failing. Attach the test output to Cursor ' +
            'and ask it to diagnose the issue.',
          files: [
            { name: 'yarnBall.test.js', content: yarnBallTestJs, language: 'javascript' },
          ],
          terminalLines: [
            { text: '$ npm test', type: 'info' },
            { text: '', type: 'info' },
            { text: ' FAIL  yarnBall.test.js', type: 'error' },
            { text: '  yarnBall', type: 'info' },
            { text: '    ✓ untangle removes knotted strands (3ms)', type: 'success' },
            { text: '    ✗ sortByLength sorts ascending (2ms)', type: 'error' },
            { text: '    ✓ getColors returns color names (1ms)', type: 'success' },
            { text: '', type: 'info' },
            { text: '  ● yarnBall › sortByLength sorts ascending', type: 'error' },
            { text: '', type: 'info' },
            { text: '    expect(received).toBeLessThanOrEqual(expected)', type: 'error' },
            { text: '', type: 'info' },
            { text: '    Expected: <= 55', type: 'error' },
            { text: '    Received: 45', type: 'info' },
            { text: '', type: 'info' },
            { text: '    Note: strand lengths changed after refactor.', type: 'warning' },
            { text: '    red strand: was 45 (raw sum), now 45 (raw sum) ✓', type: 'info' },
            { text: '    green strand: was 55, now 55 ✓', type: 'info' },
            { text: '    Sort order appears correct but .sort() mutated the original array.', type: 'warning' },
            { text: '', type: 'info' },
            { text: 'Tests: 1 failed, 2 passed, 3 total', type: 'warning' },
          ],
          expectedAttach: 'expect(received).toBeLessThanOrEqual(expected)',
          debugResponse:
            'The `sortByLength` function uses `Array.sort()`, which sorts **in place** and mutates ' +
            'the original array. Because the test calls `untangle()` once and shares the result ' +
            'between tests, the sort in the second test mutates the array that the third test also ' +
            'reads. The fix is to use `.slice().sort()` or `[...strands].sort()` in `sortByLength` ' +
            'to avoid mutating the input:\n\n' +
            '```js\nfunction sortByLength(strands) {\n  return [...strands].sort((a, b) => a.length - b.length);\n}\n```\n\n' +
            'This creates a new sorted array without affecting the original.',
        },
      ],
    },
  ],

  debrief:
    'Congratulations, graduate! You\'ve completed the Kitten Academy\'s final challenge by ' +
    'combining every skill from World 1. Let\'s recap what you demonstrated:\n\n' +
    '1. **Ask mode** to understand unfamiliar code quickly.\n' +
    '2. **Plan mode** to catch a dangerous refactoring step (deleting tests!) before it was executed.\n' +
    '3. **Agent diff review** to spot a subtle behavioral change in a utility function.\n' +
    '4. **Debug skills** to diagnose a mutation bug caused by Array.sort().\n\n' +
    'In real-world development, you\'ll rarely use just one mode. Complex tasks flow naturally ' +
    'between asking questions, reviewing plans, checking diffs, and debugging. The key is ' +
    'recognizing which mode fits the moment. That\'s what separates a Cursor Cat from a ' +
    'regular cat staring at a screen saver.\n\n' +
    'Pro tip: develop a habit of "mode awareness." Before each interaction with Cursor, ask ' +
    'yourself: Am I asking a question? Reviewing a plan? Checking generated code? Debugging? ' +
    'Pick the mode that matches, and you\'ll be far more effective.',

  realWorldMapping: 'Combining Cursor Ask, Plan, Agent, and Debug modes in a real workflow',

  quiz: [
    {
      question: 'When you encounter code you don\'t understand, which mode should you start with?',
      options: [
        'Agent mode to rewrite it',
        'Ask mode to get an explanation',
        'Plan mode to refactor it',
        'Debug mode to find errors',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why should you never delete existing tests during a refactor?',
      options: [
        'Tests are too difficult to rewrite',
        'Tests verify that the refactored code still produces the same results',
        'Deleting files is not allowed in Agent mode',
        'Tests must always increase, never decrease',
      ],
      correctIndex: 1,
    },
    {
      question: 'What caused the sortByLength test failure after the refactor?',
      options: [
        'The sort algorithm was wrong',
        'Array.sort() mutated the original array, affecting other tests',
        'The segments contained negative numbers',
        'The database query returned unsorted results',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 150, accessory: 'graduation-cap', accessoryEmoji: '🎓' },

  hints: [
    { text: 'Take it one sub-challenge at a time. Each uses a different skill you learned in World 1.', xpCost: 0 },
    { text: 'Sub-1: ask for an explanation. Sub-2: look for a destructive plan step. Sub-3: check if function behavior changed. Sub-4: look for array mutation.', xpCost: 10 },
    { text: 'Sub-2: reject "delete all tests." Sub-3: measureStrand lost Math.abs(). Sub-4: sort() mutates in place — use [...arr].sort() instead.', xpCost: 25 },
  ],

  parTimeSeconds: 600,
};
