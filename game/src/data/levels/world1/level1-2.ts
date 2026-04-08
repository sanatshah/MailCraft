import type { LevelDef } from '../../../types/game';

const themeToggleTsx = `// ThemeToggle.tsx
import { useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggle = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark');
  };

  return (
    <button onClick={toggle} className="theme-toggle">
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}`;

const appCss = `/* app.css */
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a2e;
  --accent: #6c63ff;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  transition: background 0.3s, color 0.3s;
}

.theme-toggle {
  border: 2px solid var(--accent);
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 1.2rem;
  background: transparent;
}`;

const useThemeTs = `// useTheme.ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}`;

export const level12: LevelDef = {
  id: '1-2',
  world: 1,
  levelNum: 2,
  title: 'Thinking Cat',
  subtitle: 'Plan before you pounce',
  concept: 'Using Plan mode to think through tasks before making changes',
  isBoss: false,

  narrativeIntro:
    'Professor Whiskers adjusts his tiny spectacles and taps the chalkboard with a laser ' +
    'pointer. "A hasty cat knocks the vase off the table. A thinking cat calculates the ' +
    'trajectory first." The classroom murmurs with agreement. On the projector, a feature ' +
    'request glows: "Add dark mode to the Kitten Dashboard." Simple enough, you think. But ' +
    'Professor Whiskers shakes his head. "Not so fast! In Plan mode, Cursor lays out each ' +
    'step before writing a single line of code. Your job is to review the plan, spot the bad ' +
    'steps, and approve only the good ones. Think of it as sniffing the tuna before you eat ' +
    'it." He pauses dramatically. "A plan is a promise to your future self. Make sure it\'s ' +
    'a good one." You flex your paws. Time to think before you code.',

  briefing:
    'Cursor has drafted a plan to add dark mode to the Kitten Dashboard. Review the four ' +
    'steps and identify which one would cause problems if executed.',

  challengeSteps: [
    {
      id: '1-2-step1',
      type: 'review_plan',
      instruction:
        'Review the proposed plan for adding dark mode. Identify and reject the step that ' +
        'would destroy existing styles.',
      files: [
        { name: 'ThemeToggle.tsx', content: themeToggleTsx, language: 'typescriptreact' },
        { name: 'app.css', content: appCss, language: 'css' },
        { name: 'useTheme.ts', content: useThemeTs, language: 'typescript' },
      ],
      planSteps: [
        {
          id: 'plan-1',
          text: 'Create a useTheme hook that reads/writes the theme preference to localStorage and applies a data-theme attribute to the document root.',
          isBad: false,
        },
        {
          id: 'plan-2',
          text: 'Overwrite all existing CSS with a new dark-only stylesheet, removing the current light theme variables entirely.',
          isBad: true,
          explanation:
            'This would destroy the existing light theme. Instead, we should add dark theme variables alongside the existing ones using a [data-theme="dark"] selector.',
        },
        {
          id: 'plan-3',
          text: 'Add a [data-theme="dark"] CSS selector block that overrides the CSS custom properties (--bg-primary, --text-primary) with dark values.',
          isBad: false,
        },
        {
          id: 'plan-4',
          text: 'Update ThemeToggle to use the useTheme hook instead of local state, so theme persists across page reloads.',
          isBad: false,
        },
      ],
    },
  ],

  debrief:
    'Sharp eyes, kitten! You caught the destructive step before any code was written. ' +
    'In the real world, Plan mode (available in Cursor\'s Agent panel) asks the AI to ' +
    'outline its approach before making changes. This is invaluable for complex tasks — ' +
    'you get to review, approve, reject, or modify each step. The key insight: overwriting ' +
    'existing styles would have broken the light theme for every user. The correct approach ' +
    'is additive — layer dark theme variables on top of the existing ones using CSS selectors. ' +
    'Always watch for plans that delete or replace instead of extend. ' +
    'Pro tip: if a plan step feels too broad ("rewrite all styles"), it probably is. Ask the ' +
    'AI to break it into smaller, safer steps.',

  realWorldMapping: 'Cursor Plan mode — review AI-generated implementation plans before execution',

  quiz: [
    {
      question: 'What is the main benefit of using Plan mode?',
      options: [
        'It writes code faster than Agent mode',
        'It lets you review and approve each step before code is changed',
        'It automatically deploys your changes',
        'It only works with CSS files',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why was the "overwrite all styles" step rejected?',
      options: [
        'It was too slow to execute',
        'It used the wrong CSS syntax',
        'It would destroy the existing light theme instead of adding dark mode alongside it',
        'It forgot to add a toggle button',
      ],
      correctIndex: 2,
    },
  ],

  reward: { xp: 60, accessory: 'thinking-cap', accessoryEmoji: '🎩' },

  hints: [
    { text: 'Read each plan step carefully. One of them replaces instead of extends.', xpCost: 0 },
    { text: 'Look for words like "overwrite" or "remove entirely" — those are red flags in a plan that should be additive.', xpCost: 10 },
    { text: 'Step 2 says to overwrite ALL existing CSS. That means the light theme would be gone. Reject it!', xpCost: 25 },
  ],

  parTimeSeconds: 240,
};
