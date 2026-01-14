import { findBloglogRoot, addTimelineEntry } from '@bloglog/shared/storage';

export async function winCommand(text) {
  const projectRoot = await findBloglogRoot();

  if (!projectRoot) {
    console.error('Error: No .bloglog directory found. Run `bl init` or use the web interface at /init first.');
    process.exit(1);
  }

  const entry = await addTimelineEntry(projectRoot, {
    type: 'win',
    content: text
  });

  console.log(`🎉 Win logged: ${text}`);
  console.log(`Entry ID: ${entry.id}`);
}
