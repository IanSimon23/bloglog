import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversation } = body;

    if (!conversation || !conversation.trim()) {
      return NextResponse.json(
        { error: 'Conversation text is required' },
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

    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Please summarize the following development conversation in 2-3 sentences, focusing on what was accomplished, decisions made, and any key insights:\n\n${conversation}`
        }
      ]
    });

    const summary = response.content[0].text;

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Error summarizing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
