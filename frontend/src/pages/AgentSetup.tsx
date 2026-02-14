import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TelegramSetupGuide from '../components/TelegramSetupGuide';
import * as api from '../services/api';

interface Props {
  user: any;
  signOut?: () => void;
}

const AgentSetup: React.FC<Props> = ({ user, signOut }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidToken = /^\d+:[A-Za-z0-9_-]+$/.test(token);

  const handleSubmit = async () => {
    if (!isValidToken) {
      setError('Invalid token format');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.provisionAgent(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
      <h1>Set Up Your Agent</h1>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '1.5rem',
        }}>
          ❌ {error}
        </div>
      )}

      <TelegramSetupGuide token={token} onTokenChange={setToken} />

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={!isValidToken || loading}
          style={{
            padding: '1rem 2rem',
            backgroundColor: isValidToken && !loading ? '#4fc3f7' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isValidToken && !loading ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          {loading ? 'Launching...' : 'Launch Agent'}
        </button>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#1565c0',
      }}>
        ℹ️ Your agent will start automatically once provisioned. It may take up to 2 minutes to become active.
      </div>
    </Layout>
  );
};

export default AgentSetup;
