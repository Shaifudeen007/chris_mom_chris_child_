import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldAlert, Users, Eye, Sparkles, CheckCircle, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../../api/client';

export default function AdminDashboard() {
  const { tab } = useParams();
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchData = async () => {
    try {
      const [uRes, mRes, tRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/matches'),
        axios.get('/admin/tasks')
      ]);
      setUsers(uRes.data.data || []);
      setMatches(mRes.data.data || []);
      setTasks(tRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReveal = async () => {
    if (!window.confirm('Are you sure you want to trigger the FINAL REVEAL? This will expose everyone\'s real identities!')) {
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/admin/games/1/reveal');
      setRevealed(true);
      toast.success(res.data.message || 'Identities Revealed!');
    } catch (err) {
      toast.error('Failed to trigger reveal.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId) => {
    try {
      await axios.post(`/admin/tasks/${taskId}/approve`);
      toast.success('Mission approved!');
      fetchData(); // Refresh tasks
    } catch (error) {
      toast.error('Failed to approve task');
    }
  };

  const handleReject = async (taskId) => {
    if (!window.confirm('Are you sure you want to reject this mission?')) return;
    try {
      await axios.post(`/admin/tasks/${taskId}/reject`);
      toast.success('Mission rejected!');
      fetchData(); // Refresh tasks
    } catch (error) {
      toast.error('Failed to reject task');
    }
  };

  const handleStartGame = async () => {
    if (!window.confirm('Are you sure you want to officially Start the Game? This will run the algorithm to pair everyone up!')) {
      return;
    }
    setLoading(true);
    try {
      await axios.post('/admin/games/1/start');
      toast.success('Game Started successfully!');
    } catch (err) {
      toast.error('Failed to start game.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch(tab) {
      case 'trigger': return 'Final Reveal Control';
      case 'users': return 'Registered Users';
      case 'matches': return 'Game Matches';
      case 'approvals': return 'Mission Approvals';
      case 'overview': return 'Overview';
      default: return 'Admin Dashboard';
    }
  };

  const totalPairs = matches.length;
  const totalPoints = tasks.reduce((sum, t) => sum + (t.status === 'APPROVED' ? t.points : 0), 0);
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <ShieldAlert size={28} color="var(--accent-secondary)" />
        <h2 style={{ fontSize: '28px', margin: 0 }}>{getTitle()}</h2>
      </div>

      {(!tab || tab === 'overview') && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
             <button onClick={handleStartGame} disabled={loading} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success)' }}>
               <Gamepad2 size={16} /> {loading ? 'Processing...' : 'Start Game (Generate Pairs)'}
             </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px', borderTop: '4px solid var(--accent-primary)' }}>
            <Gamepad2 size={32} style={{ color: 'var(--accent-primary)', marginBottom: '12px' }} />
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px' }}>{totalPairs}</div>
            <div style={{ color: 'var(--text-muted)' }}>Total Pairs</div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px', borderTop: '4px solid var(--accent-secondary)' }}>
            <Sparkles size={32} style={{ color: 'var(--accent-secondary)', marginBottom: '12px' }} />
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px' }}>{totalPoints}</div>
            <div style={{ color: 'var(--text-muted)' }}>Total Points (Approved)</div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px', borderTop: '4px solid var(--success)' }}>
            <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '12px' }} />
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px' }}>{totalTasks}</div>
            <div style={{ color: 'var(--text-muted)' }}>Total Tasks</div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px', borderTop: '4px solid var(--error)' }}>
            <ShieldAlert size={32} style={{ color: 'var(--error)', marginBottom: '12px' }} />
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '4px' }}>{pendingTasks}</div>
            <div style={{ color: 'var(--text-muted)' }}>Pending Approvals</div>
          </div>
        </div>
        </>
      )}

      {tab === 'trigger' && (
        <div className="card" style={{ borderTop: '4px solid var(--accent-secondary)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Eye size={20} /> Final Reveal Control
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
            This action will immediately change the game status to <strong>REVEALED</strong>. 
            All participants will be able to see the real names behind the "Secret Mom" and "Secret Child" aliases.
            Use this only at the end of the Christmas event!
          </p>

          <button 
            onClick={handleReveal} 
            disabled={loading || revealed}
            className="button-primary" 
            style={{ 
              background: revealed ? 'var(--success)' : 'var(--accent-primary)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              width: '100%',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            <Sparkles size={20} />
            {loading ? 'Processing...' : revealed ? 'Identities Revealed!' : 'Trigger Final Reveal'}
          </button>
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={20} /> Registered Users
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {users.map(u => (
              <div key={u.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div><strong>{u.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({u.email})</span></div>
                <div style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: u.role === 'ADMIN' ? 'var(--accent-secondary)' : 'var(--accent-primary)', color: 'white' }}>{u.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'matches' && (
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Gamepad2 size={20} /> Game Matches
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {matches.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No matches yet.</p> : matches.map(m => (
              <div key={m.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Game:</strong> {m.gameName}</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>Mom: {m.momName}</span>
                  <span>→</span>
                  <span style={{ color: 'var(--accent-secondary)' }}>Child: {m.childName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'approvals' && (
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle size={20} /> Mission Approvals
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {tasks.filter(t => t.status === 'PENDING').length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No pending missions to approve.</p>
            ) : tasks.filter(t => t.status === 'PENDING').map(t => (
              <div key={t.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.description}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="button-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleApprove(t.id)}>
                    Approve
                  </button>
                  <button className="button-primary" style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--error)' }} onClick={() => handleReject(t.id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
