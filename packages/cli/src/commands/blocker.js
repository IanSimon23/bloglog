import { findBloglogRoot, addTimelineEntry } from '@bloglog/shared/storage';

export async function blockerCommand(text) {
  const projectRoot = await findBloglogRoot();

  if (!projectRoot) {
    console.error('Error: No .bloglog directory found. Run `bl init` or use the web interface at /init first.');
    process.exit(1);
  }

  const entry = await addTimelineEntry(projectRoot, {
    type: 'blocker',
    content: text
  });

  console.log(`🚧 Blocker logged: ${text}`);
  console.log(`Entry ID: ${entry.id}`);
}
