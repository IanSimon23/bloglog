import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PID_FILE = join(__dirname, '../../.server.pid');
const PROJECT_FILE = join(__dirname, '../../.server.project');

export async function statusCommand() {
  let serverRunning = false;
  let pid = null;

  if (existsSync(PID_FILE)) {
    try {
      pid = (await readFile(PID_FILE, 'utf-8')).trim();
      process.kill(parseInt(pid), 0); // Check if process exists
      serverRunning = true;
    } catch {
      serverRunning = false;
    }
  }

  console.log('BlogLog Status');
  console.log('==============');
  console.log(`Server: ${serverRunning ? `Running (PID: ${pid})` : 'Stopped'}`);

  if (serverRunning && existsSync(PROJECT_FILE)) {
    const project = (await readFile(PROJECT_FILE, 'utf-8')).trim();
    console.log(`Project: ${project}`);
    console.log(`URL: http://localhost:3001`);
  }
}
