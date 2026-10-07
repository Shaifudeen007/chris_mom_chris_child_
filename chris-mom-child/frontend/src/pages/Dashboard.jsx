import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogOut, Home, Gamepad2, Bell, Settings, Gift, Sparkles, Eye, ShieldAlert, User, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/client';
import AdminDashboard from '../features/admin/AdminDashboard';
import CreateMission from '../features/roles/CreateMission';

export default function Dashboard({ setAuth }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [myMatches, setMyMatches] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('MOM');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem('cmcc_access_token');
        const res = await axios.get(`/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = res.data.data;
        setUser(userData);
        
        if (userData && userData.role === 'USER') {
          // Fetch their identities and tasks directly for the dashboard
          try {
            const matchRes = await axios.get(`/games/1/my-identities`, { headers: { Authorization: `Bearer ${token}` } });
            setMyMatches(matchRes.data.data || []);
            
            const tasksRes = await axios.get(`/games/1/child/tasks`, { headers: { Authorization: `Bearer ${token}` } });
            setTasks(tasksRes.data.data || []);
          } catch(e) {
            console.error(e);
          }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('cmcc_access_token');
    sessionStorage.removeItem('cmcc_refresh_token');
    setAuth(false);
  };

  const refreshDashboardTasks = async () => {
    try {
      const token = sessionStorage.getItem('cmcc_access_token');
      const tasksRes = await axios.get(`/games/1/child/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasksRes.data.data || []);
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'row' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: '260px' }}>
        <div className="brand" style={{ marginBottom: '40px' }}>
          <div className="brand-mark"><Gift size={20} /></div>
          <div>
            <div className="cursive-title" style={{ fontSize: '1.8rem', lineHeight: '1.2' }}>Chris Mom</div>
            <div className="cursive-title" style={{ fontSize: '1.5rem', opacity: 0.8, color: 'var(--text-main)' }}>& Chris Child</div>
          </div>
        </div>

        {user?.role !== 'ADMIN' && (
          <>
            <div className="side-caption">Navigation</div>
            <button className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
              <Home size={18} className="nav-symbol" /> Dashboard
            </button>
          </>
        )}
        
        {user?.role === 'ADMIN' && (
          <>
            <div className="side-caption" style={{ marginTop: '24px' }}>Admin Panel</div>
            
            <button className={`nav-item ${location.pathname.includes('/admin/overview') ? 'active' : ''}`} onClick={() => navigate('/admin/overview')}>
               <Home size={18} className="nav-symbol" /> Overview
            </button>
            <button className={`nav-item ${location.pathname.includes('/admin/users') ? 'active' : ''}`} onClick={() => navigate('/admin/users')}>
               <Users size={18} className="nav-symbol" /> Users
            </button>
            <button className={`nav-item ${location.pathname.includes('/admin/matches') ? 'active' : ''}`} onClick={() => navigate('/admin/matches')}>
               <Gamepad2 size={18} className="nav-symbol" /> Matches
            </button>
            <button className={`nav-item ${location.pathname.includes('/admin/approvals') ? 'active' : ''}`} onClick={() => navigate('/admin/approvals')}>
               <CheckCircle size={18} className="nav-symbol" /> Mission Approvals
            </button>
            <button className={`nav-item ${location.pathname.includes('/admin/trigger') ? 'active' : ''}`} onClick={() => navigate('/admin/trigger')} style={{ color: 'var(--accent-primary)' }}>
               <Sparkles size={18} className="nav-symbol" color="var(--accent-primary)" /> Reveal Trigger
            </button>
          </>
        )}

        <div style={{ marginTop: 'auto' }}>
          <div className="sidebar-note">
            <span className="note-dot"></span>
            <div>
              <b>Signed in as</b>
              <small>{user ? user.name : 'Loading...'}</small>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--error)' }}>
            <LogOut size={18} style={{ color: 'var(--error)' }} className="nav-symbol" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-area" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={
            <div className="animate-in">
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome back, {user?.name || 'Player'}<span className="heading-period">.</span></h1>
                  <p className="intro-copy">Ready to spread some Christmas cheer?</p>
                </div>
              </header>
              
              {user?.role === 'ADMIN' ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <ShieldAlert size={48} style={{ color: 'var(--accent-secondary)', opacity: 0.5, marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Admin Controls Active</h2>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px' }}>
                    Please use the Admin Panel on the left to manage users, matches, and approve missions.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                    <button 
                      onClick={() => setActiveTab('MOM')}
                      style={{ 
                        background: activeTab === 'MOM' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'MOM' ? '#fff' : 'var(--text-muted)',
                        padding: '8px 24px', borderRadius: '24px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                      <Gift size={16} /> Mom Mode
                    </button>
                    <button 
                      onClick={() => setActiveTab('CHILD')}
                      style={{ 
                        background: activeTab === 'CHILD' ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'CHILD' ? '#fff' : 'var(--text-muted)',
                        padding: '8px 24px', borderRadius: '24px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                      <User size={16} /> Child Mode
                    </button>
                  </div>

                  {myMatches.length > 0 ? (
                    <div>
                      {myMatches.filter(m => m.role === activeTab).map((match, i) => (
                        <div key={i} className="card animate-in" style={{ borderTop: `4px solid ${match.role === 'MOM' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}` }}>
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
                                + Create Secret Mission
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {activeTab === 'CHILD' && tasks.length > 0 && (
                        <div style={{ marginTop: '32px' }} className="animate-in">
                          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Your Active Missions
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
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                      <Gift size={48} style={{ color: 'var(--accent-secondary)', opacity: 0.5, marginBottom: '20px' }} />
                      <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>No Secret Roles Assigned Yet</h2>
                      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px' }}>
                        You haven't been matched as a Mom or Child yet.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          } />
          
          <Route path="/admin" element={<Navigate to="/admin/overview" />} />
          <Route path="/admin/:tab" element={<AdminDashboard />} />
        </Routes>
      </main>

      {showMissionForm && (
        <CreateMission 
          gameId={1} 
          onClose={() => setShowMissionForm(false)} 
          onSuccess={() => {
            setShowMissionForm(false);
            toast.success('Secret Mission assigned successfully and is pending Admin approval!');
            refreshDashboardTasks();
          }} 
        />
      )}
    </div>
  );
}
