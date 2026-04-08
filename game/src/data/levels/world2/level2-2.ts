import type { LevelDef } from '../../../types/game';

export const level2_2: LevelDef = {
  id: '2-2',
  world: 2,
  levelNum: 2,
  title: 'Cat Tricks',
  subtitle: 'Equip your cat with powerful external tools',
  concept: 'Adding external tools via MCPs',
  isBoss: false,

  narrativeIntro:
    'Madame Fluffington leads you to the back room of the Grooming Salon, where shelves are ' +
    'lined with glowing orbs — each one a skill waiting to be learned. "Every cat has natural ' +
    'talent," she says, polishing a crystal ball labeled 🔍, "but the truly exceptional cats ' +
    'learn tricks. In Cursor, these tricks are called MCPs — Model Context Protocol servers. ' +
    'They give your AI assistant superpowers: searching the web, reading Jira tickets, querying ' +
    'databases, browsing files, even deploying code." She opens a velvet case containing five ' +
    'shimmering skill badges. "But a wise cat doesn\'t enable everything at once. Each trick ' +
    'uses energy and context. You must choose the right tools for the job." A new assignment ' +
    'appears on the salon\'s screen: a bug report references a Jira ticket and a database schema. ' +
    '"Which tricks do you need, darling?"',

  briefing:
    'A bug report says: "User profile page crashes — see ticket CATS-247 for repro steps, ' +
    'and check the users table schema for the column rename." You need to enable the right ' +
    'MCPs to give Cursor the tools it needs to investigate.',

  challengeSteps: [
    {
      id: '2-2-step1',
      type: 'enable_mcps',
      instruction:
        'The bug report requires reading a Jira ticket (CATS-247) and checking the database ' +
        'schema. Review the five available MCPs below and enable the ones that will help ' +
        'Cursor investigate this bug. Choose carefully — unnecessary tools add noise!\n\n' +
        'Bug report: "User profile page crashes after the recent migration. See CATS-247 for ' +
        'repro steps. The users table had a column rename — check the DB schema."',
      availableMcps: [
        { id: 'web-search', name: 'Web Search', emoji: '🔍', description: 'Search the internet for documentation, Stack Overflow answers, and API references' },
        { id: 'file-system', name: 'File System', emoji: '📁', description: 'Browse and manage files outside the current workspace' },
        { id: 'database', name: 'Database', emoji: '🗄️', description: 'Query your database — inspect schemas, run SELECT queries, and explore tables' },
        { id: 'jira-linear', name: 'Jira/Linear', emoji: '📋', description: 'Read and create tickets, view comments, and check issue status' },
        { id: 'deployment', name: 'Deployment', emoji: '🚀', description: 'Deploy to staging or production environments' },
      ],
      requiredMcpIds: ['jira-linear', 'database'],
    },
  ],

  debrief:
    'Excellent instincts, kitten! You correctly identified that this bug requires two specific ' +
    'tools: the Jira/Linear MCP to read the ticket\'s repro steps, and the Database MCP to ' +
    'inspect the schema changes. You wisely skipped Web Search (not needed for internal bugs), ' +
    'File System (your workspace files are already accessible), and Deployment (investigating, ' +
    'not shipping).\n\n' +
    'In the real world, MCPs (Model Context Protocol servers) extend Cursor\'s capabilities ' +
    'beyond code. You can connect it to databases, project management tools, documentation ' +
    'sites, APIs, and more. Each MCP runs as a local or remote server that Cursor communicates ' +
    'with using a standard protocol.\n\n' +
    'Pro tip: only enable the MCPs you actually need. Each active MCP adds context to the AI\'s ' +
    'window, and unnecessary tools can confuse the model or slow responses.',

  realWorldMapping: 'Cursor MCP (Model Context Protocol) server configuration',

  quiz: [
    {
      question: 'What are MCPs in Cursor?',
      options: [
        'Shortcuts for common code snippets',
        'External tool servers that extend the AI\'s capabilities beyond code',
        'A type of AI model optimized for specific languages',
        'Monitoring dashboards for code performance',
      ],
      correctIndex: 1,
    },
    {
      question: 'Why should you avoid enabling every available MCP at once?',
      options: [
        'MCPs cost money per activation',
        'Each active MCP adds context and can introduce noise, slowing down or confusing the AI',
        'Cursor only allows two MCPs at a time',
        'MCPs overwrite each other\'s data',
      ],
      correctIndex: 1,
    },
  ],

  reward: { xp: 80, accessory: 'tool-belt', accessoryEmoji: '🔧' },

  hints: [
    { text: 'Read the bug report carefully. What two external systems does it reference?', xpCost: 0 },
    { text: 'The report mentions a Jira ticket (CATS-247) and a database schema (users table). Match those to MCPs.', xpCost: 10 },
    { text: 'Enable "Jira/Linear" to read the ticket and "Database" to inspect the schema. Skip the rest.', xpCost: 25 },
  ],

  parTimeSeconds: 240,
};
