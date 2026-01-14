# BlogLog

A lightweight CLI and web tool for capturing your development timeline and generating blog posts from your work.

## The Problem

Developers do interesting work but don't document it effectively. Manual blog writing happens retrospectively (if at all), losing the narrative of decisions, blockers, and breakthroughs as they happen.

## The Solution

BlogLog captures your development journey in real-time with zero-friction commands, then generates blog posts from your timeline.

## Quick Start

```bash
# Clone and install
git clone https://github.com/IanSimon23/bloglog.git
cd bloglog
npm install

# Link the CLI globally
cd packages/cli && npm link && cd ../..

# Initialize in any project
mkdir .bloglog
echo '{"entries":[]}' > .bloglog/timeline.json

# Start capturing
bl commit "initial setup"
bl note "exploring the codebase"
bl win "figured out the auth flow"
bl blocker "CI pipeline failing"
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `bl commit "msg"` | Log message + run `git commit -m "msg"` |
| `bl note "text"` | Quick capture a thought |
| `bl win "text"` | Log a breakthrough moment |
| `bl blocker "text"` | Log a stuck point |
| `bl serve` | Start web interface on localhost:3001 |
| `bl serve --daemon` | Run server in background |
| `bl status` | Show server status |
| `bl stop` | Stop background server |
| `bl generate` | Generate blog post (interactive) |

## Web Interface

Start the server with `bl serve` or `npm run dev` from the root, then visit http://localhost:3001

| Route | Purpose |
|-------|---------|
| `/` | Home with getting started guide |
| `/init` | Set up project metadata (problem, goals, success criteria) |
| `/timeline` | View all entries (auto-refreshes every 3s) |
| `/capture` | Paste conversations, optionally summarize with AI |
| `/generate` | Generate blog posts from your timeline |
| `/scratchpad` | Persistent notes that don't clutter the timeline |

## Project Structure

```
bloglog/
├── packages/
│   ├── cli/          # Commander.js CLI (bl command)
│   ├── web/          # Next.js web interface
│   └── shared/       # Shared utilities (storage, AI)
└── .bloglog/         # Per-project data (created in your projects)
    ├── metadata.json # Project context
    ├── timeline.json # All timeline entries
    ├── scratchpad.md # Persistent notes
    └── drafts/       # Generated blog posts
```

## Timeline Entry Types

```json
{
  "entries": [
    {
      "id": "uuid",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "type": "commit",
      "message": "add user authentication",
      "gitHash": "abc1234"
    },
    {
      "type": "note",
      "content": "need to refactor this later"
    },
    {
      "type": "win",
      "content": "finally got OAuth working!"
    },
    {
      "type": "blocker",
      "content": "rate limiting on external API"
    },
    {
      "type": "conversation",
      "summary": "discussed auth approach with Claude",
      "tags": ["auth", "architecture"]
    }
  ]
}
```

## AI Features

Set `ANTHROPIC_API_KEY` in `packages/web/.env.local` to enable:

- **Conversation summarization** - Paste a chat, get a 2-3 sentence summary
- **Blog generation** - Transform your timeline into a narrative blog post or chronological summary

```bash
echo "ANTHROPIC_API_KEY=your-key" > packages/web/.env.local
```

## Development

```bash
# Install dependencies
npm install

# Run web interface in dev mode
npm run dev

# Or from the web package directly
cd packages/web && npm run dev
```

## Design Principles

- **Zero friction** - `bl commit` should feel as natural as `git commit`
- **Capture in the moment** - Don't wait until later to document
- **Human-readable storage** - JSON files you can edit, version control, and inspect
- **AI-assisted, not AI-dependent** - Works without API key, better with one

## License

MIT
