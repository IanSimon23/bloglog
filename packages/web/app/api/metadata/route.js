import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
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
    const metadataPath = join(projectRoot, '.bloglog', 'metadata.json');

    if (!existsSync(metadataPath)) {
      return NextResponse.json(null);
    }

    const content = await readFile(metadataPath, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('Error reading metadata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const projectRoot = await getProjectRoot();
    const bloglogPath = join(projectRoot, '.bloglog');
    const metadataPath = join(bloglogPath, 'metadata.json');
    const timelinePath = join(bloglogPath, 'timeline.json');
    const draftsPath = join(bloglogPath, 'drafts');

    const body = await request.json();

    // Create directories if they don't exist
    await mkdir(bloglogPath, { recursive: true });
    await mkdir(draftsPath, { recursive: true });

    // Create or update metadata
    const metadata = {
      projectName: body.projectName || 'Untitled Project',
      initialized: existsSync(metadataPath)
        ? JSON.parse(await readFile(metadataPath, 'utf-8')).initialized
        : new Date().toISOString(),
      problem: body.problem || '',
      goals: body.goals || '',
      successCriteria: body.successCriteria || ''
    };

    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Create timeline.json if it doesn't exist
    if (!existsSync(timelinePath)) {
      await writeFile(timelinePath, JSON.stringify({ entries: [] }, null, 2));
    }

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error('Error saving metadata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
