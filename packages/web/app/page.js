export default function Home() {
  return (
    <div>
      <h1>Welcome to BlogLog</h1>
      <p style={{ marginBottom: '2rem' }}>
        Capture your development timeline and generate blog posts from your work.
      </p>

      <div className="card">
        <h2>Getting Started</h2>
        <ol style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Initialize</strong> - Set up your project with <a href="/init" style={{ color: 'var(--accent-color)' }}>/init</a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Capture</strong> - Use CLI commands or <a href="/capture" style={{ color: 'var(--accent-color)' }}>/capture</a> for conversations
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Review</strong> - See your timeline at <a href="/timeline" style={{ color: 'var(--accent-color)' }}>/timeline</a>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Generate</strong> - Create blog posts at <a href="/generate" style={{ color: 'var(--accent-color)' }}>/generate</a>
          </li>
        </ol>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>CLI Commands</h2>
        <pre style={{
          backgroundColor: 'var(--bg-color)',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1rem',
          overflow: 'auto'
        }}>
{`bl serve           # Start the web server
bl commit "msg"    # Log + git commit
bl note "text"     # Quick capture
bl win "text"      # Breakthrough moment
bl blocker "text"  # Stuck point
bl generate        # Generate blog post`}
        </pre>
      </div>
    </div>
  );
}
