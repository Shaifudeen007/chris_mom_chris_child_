import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, User, Star, CheckCircle, Shield, Plus } from 'lucide-react';
import axios from '../../api/client';
import CreateMission from '../roles/CreateMission';

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [myMatches, setMyMatches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinForm, setJoinForm] = useState({ mom_alias: '', child_alias: '' });
  const [error, setError] = useState('');
  const [showMissionForm, setShowMissionForm] = useState(false);

  const baseUrl = localStorage.getItem('cmcc_api_base') || 'http://localhost:8000';
  const token = sessionStorage.getItem('cmcc_access_token');

  const fetchData = async () => {
    try {
      const gameRes = await axios.get(`/games/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setGame(gameRes.data.data);

      if (gameRes.data.status !== 'DRAFT' && gameRes.data.status !== 'OPEN') {
        try {
          const matchRes = await axios.get(`/games/${id}/my-identities`, { headers: { Authorization: `Bearer ${token}` } });
          setMyMatches(matchRes.data.data);
          
          const tasksRes = await axios.get(`/games/${id}/child/tasks`, { headers: { Authorization: `Bearer ${token}` } });
          setTasks(tasksRes.data.data);
        } catch (e) {
          // Might not be registered, ignore matches error
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load game details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/games/${id}/join`, joinForm, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join game.');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading game...</div>;
  if (!game) return <div style={{ color: 'var(--error)' }}>{error || 'Game not found'}</div>;

  return (
    <div className="animate-in">
      <button onClick={() => navigate('/')} className="text-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>{game.name}</h2>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '12px'
            }}>
              Status: {game.status}
            </span>
          </div>
        </div>
      </div>

      {game.status === 'OPEN' && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Join the Game</h3>
          <form onSubmit={handleJoin} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Your Secret Mom Alias</label>
              <input type="text" className="input-field" value={joinForm.mom_alias} onChange={e => setJoinForm({...joinForm, mom_alias: e.target.value})} required placeholder="e.g. Santa's Helper" />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Your Secret Child Alias</label>
              <input type="text" className="input-field" value={joinForm.child_alias} onChange={e => setJoinForm({...joinForm, child_alias: e.target.value})} required placeholder="e.g. Good Kid" />
            </div>
            <button type="submit" className="button-primary" style={{ height: '40px' }}>Join Game</button>
          </form>
          {error && <div style={{ color: 'var(--error)', marginTop: '12px', fontSize: '12px' }}>{error}</div>}
        </div>
      )}

      {myMatches.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Your Roles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {myMatches.map((match, i) => (
              <div key={i} className="card" style={{ borderTop: `4px solid ${match.role === 'MOM' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                    {match.role === 'MOM' ? <Gift size={20} color="var(--accent-primary)" /> : <User size={20} color="var(--accent-secondary)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>You are the Secret</div>
                    <strong style={{ fontSize: '18px' }}>{match.role}</strong>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned to:</div>
                  <strong style={{ fontSize: '16px', color: 'var(--text-main)' }}>{match.counterpartAlias}</strong>
                  {match.revealed && match.counterpart_name && (
                    <div style={{ color: 'var(--accent-secondary)', fontSize: '12px', marginTop: '4px' }}>
                      Real Name: {match.counterpart_name}
                    </div>
                  )}
                  {match.role === 'MOM' && (
                    <button 
                      className="button-primary" 
                      onClick={() => setShowMissionForm(true)}
                      style={{ marginTop: '16px', padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} /> Create Secret Mission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} color="var(--accent-secondary)" /> Your Active Missions (Child Mode)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {tasks.map(task => (
              <div key={task.id} className="card" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>{task.title}</h4>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px' }}>
                    +{task.points} pts
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>{task.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: task.status === 'APPROVED' ? 'var(--success)' : 'var(--accent-primary)' }}>
                    Status: {task.status}
                  </span>
                  {task.status === 'PENDING' && (
                    <button className="button-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Submit Mission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMissionForm && (
        <CreateMission 
          gameId={id} 
          onClose={() => setShowMissionForm(false)} 
          onSuccess={() => {
            setShowMissionForm(false);
            alert('Secret Mission assigned successfully!');
            fetchData();
          }} 
        />
      )}
    </div>
  );
}
