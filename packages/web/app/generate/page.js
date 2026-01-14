'use client';

import { useState, useEffect } from 'react';

export default function GeneratePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await fetch('/api/timeline');
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err) {
        console.error('Error loading timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, []);

  async function handleGenerate(style) {
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <h1>Generate Blog Post</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Transform your timeline into a shareable blog post.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Timeline Summary</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} ready to generate
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {['commit', 'note', 'win', 'blocker', 'conversation'].map(type => {
            const count = entries.filter(e => e.type === type).length;
            if (count === 0) return null;
            return (
              <span key={type} className={`badge ${type}`}>
                {count} {type}{count !== 1 ? 's' : ''}
              </span>
            );
          })}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="card">
          <p>No timeline entries yet. Add some entries first:</p>
          <pre style={{
            backgroundColor: 'var(--bg-color)',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem'
          }}>
{`bl commit "your commit message"
bl note "a quick thought"
bl win "something that worked!"`}
          </pre>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleGenerate('narrative')}
            disabled={generating}
            style={{ flex: '1', minWidth: '200px' }}
          >
            {generating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: '16px', height: '16px' }} />
                Generating...
              </span>
            ) : (
              'Generate Narrative Blog'
            )}
          </button>
          <button
            onClick={() => handleGenerate('timeline')}
            disabled={generating}
            className="secondary"
            style={{ flex: '1', minWidth: '200px' }}
          >
            Generate Timeline Summary
          </button>
        </div>
      )}

      {error && (
        <div className="card" style={{ marginTop: '1.5rem', borderColor: 'var(--error-color)' }}>
          <p style={{ color: 'var(--error-color)' }}>Error: {error}</p>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Generated Content</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Saved to: {result.filename}
            </span>
          </div>
          <div
            className="card"
            style={{
              backgroundColor: 'var(--bg-color)',
              maxHeight: '500px',
              overflow: 'auto'
            }}
          >
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontFamily: 'inherit',
              margin: 0
            }}>
              {result.content}
            </pre>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigator.clipboard.writeText(result.content)}
              className="secondary"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
