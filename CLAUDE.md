# BlogLog - Development Documentation Tool

## Using BlogLog During Development

**Important:** This project uses BlogLog to track its own development. When making changes:

- **Use `bl commit "message"` instead of `git commit`** - This logs the commit to the timeline AND runs git commit
- **Use `bl win "message"`** when you accomplish something notable or solve a tricky problem
- **Use `bl note "message"`** to capture thoughts, decisions, or things to revisit later
- **Use `bl blocker "message"`** when stuck on something

Example workflow:
```bash
# After implementing a feature
bl commit "add user authentication"

# After figuring something out
bl win "finally got OAuth working with the new API"

# Quick thought capture
bl note "should revisit error handling here"
```

## Project Purpose
A lightweight CLI and web tool for capturing development timeline and generating blog posts from the work. This is a meta-project: learning Claude Code by building a tool that documents learning Claude Code.

## The Problem
Developers do interesting work but don't document it effectively. Manual blog writing happens retrospectively (if at all), losing the narrative of decisions, blockers, and breakthroughs as they happen.

## Learning Objectives
- Learn Claude Code workflow and capabilities
- Build practical CLI tool development skills
- Practice habit-forming tool design (zero friction)

## Tech Stack
- **CLI**: Node.js with Commander.js (or similar)
  - Globally installable: `npm install -g bloglog`
  - Simple, cross-platform
- **Web Interface**: Next.js
  - Familiar stack for the developer
  - Easy local development
  - Runs on localhost:3001
- **Storage**: JSON files
  - Git-friendly
  - Human-readable
  - No database overhead
- **AI Integration**: Anthropic API
  - For conversation summarization
  - For blog post generation

## Architecture

### File Structure
```
bloglog/
  packages/
    cli/              # CLI tool (bl command)
      bin/
        bl.js         # Entry point
      src/
        commands/     # commit, note, win, blocker, serve, generate
        utils/        # file operations, git integration
    web/              # Next.js web interface
      app/
        init/         # Project initialization form
        capture/      # Conversation capture
        timeline/     # View all entries
        generate/     # Generate blog posts
        scratchpad/   # Persistent notes (not in timeline)
      components/
    shared/           # Shared utilities
      storage.js      # Read/write timeline.json
      ai.js           # Claude API integration
```

### Per-Project Data Structure
Each project using BlogLog contains:
```
project-root/
  .bloglog/
    metadata.json    # Project setup (problem, goals, success criteria)
    timeline.json    # All timeline entries
    drafts/          # Generated blog posts
  src/
  ...
```

### Data Schemas

**metadata.json**:
```json
{
  "projectName": "string",
  "initialized": "ISO8601 timestamp",
  "problem": "markdown string - what itch are we scratching?",
  "goals": "markdown string - what do we want to learn?",
  "successCriteria": "markdown string - how do we know we succeeded?"
}
```

**timeline.json**:
```json
{
  "entries": [
    {
      "id": "uuid",
      "timestamp": "ISO8601",
      "type": "commit|note|win|blocker|conversation",
      "message": "string (for commits)",
      "content": "string (for notes/wins/blockers)",
      "summary": "string (for conversations)",
      "tags": ["array", "of", "strings"],
      "gitHash": "string (for commits)"
    }
  ]
}
```

## Core Commands

### CLI Commands
```bash
bl init                 # Initialize BlogLog in current directory
bl init --name "Name"   # Initialize with custom project name
bl init --win "msg"     # Initialize with an initial win entry

bl serve [--daemon]     # Start web server (daemon mode = background)
bl status               # Show server status and current project
bl stop                 # Stop daemon server

bl commit "message"     # Log message + run git commit -m "message"
bl note "text"          # Quick capture
bl win "text"           # Breakthrough moment
bl blocker "text"       # Stuck point

bl generate             # Interactive: timeline/narrative/both?
```

### Web Interface Routes
- `/init` - Project setup form (markdown textareas)
- `/capture` - Paste conversations, optional AI summarization
- `/timeline` - Auto-refreshing view of all entries (poll every 3s)
- `/generate` - Generate blog post with options
- `/scratchpad` - Persistent notes area (doesn't write to timeline)

## Key Workflows

### 1. Project Initialization
**Option A: CLI (quick start)**
```bash
bl init                              # Creates .bloglog/ with empty metadata
bl init --win "Starting fresh!"      # Also log an initial win
bl init --name "My Project"          # Custom project name
```

**Option B: Web interface (detailed setup)**
Visit `/init` and fill out:
- What problem are you solving? (markdown)
- What do you want to learn? (markdown)
- Success criteria? (markdown)

Both save to `.bloglog/metadata.json`

### 2. Development Capture
```bash
# Natural git workflow replacement:
bl commit "add authentication component"
# → Logs to timeline.json
# → Runs: git commit -m "add authentication component"

# Quick thoughts:
bl note "need to refactor auth later"

# Breakthroughs:
bl win "figured out the shared component pattern"

# Blockers:
bl blocker "Supabase auth not working with RSC"
```

### 3. Conversation Capture
- Copy conversation from Claude chat
- Paste into `/capture` page
- Optionally click "Summarize with AI" (uses Claude API)
- Add tags if desired
- Save to timeline

### 4. Blog Generation
```bash
bl generate
# Interactive prompt:
# 1. Timeline (chronological)
# 2. Narrative blog post (AI-structured)
# 3. Both
# 4. Custom sections

# Outputs to .bloglog/drafts/blog-YYYY-MM-DD.md
```

## Implementation Preferences

### Code Style
- Prefer simplicity over cleverness
- Use async/await (not callbacks)
- Proper error handling with helpful messages
- TypeScript if it doesn't slow us down, plain JS is fine

### Git Integration
- Use `simple-git` package for git operations
- Don't use git hooks yet (future enhancement)
- Capture git hash with commits for context

### Web Interface
- Keep it functional, not fancy
- Mobile-responsive (developer might use tablet)
- Auto-refresh timeline using simple polling (every 3 seconds)
- Show spinner during AI summarization (not streaming)

### Server Management
- Daemon mode using background process
- Store PID for status/stop commands
- Graceful handling if server already running
- Auto-detect project context from current directory

### Multi-Project Handling
- Commands work in any project directory
- Walk up directory tree to find `.bloglog/`
- Server shows current project name in UI
- One project active at a time (developer's stated workflow)

## Non-Goals (For Now)
- Git hook automation (manual capture preferred initially)
- Multi-project simultaneous tracking
- Complex AI agents (just summarization and generation)
- Authentication/cloud sync
- Collaboration features
- Heavy configuration options

## Success Criteria
- Zero friction: `bl commit` becomes natural replacement for `git commit`
- Works seamlessly alongside existing workflow (6+ windows open)
- Generates usable blog post draft from 30-60 min development session
- Developer actually uses it for subsequent projects

## Dependencies to Consider
- `commander` - CLI framework
- `simple-git` - Git operations
- `uuid` - Unique IDs
- `@anthropic-ai/sdk` - Claude API
- Next.js standard dependencies
- `chokidar` or polling for file watching (if needed)

## Development Approach
Start minimal:
1. Get `bl commit` working (wraps git, writes to timeline)
2. Basic web server showing timeline
3. Add other CLI commands (note, win, blocker)
4. Build init form
5. Add conversation capture
6. Implement generate with Claude API

Iterate based on actual usage.
