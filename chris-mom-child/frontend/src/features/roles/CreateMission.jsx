import { useState } from 'react';
import { X, Wand2, Sparkles, Send } from 'lucide-react';
import axios from '../../api/client';

export default function CreateMission({ gameId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Christmas',
    difficulty: 'Medium',
    points: 50,
    deadline: '',
    proofRequired: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // API call to the mock backend to create the task
      await axios.post(`/games/${gameId}/mom/tasks`, form);
      onSuccess();
    } catch (err) {
      setError('Failed to create mission.');
    } finally {
      setLoading(false);
    }
  };

  const handleAI = () => {
    // Simulate the AI Mission Assistant
    setForm(prev => ({
      ...prev,
      title: 'The Hidden Ornament',
      description: 'Create a beautiful Christmas decoration using three ordinary objects around you and submit a creative photo.',
      type: 'Creative',
      difficulty: 'Hard',
      points: 100,
      proofRequired: true
    }));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card animate-in" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'grid', placeItems: 'center' }}>
            <Sparkles size={20} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Create Secret Mission</h2>
        </div>

        <button type="button" onClick={handleAI} style={{
          width: '100%', padding: '12px', background: 'rgba(42, 157, 143, 0.1)', border: '1px solid var(--success)', 
          borderRadius: '8px', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer', fontWeight: 600
        }}>
          <Wand2 size={18} /> ✨ Christmas Mission AI: Generate Idea
        </button>

        {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Mission Title</label>
            <input type="text" className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. The Midnight Carol" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Description</label>
            <textarea className="input-field" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="What must your Secret Child do?" />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {['Christmas', 'Photo', 'Video', 'Puzzle', 'Good Deed', 'Funny', 'Creative', 'Mystery'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Difficulty</label>
              <select className="input-field" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                {['Easy', 'Medium', 'Hard', 'Epic'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Reward (Points)</label>
              <input type="number" className="input-field" value={form.points} onChange={e => setForm({...form, points: e.target.value})} min="10" max="500" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Deadline (Optional)</label>
              <input type="datetime-local" className="input-field" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginTop: '8px' }}>
            <input type="checkbox" checked={form.proofRequired} onChange={e => setForm({...form, proofRequired: e.target.checked})} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '14px' }}>Require photo/video proof for submission</span>
          </label>

          <button type="submit" className="button-primary" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
            <Send size={18} /> {loading ? 'Assigning...' : 'Assign Secret Mission'}
          </button>
        </form>
      </div>
    </div>
  );
}
