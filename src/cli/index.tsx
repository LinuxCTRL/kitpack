#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import { initCommand } from './commands/init';
import { addCommand } from './commands/add';
import { publishCommand } from './commands/publish';
import { searchCommand } from './commands/search';
import { installCommand } from './commands/install';
import { Dashboard } from './ui/Dashboard';

function showHelp() {
  console.log(`
  kitpack — AI agent skill packager

  Usage:
    kitpack <command> [options]

  Commands:
    init                      Scaffold a new skill in the current directory
    add <file>                Add a file to the skill bundle
    publish                   Publish the skill to a registry (npm/local)
    search <query>            Discover skills
    install <name>            Install a skill to your project

  Run kitpack without arguments to open the interactive dashboard.
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    const { waitUntilExit } = render(<Dashboard />);
    await waitUntilExit();
    process.exit(0);
  }

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    case 'init':
      await initCommand();
      break;
    case 'add':
      await addCommand(args.slice(1));
      break;
    case 'publish':
      await publishCommand();
      break;
    case 'search':
      await searchCommand(args.slice(1).join(' '));
      break;
    case 'install':
      await installCommand(args[1] || '');
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
