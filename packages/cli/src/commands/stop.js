import { readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PID_FILE = join(__dirname, '../../.server.pid');
const PROJECT_FILE = join(__dirname, '../../.server.project');

export async function stopCommand() {
  if (!existsSync(PID_FILE)) {
    console.log('Server is not running');
    return;
  }

  try {
    const pid = (await readFile(PID_FILE, 'utf-8')).trim();

    // Try to kill the process
    try {
      process.kill(parseInt(pid), 'SIGTERM');
      console.log(`Server stopped (PID: ${pid})`);
    } catch (error) {
      if (error.code === 'ESRCH') {
        console.log('Server was not running (stale PID file)');
      } else {
        throw error;
      }
    }

    // Clean up PID and project files
    await unlink(PID_FILE).catch(() => {});
    await unlink(PROJECT_FILE).catch(() => {});

  } catch (error) {
    console.error(`Error stopping server: ${error.message}`);
  }
}
