import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Snowflakes from './components/layout/Snowflakes';
import Login from './features/auth/Login';
import Dashboard from './pages/Dashboard';
import './index.css';
import './App.css'; // Remove or clear App.css if not needed

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('cmcc_access_token');
    if (token) {
      setIsAuthenticated(true);
    }
    // Simulate a brief initial load to show the splash loader
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  }, []);

  if (isLoading) {
    return (
      <div className="loader-container" style={{ background: 'var(--bg-color)', overflow: 'hidden' }}>
        <div className="loader-content">
          <Gift size={80} className="creative-loader-icon" />
          <div style={{ textAlign: 'center' }}>
            <div className="cursive-title" style={{ fontSize: '4.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>Chris Mom & Chris Child</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--card-bg)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <Snowflakes />
      <Router>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/*" element={<Dashboard setAuth={setIsAuthenticated} />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
              <Route path="/*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </Router>
    </>
  );
}

export default App;
