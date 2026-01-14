import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createInterface } from 'readline';
import { findBloglogRoot, readTimeline, readMetadata, getBloglogPath } from '@bloglog/shared/storage';
import { generateBlogPost } from '@bloglog/shared/ai';

function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export async function generateCommand() {
  const projectRoot = await findBloglogRoot();

  if (!projectRoot) {
    console.error('Error: No .bloglog directory found. Initialize a project first.');
    process.exit(1);
  }

  const timeline = await readTimeline(projectRoot);
  const metadata = await readMetadata(projectRoot);

  if (timeline.entries.length === 0) {
    console.log('No timeline entries found. Add some entries first!');
    return;
  }

  console.log(`\nFound ${timeline.entries.length} timeline entries.\n`);
  console.log('Generate:');
  console.log('  1. Timeline (chronological)');
  console.log('  2. Narrative blog post (AI-structured)');
  console.log('  3. Both');
  console.log('');

  const choice = await prompt('Choose option (1-3): ');

  const draftsDir = join(getBloglogPath(projectRoot), 'drafts');
  const dateStr = new Date().toISOString().split('T')[0];

  try {
    if (choice === '1' || choice === '3') {
      console.log('\nGenerating timeline...');
      const timelineContent = await generateBlogPost(metadata || {}, timeline.entries, 'timeline');
      const timelinePath = join(draftsDir, `timeline-${dateStr}.md`);
      await writeFile(timelinePath, timelineContent);
      console.log(`Timeline saved to: ${timelinePath}`);
    }

    if (choice === '2' || choice === '3') {
      console.log('\nGenerating narrative blog post...');
      const narrativeContent = await generateBlogPost(metadata || {}, timeline.entries, 'narrative');
      const narrativePath = join(draftsDir, `blog-${dateStr}.md`);
      await writeFile(narrativePath, narrativeContent);
      console.log(`Blog post saved to: ${narrativePath}`);
    }

    if (!['1', '2', '3'].includes(choice)) {
      console.log('Invalid option. Please run again and choose 1, 2, or 3.');
    }
  } catch (error) {
    console.error(`\nError generating content: ${error.message}`);
    console.log('\nMake sure you have set ANTHROPIC_API_KEY environment variable.');
  }
}
