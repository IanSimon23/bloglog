import { spawn } from 'child_process';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { findBloglogRoot } from '@bloglog/shared/storage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PID_FILE = join(__dirname, '../../.server.pid');
const PROJECT_FILE = join(__dirname, '../../.server.project');

export async function serveCommand(options) {
  const projectRoot = await findBloglogRoot();

  if (!projectRoot) {
    console.error('Error: No .bloglog directory found. Initialize a project first.');
    process.exit(1);
  }

  // Check if already running
  if (existsSync(PID_FILE)) {
    try {
      const pid = await readFile(PID_FILE, 'utf-8');
      process.kill(parseInt(pid), 0); // Check if process exists
      console.log(`Server already running (PID: ${pid.trim()})`);
      console.log(`Open http://localhost:3001`);
      return;
    } catch {
      // Process not running, clean up stale PID file
    }
  }

  const webPackagePath = join(__dirname, '../../../web');

  if (options.daemon) {
    console.log('Starting server in background...');

    const child = spawn('npm', ['run', 'dev'], {
      cwd: webPackagePath,
      detached: true,
      stdio: 'ignore',
      shell: true
    });

    child.unref();

    await writeFile(PID_FILE, String(child.pid));
    await writeFile(PROJECT_FILE, projectRoot);

    console.log(`Server started (PID: ${child.pid})`);
    console.log(`Project: ${projectRoot}`);
    console.log(`Open http://localhost:3001`);
  } else {
    console.log('Starting server...');
    console.log(`Project: ${projectRoot}`);
    console.log(`Open http://localhost:3001`);
    console.log('Press Ctrl+C to stop\n');

    await writeFile(PROJECT_FILE, projectRoot);

    const child = spawn('npm', ['run', 'dev'], {
      cwd: webPackagePath,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', async () => {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(PID_FILE).catch(() => {});
        await unlink(PROJECT_FILE).catch(() => {});
      } catch {}
    });
  }
}
