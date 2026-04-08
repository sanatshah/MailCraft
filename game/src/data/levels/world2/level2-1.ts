import type { LevelDef } from '../../../types/game';

const beforeCode = `// api/handler.ts
var express = require("express");
var router = express.Router();

class UserController {
  constructor() {
    this.db = require("../db");
  }

  getUser(req, res) {
    var userId = req.params.id;
    var user = this.db.query("SELECT * FROM users WHERE id = " + userId);
    res.json(user);
  }
}

module.exports = new UserController();`;

const afterCode = `// api/handler.ts
import express from 'express';
const router = express.Router();

interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (req: express.Request, res: express.Response) => {
  const userId = req.params.id;
  const user = db.query<User>('SELECT * FROM users WHERE id = ?', [userId]);
  res.json(user);
};

export { getUser };`;

export const level2_1: LevelDef = {
  id: '2-1',
  world: 2,
  levelNum: 1,
  title: 'House Rules',
  subtitle: 'Teach your cat the manners of the house',
  concept: 'Creating .cursorrules files and project-level rules',
  isBoss: false,

  narrativeIntro:
    'Welcome to the Grooming Salon, where every Cursor Cat learns to look their best! ' +
    'Madame Fluffington, the salon\'s perfectionist owner, peers at your code through a jeweled ' +
    'monocle. "Darling, your code is... functional, but it has no style. Var declarations? ' +
    'Class components? Double quotes?!" She shudders dramatically. "In MY salon, we have ' +
    'standards." She gestures to a golden plaque on the wall: THE HOUSE RULES. "Every great ' +
    'codebase has rules — conventions that keep things consistent when multiple paws are on the ' +
    'keyboard. In Cursor, you write these rules in a .cursorrules file at the root of your ' +
    'project. The AI reads them before every interaction and follows them like gospel." She slides ' +
    'a blank parchment across the counter. "Write your house rules, kitten. Your AI assistant ' +
    'will thank you."',

  briefing:
    'Madame Fluffington\'s codebase is a mess of inconsistent styles. Write three project rules ' +
    'in a .cursorrules file: always use const/let (never var), use functional components (not ' +
    'class components), and use single quotes (not double quotes). Then see how the AI transforms ' +
    'the old code to match.',

  challengeSteps: [
    {
      id: '2-1-step1',
      type: 'write_rules',
      instruction:
        'Write three rules for the project\'s .cursorrules file:\n' +
        '1. Always use const or let, never var\n' +
        '2. Use functional components instead of class components\n' +
        '3. Use single quotes for strings, not double quotes\n\n' +
        'Type each rule in plain English. The AI will use them to rewrite the code below.',
      requiredRules: ['const', 'functional', 'single quotes'],
      beforeCode,
      afterCode,
      files: [
        { name: 'api/handler.ts', content: beforeCode, language: 'typescript' },
      ],
    },
  ],

  debrief:
    'Purr-fect grooming, kitten! You just created your first .cursorrules file — the most ' +
    'powerful customization tool in Cursor. In the real world, .cursorrules (or the Rules ' +
    'section in Cursor Settings) lets you define project-wide conventions that the AI follows ' +
    'in every interaction. This is how teams keep AI-generated code consistent with their ' +
    'style guide without repeating instructions every time.\n\n' +
    'Common rules teams add: "Use TypeScript strict mode," "Prefer composition over inheritance," ' +
    '"Always handle errors with try/catch," or "Use Tailwind utility classes instead of custom CSS." ' +
    'The more specific your rules, the better the AI\'s output matches your standards.\n\n' +
    'Pro tip: keep rules concise and actionable. "Write clean code" is vague. "Use const for all ' +
    'variables that are not reassigned" is crystal clear.',

  realWorldMapping: 'Cursor .cursorrules file and project-level Rules in Settings',

  quiz: [
    {
      question: 'Where do project-level rules live in a Cursor project?',
      options: [
        'In a .env file at the project root',
        'In a .cursorrules file or the Rules section in Cursor Settings',
        'In the package.json under "cursor" key',
        'In a comment at the top of every file',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why are project rules more effective than repeating instructions in each prompt?',
      options: [
        'They make the AI run faster',
        'They are automatically applied to every AI interaction without needing to repeat them',
        'They disable incorrect AI models',
        'They lock files from being edited',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 75, accessory: 'house-collar', accessoryEmoji: '🏠' },

  hints: [
    { text: 'Each rule should be a clear, one-sentence instruction. Think of them as style-guide bullet points.', xpCost: 0 },
    { text: 'For the first rule, mention both "const" and "let" as replacements for "var". For functional components, say "functional" explicitly.', xpCost: 10 },
    { text: 'Example rules: "Always use const or let, never var", "Use functional components, not class components", "Use single quotes for all strings".', xpCost: 25 },
  ],

  parTimeSeconds: 240,
};
