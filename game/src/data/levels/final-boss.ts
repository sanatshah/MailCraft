import type { LevelDef } from '../../types/game';

export const finalBoss: LevelDef = {
  id: 'final',
  world: 0,
  levelNum: 1,
  title: 'The Cursor Cat Championship',
  subtitle: 'Prove you are a true Cursor Cat Master',
  concept: 'Comprehensive challenge testing everything learned',
  isBoss: true,

  narrativeIntro:
    'The stadium is packed. Thousands of cats fill the stands, their eyes reflecting the glow ' +
    'of massive floating screens. Fireworks shaped like fish burst above the arena. A booming ' +
    'voice echoes: "WELCOME TO THE CURSOR CAT CHAMPIONSHIP!" At center stage, a golden throne ' +
    'sits empty — the seat of the Cursor Cat Master, vacant for three generations. Professor ' +
    'Whiskers, Madame Fluffington, and Commander Whiskersworth stand together as judges. "To ' +
    'claim the championship," Professor Whiskers announces, "you must demonstrate mastery of ' +
    'EVERY skill: choosing the right tool, configuring your environment, making quick edits, ' +
    'reviewing complex changes, and auditing AI-generated code." Madame Fluffington adds: "No ' +
    'hints, no shortcuts, no safety net. This is everything you\'ve learned, all at once." ' +
    'Commander Whiskersworth salutes. "Make us proud, recruit." The crowd falls silent. The ' +
    'championship trophy gleams under the spotlight. You crack your knuckles, flex your claws, ' +
    'and step into the arena. This is it.',

  briefing:
    'The Championship is five rounds, each testing a skill from a different world. Complete all ' +
    'five to claim the trophy: pick the right model, write project rules, make a quick fix, ' +
    'review multi-file changes, and perform a final code review. No partial credit.',

  challengeSteps: [
    {
      id: 'final-main',
      type: 'multi_step',
      instruction:
        'Complete all five Championship rounds to claim the Cursor Cat Master title.',
      subSteps: [
        {
          id: 'final-sub1',
          type: 'model_select',
          instruction:
            'Round 1 — Model Mastery (World 1): Three scenarios, three different requirements. ' +
            'Pick the right AI model for each situation.',
          scenarios: [
            {
              id: 'final-scenario-1',
              description:
                'You need to refactor a massive 3,000-line legacy module into smaller files ' +
                'with proper TypeScript types. The task requires deep reasoning across many ' +
                'interdependent functions.',
              correctBreedId: 'persian',
              explanation:
                'A large, complex refactoring task with deep interdependencies calls for the ' +
                'most capable model — the "Persian" (Claude/GPT-4 class). Smaller models would ' +
                'lose track of the relationships between functions.',
            },
            {
              id: 'final-scenario-2',
              description:
                'You\'re writing a quick script to rename files in a directory. It\'s a ' +
                'straightforward task — loop through files, apply a naming pattern, done.',
              correctBreedId: 'alley',
              explanation:
                'A simple, well-defined script needs a fast, cheap model — the "Alley Cat" ' +
                '(GPT-4o-mini/Haiku class). No need to use a heavy model for file renaming.',
            },
            {
              id: 'final-scenario-3',
              description:
                'You need to add comprehensive error handling to 15 API route handlers. Each ' +
                'handler follows the same pattern but needs customized error messages.',
              correctBreedId: 'siamese',
              explanation:
                'A medium-complexity task with repetitive patterns but some customization. ' +
                'The "Siamese" (Claude Sonnet/GPT-4o class) balances intelligence and speed ' +
                'for this kind of patterned work.',
            },
          ],
          minCorrect: 2,
        },
        {
          id: 'final-sub2',
          type: 'write_rules',
          instruction:
            'Round 2 — Rule Writing (World 2): Write three rules for a production API:\n' +
            '1. All endpoints must have input validation\n' +
            '2. Use structured logging with request IDs\n' +
            '3. Return standardized error responses with status codes',
          requiredRules: ['validation', 'logging', 'error'],
          beforeCode:
`// routes/users.ts
app.post('/users', (req, res) => {
  const user = db.insert('users', req.body);
  console.log('created user');
  res.json(user);
});

app.get('/users/:id', (req, res) => {
  const user = db.findById('users', req.params.id);
  if (!user) {
    res.status(404).send('not found');
    return;
  }
  res.json(user);
});`,
          afterCode:
`// routes/users.ts
import { z } from 'zod';
import { logger } from '../lib/logger';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

app.post('/users', (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn({ requestId: req.id, errors: parsed.error.issues }, 'Validation failed');
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues, status: 400 });
  }
  const user = db.insert('users', parsed.data);
  logger.info({ requestId: req.id, userId: user.id }, 'User created');
  res.status(201).json({ data: user, status: 201 });
});

app.get('/users/:id', (req, res) => {
  const user = db.findById('users', req.params.id);
  if (!user) {
    logger.warn({ requestId: req.id, userId: req.params.id }, 'User not found');
    return res.status(404).json({ error: 'User not found', status: 404 });
  }
  logger.info({ requestId: req.id }, 'User retrieved');
  res.json({ data: user, status: 200 });
});`,
        },
        {
          id: 'final-sub3',
          type: 'highlight_and_ask',
          instruction:
            'Round 3 — Quick Fix (World 1): The authentication middleware has a critical bug — ' +
            'it checks the token but never rejects expired tokens. Highlight the issue and ask ' +
            'Cursor to fix it.',
          files: [
            {
              name: 'middleware/auth.ts',
              content:
`// middleware/auth.ts
import jwt from 'jsonwebtoken';

export function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    // Token is invalid or expired, but we let them through anyway
    req.user = null;
    next();
  }
}`,
              language: 'typescript',
            },
          ],
          targetLines: [13, 16],
          expectedPrompt: 'reject',
          agentResponse:
            'Fixed! The catch block now properly rejects invalid and expired tokens with a ' +
            '401 response instead of silently passing them through with a null user.',
          fixedContent:
`// middleware/auth.ts
import jwt from 'jsonwebtoken';

export function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}`,
        },
        {
          id: 'final-sub4',
          type: 'agent_diff_review',
          instruction:
            'Round 4 — Diff Review (World 1): An agent refactored the database module. ' +
            'Review the diffs and spot the issue.',
          files: [
            {
              name: 'database/connection.ts',
              content:
`// database/connection.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function transaction(fn: (client: any) => Promise<any>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}`,
              language: 'typescript',
            },
          ],
          diffs: [
            {
              fileName: 'database/connection.ts',
              before:
`const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});`,
              after:
`const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false },
});`,
              hasIssue: true,
              issueDescription:
                'Setting ssl.rejectUnauthorized to false disables SSL certificate verification, ' +
                'making the database connection vulnerable to man-in-the-middle attacks. In production, ' +
                'SSL should be enabled WITH certificate verification. If self-signed certs are needed, ' +
                'provide the CA certificate explicitly instead of disabling verification.',
            },
            {
              fileName: 'database/connection.ts',
              before:
`export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}`,
              after:
`export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows;
}`,
              hasIssue: false,
            },
          ],
          followUpPrompt:
            'Remove ssl.rejectUnauthorized: false from the pool config. Instead, only enable SSL ' +
            'when DATABASE_SSL env var is set, and use the CA cert from DATABASE_CA_CERT.',
          followUpDiff: {
            fileName: 'database/connection.ts',
            before:
`const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false },
});`,
            after:
`const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  ...(process.env.DATABASE_SSL === 'true' && {
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DATABASE_CA_CERT,
    },
  }),
});`,
            hasIssue: false,
          },
        },
        {
          id: 'final-sub5',
          type: 'review_pr',
          instruction:
            'Round 5 — Final Review (World 3): One last PR before you can claim the trophy. ' +
            'An agent built an admin endpoint. Find the issue.',
          prs: [
            {
              id: 'final-pr',
              title: 'Add admin delete-user endpoint',
              diff: {
                fileName: 'routes/admin.ts',
                before:
`// routes/admin.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
const router = Router();

router.use(authMiddleware);

// TODO: add admin endpoints

export default router;`,
                after:
`// routes/admin.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { db } from '../database';
const router = Router();

router.use(authMiddleware);

router.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  await db.query('DELETE FROM sessions WHERE user_id = ?', [id]);
  await db.query('DELETE FROM orders WHERE user_id = ?', [id]);
  res.json({ success: true, message: 'User and related data deleted' });
});

export default router;`,
                hasIssue: true,
                issueDescription:
                  'Missing authorization check! The endpoint uses authMiddleware (authentication) ' +
                  'but never verifies that the authenticated user has admin privileges. Any logged-in ' +
                  'user can delete any other user. The endpoint needs a role/permission check like ' +
                  '"if (req.user.role !== \'admin\') return res.status(403).json({ error: \'Forbidden\' })".',
              },
              issueType: 'security',
              issueDescription:
                'Missing authorization: the endpoint authenticates the user but never checks if they have admin privileges. Any authenticated user can delete any other user.',
            },
          ],
        },
      ],
    },
  ],

  debrief:
    'The crowd erupts! Confetti rains from the sky as you take your place on the golden throne! ' +
    'You are now a CURSOR CAT MASTER — the first in three generations!\n\n' +
    'Let\'s review the Championship rounds and what they represent:\n\n' +
    '**Round 1 — Model Mastery**: Choosing the right model for the task saves time and money. ' +
    'Heavy reasoning tasks need capable models; simple scripts need fast ones.\n\n' +
    '**Round 2 — Rule Writing**: Project rules are the foundation of consistent AI output. ' +
    'Validation, logging, and error handling rules prevent entire categories of bugs.\n\n' +
    '**Round 3 — Quick Fix**: Ask mode for surgical edits. The auth middleware bug (silently ' +
    'passing through expired tokens) is a real-world vulnerability that appears in production ' +
    'codebases.\n\n' +
    '**Round 4 — Diff Review**: Disabling SSL verification is a common "quick fix" that ' +
    'introduces security vulnerabilities. Always verify certificates in production.\n\n' +
    '**Round 5 — Final Review**: Authentication ≠ authorization. Just because a user is logged ' +
    'in doesn\'t mean they should be able to delete other users. Always check roles.\n\n' +
    'You\'ve proven that you can work WITH AI, not just alongside it. You know when to ask, ' +
    'when to plan, when to delegate, when to review, and when to reject. That\'s what makes ' +
    'a Cursor Cat Master. Congratulations! 🏆',

  realWorldMapping: 'Complete mastery of Cursor: model selection, rules, Ask mode, diff review, and code review',

  quiz: [
    {
      question: 'What is the difference between authentication and authorization?',
      options: [
        'They are the same thing',
        'Authentication verifies WHO you are; authorization verifies WHAT you can do',
        'Authentication is for APIs; authorization is for UIs',
        'Authorization happens before authentication',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why is setting rejectUnauthorized: false dangerous for database connections?',
      options: [
        'It makes the database slower',
        'It disables SSL entirely, exposing data in plaintext',
        'It disables certificate verification, making the connection vulnerable to man-in-the-middle attacks',
        'It prevents the database from accepting connections',
      ],
      correctIndex: 2,
    },
    {
      question: 'What is the most important skill a developer needs when working with AI coding assistants?',
      options: [
        'Typing speed to write prompts faster',
        'Critical review of AI-generated code — trusting but always verifying',
        'Memorizing every keyboard shortcut',
        'Knowing how to disable all AI suggestions',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 200, accessory: 'championship-trophy', accessoryEmoji: '🏆' },

  hints: [
    { text: 'Each round tests a different skill. Take them one at a time and draw on what you learned in each World.', xpCost: 0 },
    { text: 'Round 1: big refactor = strongest model. Round 3: the catch block silently continues. Round 5: authentication is not authorization.', xpCost: 10 },
    { text: 'Round 1: Persian, Alley, Siamese. Round 3: the catch block should reject with 401. Round 4: rejectUnauthorized:false is a security risk. Round 5: no admin role check on a delete endpoint.', xpCost: 25 },
  ],

  parTimeSeconds: 900,
};
