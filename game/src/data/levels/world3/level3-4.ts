import type { LevelDef } from '../../../types/game';

export const level3_4: LevelDef = {
  id: '3-4',
  world: 3,
  levelNum: 4,
  title: 'Herding Cats',
  subtitle: 'Review AI-generated code like a senior engineer',
  concept: 'Best practices for reviewing AI-generated code',
  isBoss: false,

  narrativeIntro:
    'Commander Whiskersworth slams three pull requests onto his desk. "The background agents ' +
    'finished their work overnight," he says, not looking up from his coffee. "But here\'s the ' +
    'thing about agents, recruit — they\'re fast, they\'re tireless, and they\'re confidently ' +
    'wrong about 10% of the time." He pushes the PRs toward you. "Your job is to catch that ' +
    '10%." He takes a long sip. "Most developers rubber-stamp AI-generated code because it ' +
    'looks clean and passes a cursory glance. Don\'t be that developer. Every PR from an agent ' +
    'deserves the same scrutiny you\'d give to a junior developer\'s first contribution." He ' +
    'taps the three PRs. "One has a security hole. One is over-engineered. One is missing tests. ' +
    'Find all three issues, and you\'ll earn the Reviewer\'s Glasses — the mark of a cat who ' +
    'can tell good code from great-looking bad code." He looks you dead in the eye. "Trust, ' +
    'but verify. Always verify."',

  briefing:
    'Three pull requests from background agents are waiting for your review. Each one has a ' +
    'different category of issue. Find the problem in each PR: a security vulnerability, ' +
    'unnecessary complexity, and missing test coverage.',

  challengeSteps: [
    {
      id: '3-4-step1',
      type: 'review_pr',
      instruction:
        'Review all three PRs. For each one, identify the issue and classify it.\n\n' +
        '**PR #1** — "Add user search endpoint"\n' +
        '**PR #2** — "Implement config loader"\n' +
        '**PR #3** — "Add payment processing"',
      prs: [
        {
          id: 'pr-1',
          title: 'Add user search endpoint',
          diff: {
            fileName: 'routes/search.ts',
            before:
`// routes/search.ts
import { Router } from 'express';
const router = Router();

// TODO: implement user search
router.get('/search', (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;`,
            after:
`// routes/search.ts
import { Router } from 'express';
import { db } from '../database';
const router = Router();

router.get('/search', async (req, res) => {
  const { q } = req.query;
  const users = await db.query(
    \`SELECT id, name, email FROM users WHERE name LIKE '%\${q}%'\`
  );
  res.json({ data: users });
});

export default router;`,
            hasIssue: true,
            issueDescription:
              'SQL Injection vulnerability! The search query interpolates user input directly ' +
              'into the SQL string using template literals. An attacker could input malicious ' +
              'SQL via the `q` parameter. The fix: use parameterized queries — ' +
              '`db.query("SELECT ... WHERE name LIKE ?", [`%${q}%`])`.',
          },
          issueType: 'security',
          issueDescription:
            'SQL Injection: user input is interpolated directly into the SQL query string instead of using parameterized queries.',
        },
        {
          id: 'pr-2',
          title: 'Implement config loader',
          diff: {
            fileName: 'utils/config.ts',
            before:
`// utils/config.ts
export function getConfig(key: string): string {
  return process.env[key] ?? '';
}`,
            after:
`// utils/config.ts
import { z } from 'zod';
import { createHash } from 'crypto';
import { EventEmitter } from 'events';

const ConfigSchema = z.object({
  DATABASE_URL: z.string(),
  API_KEY: z.string(),
  PORT: z.string().default('3000'),
});

class ConfigWatcher extends EventEmitter {
  private cache = new Map<string, { value: string; hash: string; timestamp: number }>();
  private refreshInterval: NodeJS.Timer;
  private validators = new Map<string, z.ZodType>();

  constructor(private refreshMs = 5000) {
    super();
    this.refreshInterval = setInterval(() => this.refresh(), this.refreshMs);
    this.registerValidators();
  }

  private registerValidators() {
    const schema = ConfigSchema.shape;
    for (const [key, validator] of Object.entries(schema)) {
      this.validators.set(key, validator);
    }
  }

  private computeHash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private refresh() {
    for (const [key, entry] of this.cache) {
      const current = process.env[key] ?? '';
      const hash = this.computeHash(current);
      if (hash !== entry.hash) {
        this.cache.set(key, { value: current, hash, timestamp: Date.now() });
        this.emit('change', key, current);
      }
    }
  }

  get(key: string): string {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.refreshMs) {
      return cached.value;
    }
    const value = process.env[key] ?? '';
    const hash = this.computeHash(value);
    this.cache.set(key, { value, hash, timestamp: Date.now() });
    const validator = this.validators.get(key);
    if (validator) validator.parse(value);
    return value;
  }

  destroy() { clearInterval(this.refreshInterval); }
}

export const config = new ConfigWatcher();
export function getConfig(key: string): string {
  return config.get(key);
}`,
            hasIssue: true,
            issueDescription:
              'Massive over-engineering! The original was a simple 3-line function. The replacement ' +
              'adds SHA-256 hashing, an event emitter, a polling refresh loop, Zod validation, ' +
              'and a cache with timestamps — all to read environment variables that don\'t change ' +
              'at runtime. This adds complexity, dependencies, and potential bugs for zero benefit.',
          },
          issueType: 'complexity',
          issueDescription:
            'Over-engineered: a simple env var reader was replaced with a 60-line class featuring caching, hashing, polling, and event emission for variables that don\'t change at runtime.',
        },
        {
          id: 'pr-3',
          title: 'Add payment processing',
          diff: {
            fileName: 'services/payment.ts',
            before:
`// services/payment.ts
// TODO: implement payment processing`,
            after:
`// services/payment.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY!);

export async function chargeUser(userId: string, amount: number, currency: string) {
  const customer = await stripe.customers.retrieve(userId);
  const charge = await stripe.charges.create({
    amount: Math.round(amount * 100),
    currency,
    customer: customer.id,
    description: 'Cat adoption fee',
  });
  return { success: true, chargeId: charge.id };
}

export async function refundCharge(chargeId: string) {
  const refund = await stripe.refunds.create({ charge: chargeId });
  return { success: true, refundId: refund.id };
}

export async function getPaymentHistory(userId: string) {
  const charges = await stripe.charges.list({ customer: userId, limit: 50 });
  return charges.data;
}`,
            hasIssue: true,
            issueDescription:
              'No tests! Payment processing is one of the most critical parts of any application. ' +
              'This code handles real money — charging users, processing refunds, and querying ' +
              'payment history. It MUST have comprehensive tests covering success cases, error cases ' +
              '(invalid customer, failed charge, network errors), edge cases (zero amount, negative ' +
              'amount), and Stripe API mock scenarios.',
          },
          issueType: 'testing',
          issueDescription:
            'Missing tests: critical payment processing code with zero test coverage. Charges, refunds, and payment history all need thorough testing.',
        },
      ],
    },
  ],

  debrief:
    'Masterful review, recruit! You caught all three categories of AI-generated code issues:\n\n' +
    '1. **Security (PR #1)**: SQL injection from string interpolation. This is the #1 most common ' +
    'security issue in AI-generated code. ALWAYS check that user input is parameterized, not ' +
    'concatenated.\n\n' +
    '2. **Complexity (PR #2)**: Over-engineering a simple function. AI models sometimes add ' +
    'impressive-looking but unnecessary abstractions. Ask: "Does this complexity serve a real ' +
    'requirement?" If not, simplify.\n\n' +
    '3. **Testing (PR #3)**: Missing tests on critical code. AI is great at writing business logic ' +
    'but often skips tests unless explicitly asked. For payment code, missing tests are a blocker.\n\n' +
    'The "Herding Cats" review checklist for AI-generated code:\n' +
    '• ✅ Security: Is user input sanitized? Are queries parameterized?\n' +
    '• ✅ Complexity: Is the solution proportional to the problem?\n' +
    '• ✅ Testing: Are critical paths covered by tests?\n' +
    '• ✅ Correctness: Does the logic actually do what was requested?\n' +
    '• ✅ Dependencies: Were new dependencies added? Are they necessary?',

  realWorldMapping: 'Code review best practices for AI-generated pull requests',

  quiz: [
    {
      question: 'What is the most common security issue in AI-generated code?',
      options: [
        'Missing CORS headers',
        'SQL injection from unsanitized user input',
        'Exposing API keys in source code',
        'Using HTTP instead of HTTPS',
      ],
      correctIndex: 1,
    },
    {
      question: 'When an AI agent over-engineers a solution, what should you do?',
      options: [
        'Accept it because more code means more features',
        'Ask the agent to add even more abstractions for future-proofing',
        'Reject the PR and ask for a simpler solution proportional to the problem',
        'Delete the file and implement it yourself from scratch',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 85, accessory: 'reviewer-glasses', accessoryEmoji: '👓' },

  hints: [
    { text: 'Each PR has a different type of issue: security, complexity, or testing. Look at each one through a different lens.', xpCost: 0 },
    { text: 'PR #1: check how user input flows into the SQL query. PR #2: compare the before (3 lines) to the after (60+ lines). PR #3: where are the tests?', xpCost: 10 },
    { text: 'PR #1: SQL injection via template literal interpolation. PR #2: over-engineered config loader with unnecessary caching/hashing. PR #3: zero tests for payment-critical code.', xpCost: 25 },
  ],

  parTimeSeconds: 360,
};
