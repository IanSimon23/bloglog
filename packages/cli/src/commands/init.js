import { existsSync } from 'fs';
import { basename, join } from 'path';
import { initBloglog, addTimelineEntry, getBloglogPath } from '@bloglog/shared/storage';

export async function initCommand(options) {
  const projectRoot = process.cwd();
  const bloglogPath = getBloglogPath(projectRoot);

  if (existsSync(bloglogPath)) {
    console.error('Error: .bloglog directory already exists in this project.');
    console.error('Use the web interface at /init to update project metadata.');
    process.exit(1);
  }

  const projectName = options.name || basename(projectRoot);

  await initBloglog(projectRoot, {
    projectName,
    problem: '',
    goals: '',
    successCriteria: ''
  });

  console.log(`✓ Initialized BlogLog in ${bloglogPath}`);
  console.log(`  Project: ${projectName}`);
  console.log('');
  console.log('Created:');
  console.log('  .bloglog/metadata.json');
  console.log('  .bloglog/timeline.json');
  console.log('  .bloglog/drafts/');

  if (options.win) {
    const entry = await addTimelineEntry(projectRoot, {
      type: 'win',
      content: options.win
    });
    console.log('');
    console.log(`🎉 Initial win logged: ${options.win}`);
  }

  console.log('');
  console.log('Next steps:');
  console.log('  bl serve        Start the web interface');
  console.log('  bl commit "msg" Make your first tracked commit');
  console.log('  bl note "text"  Capture a quick thought');
}
