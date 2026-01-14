import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

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
    const metadataPath = join(projectRoot, '.bloglog', 'metadata.json');
    const draftsPath = join(projectRoot, '.bloglog', 'drafts');

    if (!existsSync(timelinePath)) {
      return NextResponse.json(
        { error: 'No timeline found. Add some entries first.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { style } = body; // 'timeline' or 'narrative'

    // Read timeline and metadata
    const timeline = JSON.parse(await readFile(timelinePath, 'utf-8'));
    let metadata = {};
    if (existsSync(metadataPath)) {
      metadata = JSON.parse(await readFile(metadataPath, 'utf-8'));
    }

    if (timeline.entries.length === 0) {
      return NextResponse.json(
        { error: 'No timeline entries found.' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Format timeline for prompt
    const timelineText = timeline.entries.map(entry => {
      const time = new Date(entry.timestamp).toLocaleString();
      if (entry.type === 'commit') {
        return `[${time}] COMMIT: ${entry.message}${entry.gitHash ? ` (${entry.gitHash.slice(0, 7)})` : ''}`;
      } else if (entry.type === 'conversation') {
        return `[${time}] CONVERSATION: ${entry.summary}`;
      }
      return `[${time}] ${entry.type.toUpperCase()}: ${entry.content}`;
    }).join('\n');

    // Build prompt based on style
    const prompt = style === 'narrative'
      ? `You are helping a developer write a blog post about their development session. Based on the project context and timeline below, write an engaging blog post that tells the story of what they built, challenges they faced, and what they learned.

PROJECT CONTEXT:
Project: ${metadata.projectName || 'Development Session'}
Problem: ${metadata.problem || 'Not specified'}
Goals: ${metadata.goals || 'Not specified'}
Success Criteria: ${metadata.successCriteria || 'Not specified'}

DEVELOPMENT TIMELINE:
${timelineText}

Write a blog post in markdown format with:
- A compelling title
- Brief introduction setting up the problem/goal
- Body sections covering the journey (decisions, wins, blockers)
- Conclusion with learnings and next steps

Keep it conversational and authentic - this is a developer sharing their experience.`
      : `Create a clean, chronological timeline summary of this development session in markdown format:

PROJECT: ${metadata.projectName || 'Development Session'}

TIMELINE:
${timelineText}

Format as a readable markdown document with:
- A title
- Entries grouped by time or theme
- Clear formatting for different entry types (commits, notes, wins, blockers, conversations)`;

    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = response.content[0].text;

    // Save to drafts
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = style === 'narrative'
      ? `blog-${dateStr}.md`
      : `timeline-${dateStr}.md`;
    const filepath = join(draftsPath, filename);

    // Ensure drafts directory exists
    await mkdir(draftsPath, { recursive: true });
    await writeFile(filepath, content);

    return NextResponse.json({
      success: true,
      content,
      filename,
      filepath
    });
  } catch (error) {
    console.error('Error generating:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
