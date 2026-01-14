import Anthropic from '@anthropic-ai/sdk';

let client = null;

/**
 * Get the Anthropic client (lazy initialization)
 */
function getClient() {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

/**
 * Summarize a conversation using Claude
 */
export async function summarizeConversation(conversation) {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Please summarize the following development conversation in 2-3 sentences, focusing on what was accomplished, decisions made, and any key insights:\n\n${conversation}`
      }
    ]
  });

  return response.content[0].text;
}

/**
 * Generate a blog post from timeline entries
 */
export async function generateBlogPost(metadata, entries, style = 'narrative') {
  const anthropic = getClient();

  const timelineText = entries.map(entry => {
    const time = new Date(entry.timestamp).toLocaleString();
    if (entry.type === 'commit') {
      return `[${time}] COMMIT: ${entry.message}`;
    } else if (entry.type === 'note') {
      return `[${time}] NOTE: ${entry.content}`;
    } else if (entry.type === 'win') {
      return `[${time}] WIN: ${entry.content}`;
    } else if (entry.type === 'blocker') {
      return `[${time}] BLOCKER: ${entry.content}`;
    } else if (entry.type === 'conversation') {
      return `[${time}] CONVERSATION: ${entry.summary}`;
    }
    return `[${time}] ${entry.type}: ${entry.content || entry.message}`;
  }).join('\n');

  const prompt = style === 'narrative'
    ? `You are helping a developer write a blog post about their development session. Based on the project context and timeline below, write an engaging blog post that tells the story of what they built, challenges they faced, and what they learned.

PROJECT CONTEXT:
Problem: ${metadata.problem || 'Not specified'}
Goals: ${metadata.goals || 'Not specified'}
Success Criteria: ${metadata.successCriteria || 'Not specified'}

DEVELOPMENT TIMELINE:
${timelineText}

Write a blog post in markdown format with a compelling title, introduction, body with clear sections, and conclusion.`
    : `Create a chronological timeline summary of this development session in markdown format:

PROJECT: ${metadata.projectName || 'Development Session'}

TIMELINE:
${timelineText}

Format as a readable markdown document with timestamps and clear categorization.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return response.content[0].text;
}
