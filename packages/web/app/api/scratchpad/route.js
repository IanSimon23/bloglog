import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

async function getProjectRoot() {
  const serverProjectFile = join(process.cwd(), '../../packages/cli/.server.project');

  if (existsSync(serverProjectFile)) {
    return (await readFile(serverProjectFile, 'utf-8')).trim();
  }

  return join(process.cwd(), '../..');
}

export async function GET() {
  try {
    const projectRoot = await getProjectRoot();
    const scratchpadPath = join(projectRoot, '.bloglog', 'scratchpad.md');

    if (!existsSync(scratchpadPath)) {
      return NextResponse.json({ content: '' });
    }

    const content = await readFile(scratchpadPath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading scratchpad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const projectRoot = await getProjectRoot();
    const scratchpadPath = join(projectRoot, '.bloglog', 'scratchpad.md');

    const body = await request.json();
    const { content } = body;

    await writeFile(scratchpadPath, content || '');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving scratchpad:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
