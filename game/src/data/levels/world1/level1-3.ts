import type { LevelDef } from '../../../types/game';

export const level13: LevelDef = {
  id: '1-3',
  world: 1,
  levelNum: 3,
  title: 'Paws on Keyboard',
  subtitle: 'Let the agent code across multiple files',
  concept: 'Using Agent mode for multi-file, autonomous coding tasks',
  isBoss: false,

  narrativeIntro:
    'The lights dim in the Kitten Academy lab. A holographic terminal flickers to life, ' +
    'projecting file trees and spinning code blocks across the walls. "Today," Professor ' +
    'Whiskers announces, "you graduate from single-line edits to something far more powerful: ' +
    'Agent mode." A collective gasp ripples through the kittens. Agent mode doesn\'t just fix ' +
    'a line — it reads your entire project, creates files, modifies routes, updates tests, and ' +
    'ties everything together. "But with great power comes great responsibility," the professor ' +
    'warns, flicking his tail. "The agent will show you a diff of every change it wants to make. ' +
    'Your job is to review those diffs like a code reviewer — catch mistakes before they ship." ' +
    'He slides a bowl of treats across the desk. "Find the bug in the agent\'s work, and these ' +
    'are yours." Your whiskers twitch. Challenge accepted.',

  briefing:
    'Cursor\'s agent has drafted changes across four files to add a GET /cats endpoint. ' +
    'Review each diff carefully — one of them is missing critical error handling. Find the ' +
    'issue, then prompt the agent to fix it.',

  challengeSteps: [
    {
      id: '1-3-step1',
      type: 'agent_diff_review',
      instruction:
        'Review the four diffs below. One file is missing error handling that could crash ' +
        'the server. Find it and flag the issue, then write a follow-up prompt to fix it.',
      files: [
        {
          name: 'models/cat.js',
          language: 'javascript',
          content:
`// models/cat.js
class Cat {
  constructor(id, name, breed, age) {
    this.id = id;
    this.name = name;
    this.breed = breed;
    this.age = age;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      breed: this.breed,
      age: this.age,
    };
  }
}

module.exports = { Cat };`,
        },
        {
          name: 'routes/cats.js',
          language: 'javascript',
          content:
`// routes/cats.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/cats', (req, res) => {
  const cats = db.query('SELECT * FROM cats');
  res.json(cats);
});

module.exports = router;`,
        },
        {
          name: 'db.js',
          language: 'javascript',
          content:
`// db.js
const Database = require('better-sqlite3');
const db = new Database('./cats.db');

module.exports = {
  query: (sql) => db.prepare(sql).all(),
};`,
        },
        {
          name: 'app.js',
          language: 'javascript',
          content:
`// app.js
const express = require('express');
const catsRouter = require('./routes/cats');
const app = express();

app.use('/api', catsRouter);
app.listen(3000, () => console.log('Server running on :3000'));

module.exports = app;`,
        },
      ],
      diffs: [
        {
          fileName: 'models/cat.js',
          before: '',
          after:
`// models/cat.js
class Cat {
  constructor(id, name, breed, age) {
    this.id = id;
    this.name = name;
    this.breed = breed;
    this.age = age;
  }

  toJSON() {
    return { id: this.id, name: this.name, breed: this.breed, age: this.age };
  }
}

module.exports = { Cat };`,
          hasIssue: false,
        },
        {
          fileName: 'routes/cats.js',
          before: '',
          after:
`// routes/cats.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/cats', (req, res) => {
  const cats = db.query('SELECT * FROM cats');
  res.json(cats);
});

module.exports = router;`,
          hasIssue: true,
          issueDescription:
            'The route handler has no try/catch around the database query. If the query fails ' +
            '(e.g., table missing, DB locked), the server will crash with an unhandled exception ' +
            'instead of returning a 500 error response.',
        },
        {
          fileName: 'db.js',
          before: '',
          after:
`// db.js
const Database = require('better-sqlite3');
const db = new Database('./cats.db');

module.exports = {
  query: (sql) => db.prepare(sql).all(),
};`,
          hasIssue: false,
        },
        {
          fileName: 'app.js',
          before:
`// app.js
const express = require('express');
const app = express();

app.listen(3000, () => console.log('Server running on :3000'));

module.exports = app;`,
          after:
`// app.js
const express = require('express');
const catsRouter = require('./routes/cats');
const app = express();

app.use('/api', catsRouter);
app.listen(3000, () => console.log('Server running on :3000'));

module.exports = app;`,
          hasIssue: false,
        },
      ],
      followUpPrompt: 'Add try/catch error handling to the GET /cats route so the server returns a 500 status with an error message instead of crashing.',
      followUpDiff: {
        fileName: 'routes/cats.js',
        before:
`router.get('/cats', (req, res) => {
  const cats = db.query('SELECT * FROM cats');
  res.json(cats);
});`,
        after:
`router.get('/cats', async (req, res) => {
  try {
    const cats = db.query('SELECT * FROM cats');
    res.json(cats);
  } catch (error) {
    console.error('Failed to fetch cats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});`,
        hasIssue: false,
      },
    },
  ],

  debrief:
    'Well spotted, kitten! You caught the missing error handling before it could crash a ' +
    'production server. In Agent mode, Cursor autonomously edits multiple files to complete ' +
    'a task — adding models, routes, wiring, and more. But it\'s not infallible. Your role ' +
    'as the developer is to review every diff the agent produces, just like a code review. ' +
    'Common things to watch for: missing error handling, forgotten edge cases, hardcoded ' +
    'values, and security oversights. When you spot an issue, write a clear follow-up prompt ' +
    'describing exactly what to fix. The agent will iterate quickly. ' +
    'Pro tip: after an agent finishes, skim each changed file\'s diff. Pay extra attention ' +
    'to route handlers, database calls, and anything touching user input.',

  realWorldMapping: 'Cursor Agent mode — autonomous multi-file coding with diff review',

  quiz: [
    {
      question: 'What should you always do after Agent mode completes its changes?',
      options: [
        'Immediately deploy to production',
        'Review every diff the agent produced',
        'Delete the files and start over',
        'Switch to Ask mode',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why was the routes/cats.js diff flagged?',
      options: [
        'It used the wrong HTTP method',
        'It was missing a database connection',
        'It had no try/catch around the database query, risking server crashes',
        'It returned XML instead of JSON',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 70, accessory: 'keyboard-paws', accessoryEmoji: '⌨️' },

  hints: [
    { text: 'Look at each file\'s diff. One of them interacts with a database without any safety net.', xpCost: 0 },
    { text: 'Database queries can fail. What happens in routes/cats.js if db.query throws an error?', xpCost: 10 },
    { text: 'The GET /cats handler in routes/cats.js needs a try/catch block. Flag it and suggest adding error handling.', xpCost: 25 },
  ],

  parTimeSeconds: 300,
};
