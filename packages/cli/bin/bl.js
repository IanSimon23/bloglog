#!/usr/bin/env node

import { program } from 'commander';
import { commitCommand } from '../src/commands/commit.js';
import { noteCommand } from '../src/commands/note.js';
import { winCommand } from '../src/commands/win.js';
import { blockerCommand } from '../src/commands/blocker.js';
import { serveCommand } from '../src/commands/serve.js';
import { statusCommand } from '../src/commands/status.js';
import { stopCommand } from '../src/commands/stop.js';
import { generateCommand } from '../src/commands/generate.js';

program
  .name('bl')
  .description('BlogLog - Capture your development timeline')
  .version('0.1.0');

// Server commands
program
  .command('serve')
  .description('Start the web server')
  .option('-d, --daemon', 'Run in background')
  .action(serveCommand);

program
  .command('status')
  .description('Show server status and current project')
  .action(statusCommand);

program
  .command('stop')
  .description('Stop the daemon server')
  .action(stopCommand);

// Timeline entry commands
program
  .command('commit <message>')
  .description('Log message and run git commit')
  .action(commitCommand);

program
  .command('note <text>')
  .description('Quick capture a note')
  .action(noteCommand);

program
  .command('win <text>')
  .description('Log a breakthrough moment')
  .action(winCommand);

program
  .command('blocker <text>')
  .description('Log a stuck point')
  .action(blockerCommand);

// Generation
program
  .command('generate')
  .description('Generate blog post from timeline')
  .action(generateCommand);

program.parse();
