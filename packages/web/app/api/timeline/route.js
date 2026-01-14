import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Get project root from .server.project file or fall back to parent directories
async function getProjectRoot() {
  const serverProjectFile = join(process.cwd(), '../../packages/cli/.server.project');

  if (existsSync(serverProjectFile)) {
    return (await readFile(serverProjectFile, 'utf-8')).trim();
  }

  // Fall back to the bloglog root (3 levels up from packages/web/app)
  return join(process.cwd(), '../..');
}

export async function GET() {
  try {
    const projectRoot = await getProjectRoot();
    const timelinePath = join(projectRoot, '.bloglog', 'timeline.json');

    if (!existsSync(timelinePath)) {
      return NextResponse.json({ entries: [] });
    }

    const content = await readFile(timelinePath, 'utf-8');
    const timeline = JSON.parse(content);

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Error reading timeline:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
