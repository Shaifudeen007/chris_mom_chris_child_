import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Calendar, ArrowRight, Gift } from 'lucide-react';
import axios from '../../api/client';

export default function GameList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = sessionStorage.getItem('cmcc_access_token');
        const res = await axios.get(`/games`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGames(res.data.data);
      } catch (err) {
        console.error("Failed to fetch games", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Available Games</h2>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading games...</div>
      ) : games.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No games available right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {games.map(game => (
            <div key={game.id} className="card animate-in" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => navigate(`/games/${game.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(230, 57, 70, 0.1)', color: 'var(--accent-primary)', display: 'grid', placeItems: 'center' }}>
                  <Gift size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{game.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      background: game.status === 'OPEN' ? 'rgba(42, 157, 143, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: game.status === 'OPEN' ? 'var(--success)' : 'var(--text-muted)',
                      fontWeight: 600
                    }}>
                      {game.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="text-button" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
