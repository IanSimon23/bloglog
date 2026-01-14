import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

async function getProjectRoot() {
  const serverProjectFile = join(process.cwd(), '../../packages/cli/.server.project');

  if (existsSync(serverProjectFile)) {
    return (await readFile(serverProjectFile, 'utf-8')).trim();
  }

  return join(process.cwd(), '../..');
}

export async function POST(request) {
  try {
    const projectRoot = await getProjectRoot();
    const timelinePath = join(projectRoot, '.bloglog', 'timeline.json');

    if (!existsSync(timelinePath)) {
      return NextResponse.json(
        { error: 'Project not initialized. Visit /init first.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { summary, tags } = body;

    if (!summary || !summary.trim()) {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      );
    }

    // Read existing timeline
    const content = await readFile(timelinePath, 'utf-8');
    const timeline = JSON.parse(content);

    // Create new entry
    const entry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'conversation',
      summary: summary.trim(),
      tags: tags || []
    };

    timeline.entries.push(entry);

    // Write updated timeline
    await writeFile(timelinePath, JSON.stringify(timeline, null, 2));

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
