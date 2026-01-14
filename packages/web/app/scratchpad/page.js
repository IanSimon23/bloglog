'use client';

import { useState, useEffect, useRef } from 'react';

export default function ScratchpadPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    async function loadScratchpad() {
      try {
        const res = await fetch('/api/scratchpad');
        const data = await res.json();
        setContent(data.content || '');
      } catch (err) {
        console.error('Error loading scratchpad:', err);
      } finally {
        setLoading(false);
      }
    }
    loadScratchpad();
  }, []);

  async function saveContent(text) {
    setSaving(true);
    try {
      const res = await fetch('/api/scratchpad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });

      if (res.ok) {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error('Error saving scratchpad:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    const newContent = e.target.value;
    setContent(newContent);

    // Debounced auto-save after 1 second of no typing
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveContent(newContent);
    }, 1000);
  }

  function handleManualSave() {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveContent(content);
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
    <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Scratchpad</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Quick notes that won't clutter your timeline
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {saving && (
            <span className="loading" style={{ fontSize: '0.875rem' }}>
              <span className="spinner" style={{ width: '14px', height: '14px' }} />
              Saving...
            </span>
          )}
          {!saving && lastSaved && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button onClick={handleManualSave} disabled={saving} className="secondary">
            Save Now
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Jot down quick notes, ideas, or things to remember...

This content is saved to .bloglog/scratchpad.md and won't appear in your timeline.

Great for:
- Draft ideas before committing to timeline
- Temporary notes and reminders
- Code snippets to reference later
- Links and resources"
        style={{
          flex: 1,
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          resize: 'none',
          padding: '1rem'
        }}
      />

      <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Auto-saves after 1 second of inactivity. Stored in <code>.bloglog/scratchpad.md</code>
      </p>
    </div>
  );
}
