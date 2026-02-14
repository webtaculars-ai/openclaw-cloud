import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  onSignOut?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userEmail, onSignOut }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <nav style={{
        backgroundColor: '#1a1a2e',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link to="/dashboard" style={{ color: '#4fc3f7', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
          OpenClaw Cloud
        </Link>
        
        {userEmail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link
              to="/dashboard"
              style={{
                color: isActive('/dashboard') ? '#4fc3f7' : '#fff',
                textDecoration: 'none',
                fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/billing"
              style={{
                color: isActive('/billing') ? '#4fc3f7' : '#fff',
                textDecoration: 'none',
                fontWeight: isActive('/billing') ? 'bold' : 'normal',
              }}
            >
              Billing
            </Link>
            <span style={{ color: '#ccc' }}>{userEmail}</span>
            {onSignOut && (
              <button
                onClick={onSignOut}
                style={{
                  backgroundColor: '#ff5252',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </nav>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
