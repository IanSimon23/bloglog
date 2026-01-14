'use client';

import { useState, useEffect } from 'react';

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function formatRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function EntryCard({ entry }) {
  const content = entry.type === 'commit' ? entry.message : entry.content;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span className={`badge ${entry.type}`}>{entry.type}</span>
        <span className="timestamp" title={formatTime(entry.timestamp)}>
          {formatRelativeTime(entry.timestamp)}
        </span>
      </div>
      <p style={{ margin: '0.5rem 0' }}>{content}</p>
      {entry.gitHash && (
        <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {entry.gitHash.slice(0, 7)}
        </code>
      )}
    </div>
  );
}

export default function TimelinePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchTimeline() {
    try {
      const res = await fetch('/api/timeline');
      if (!res.ok) throw new Error('Failed to fetch timeline');
      const data = await res.json();
      setEntries(data.entries || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimeline();

    // Poll every 3 seconds
    const interval = setInterval(fetchTimeline, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sort entries by timestamp, newest first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Timeline</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {lastUpdated && (
            <span className="timestamp">
              Updated {formatRelativeTime(lastUpdated)}
            </span>
          )}
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }} title="Auto-refreshing" />
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <span>Loading timeline...</span>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: 'var(--error-color)' }}>
          <p style={{ color: 'var(--error-color)' }}>Error: {error}</p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="card">
          <p>No entries yet. Start capturing with the CLI:</p>
          <pre style={{
            backgroundColor: 'var(--bg-color)',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem'
          }}>
{`bl commit "your commit message"
bl note "a quick thought"
bl win "something that worked!"
bl blocker "something you're stuck on"`}
          </pre>
        </div>
      )}

      <div>
        {sortedEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {entries.length > 0 && (
        <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
        </p>
      )}
    </div>
  );
}
