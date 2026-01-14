import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const BLOGLOG_DIR = '.bloglog';
const TIMELINE_FILE = 'timeline.json';
const METADATA_FILE = 'metadata.json';

/**
 * Find the .bloglog directory by walking up the directory tree
 */
export async function findBloglogRoot(startDir = process.cwd()) {
  let currentDir = startDir;

  while (currentDir !== dirname(currentDir)) {
    const bloglogPath = join(currentDir, BLOGLOG_DIR);
    if (existsSync(bloglogPath)) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }

  return null;
}

/**
 * Get the path to the .bloglog directory
 */
export function getBloglogPath(projectRoot) {
  return join(projectRoot, BLOGLOG_DIR);
}

/**
 * Initialize a new .bloglog directory
 */
export async function initBloglog(projectRoot, metadata) {
  const bloglogPath = getBloglogPath(projectRoot);

  await mkdir(bloglogPath, { recursive: true });
  await mkdir(join(bloglogPath, 'drafts'), { recursive: true });

  const metadataWithTimestamp = {
    ...metadata,
    initialized: new Date().toISOString()
  };

  await writeFile(
    join(bloglogPath, METADATA_FILE),
    JSON.stringify(metadataWithTimestamp, null, 2)
  );

  await writeFile(
    join(bloglogPath, TIMELINE_FILE),
    JSON.stringify({ entries: [] }, null, 2)
  );

  return bloglogPath;
}

/**
 * Read the timeline from a project
 */
export async function readTimeline(projectRoot) {
  const timelinePath = join(getBloglogPath(projectRoot), TIMELINE_FILE);

  try {
    const content = await readFile(timelinePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { entries: [] };
    }
    throw error;
  }
}

/**
 * Write the timeline to a project
 */
export async function writeTimeline(projectRoot, timeline) {
  const timelinePath = join(getBloglogPath(projectRoot), TIMELINE_FILE);
  await writeFile(timelinePath, JSON.stringify(timeline, null, 2));
}

/**
 * Add an entry to the timeline
 */
export async function addTimelineEntry(projectRoot, entry) {
  const timeline = await readTimeline(projectRoot);

  const newEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...entry
  };

  timeline.entries.push(newEntry);
  await writeTimeline(projectRoot, timeline);

  return newEntry;
}

/**
 * Read project metadata
 */
export async function readMetadata(projectRoot) {
  const metadataPath = join(getBloglogPath(projectRoot), METADATA_FILE);

  try {
    const content = await readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Write project metadata
 */
export async function writeMetadata(projectRoot, metadata) {
  const metadataPath = join(getBloglogPath(projectRoot), METADATA_FILE);
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}
