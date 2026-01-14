'use client';

import { useState } from 'react';

export default function CapturePage() {
  const [conversation, setConversation] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSummarize() {
    if (!conversation.trim()) {
      setMessage({ type: 'error', text: 'Paste a conversation first' });
      return;
    }

    setSummarizing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to summarize');
      }

      setSummary(data.summary);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSummarizing(false);
    }
  }

  async function handleSave() {
    const summaryToSave = summary.trim() || conversation.trim();

    if (!summaryToSave) {
      setMessage({ type: 'error', text: 'Add a summary or paste a conversation' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const tagList = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: summaryToSave,
          tags: tagList
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setMessage({ type: 'success', text: 'Conversation saved to timeline!' });

      // Clear form
      setConversation('');
      setSummary('');
      setTags('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>Capture Conversation</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Paste a development conversation and optionally summarize it with AI.
      </p>

      <div className="form-group">
        <label htmlFor="conversation">Conversation</label>
        <textarea
          id="conversation"
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          placeholder="Paste your conversation here..."
          rows={10}
          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={handleSummarize}
          disabled={summarizing || !conversation.trim()}
          className="secondary"
          style={{ marginRight: '1rem' }}
        >
          {summarizing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="spinner" style={{ width: '16px', height: '16px' }} />
              Summarizing...
            </span>
          ) : (
            'Summarize with AI'
          )}
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Optional - uses Claude API
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="summary">Summary</label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="AI-generated summary will appear here, or write your own..."
          rows={4}
        />
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          This is what gets saved to your timeline
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., auth, debugging, refactor"
        />
      </div>

      {message && (
        <div
          className="card"
          style={{
            borderColor: message.type === 'success' ? 'var(--success-color)' : 'var(--error-color)',
            marginBottom: '1rem'
          }}
        >
          <p style={{ color: message.type === 'success' ? 'var(--success-color)' : 'var(--error-color)' }}>
            {message.text}
          </p>
        </div>
      )}

      <button onClick={handleSave} disabled={saving || (!summary.trim() && !conversation.trim())}>
        {saving ? 'Saving...' : 'Save to Timeline'}
      </button>
    </div>
  );
}
