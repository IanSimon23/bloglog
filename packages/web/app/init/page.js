'use client';

import { useState, useEffect } from 'react';

export default function InitPage() {
  const [formData, setFormData] = useState({
    projectName: '',
    problem: '',
    goals: '',
    successCriteria: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch('/api/metadata');
        const data = await res.json();

        if (data && data.projectName) {
          setFormData({
            projectName: data.projectName || '',
            problem: data.problem || '',
            goals: data.goals || '',
            successCriteria: data.successCriteria || ''
          });
          setIsExisting(true);
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetadata();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save');

      setMessage({ type: 'success', text: isExisting ? 'Project updated!' : 'Project initialized!' });
      setIsExisting(true);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
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
      <h1>{isExisting ? 'Edit Project' : 'Initialize Project'}</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        {isExisting
          ? 'Update your project context and goals.'
          : 'Set up your project to start capturing your development timeline.'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="My Awesome Project"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="problem">What problem are you solving?</label>
          <textarea
            id="problem"
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            placeholder="Describe the itch you're scratching. What pain point or opportunity are you addressing?"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="goals">What do you want to learn?</label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            placeholder="What skills, technologies, or concepts are you hoping to explore or master?"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="successCriteria">How will you know you succeeded?</label>
          <textarea
            id="successCriteria"
            name="successCriteria"
            value={formData.successCriteria}
            onChange={handleChange}
            placeholder="What does success look like? What specific outcomes or milestones will indicate you've achieved your goals?"
            rows={4}
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

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isExisting ? 'Update Project' : 'Initialize Project'}
        </button>
      </form>
    </div>
  );
}
