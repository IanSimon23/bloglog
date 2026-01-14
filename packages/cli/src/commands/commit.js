import simpleGit from 'simple-git';
import { findBloglogRoot, addTimelineEntry } from '@bloglog/shared/storage';

export async function commitCommand(message) {
  const projectRoot = await findBloglogRoot();

  if (!projectRoot) {
    console.error('Error: No .bloglog directory found. Run `bl init` or use the web interface at /init first.');
    process.exit(1);
  }

  const git = simpleGit();

  try {
    // Run git commit
    const result = await git.commit(message);
    const gitHash = result.commit || null;

    // Log to timeline
    const entry = await addTimelineEntry(projectRoot, {
      type: 'commit',
      message,
      gitHash
    });

    console.log(`Committed: ${message}`);
    if (gitHash) {
      console.log(`Git hash: ${gitHash}`);
    }
    console.log(`Logged to timeline: ${entry.id}`);
  } catch (error) {
    // If git commit fails, still log to timeline but note the failure
    if (error.message.includes('nothing to commit')) {
      console.log('Nothing to commit, working tree clean');
    } else {
      console.error(`Git error: ${error.message}`);
    }

    // Log the commit message anyway for timeline tracking
    const entry = await addTimelineEntry(projectRoot, {
      type: 'commit',
      message,
      gitHash: null
    });
    console.log(`Logged to timeline: ${entry.id}`);
  }
}
