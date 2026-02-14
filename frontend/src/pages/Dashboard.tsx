import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import AgentStatusCard from '../components/AgentStatusCard';
import CreditMeter from '../components/CreditMeter';
import * as api from '../services/api';

const DemoBanner: React.FC = () => (
  <div style={{
    padding: '1rem',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '4px',
    color: '#856404',
    marginBottom: '1.5rem',
    textAlign: 'center',
  }}>
    ℹ️ <strong>Demo Mode:</strong> This is a preview with mock data. Deploy the backend to enable real functionality.
  </div>
);

interface Props {
  user: any;
  signOut?: () => void;
}

const Dashboard: React.FC<Props> = ({ user, signOut }) => {
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState<api.Agent[]>([]);
  const [credits, setCredits] = useState<api.Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [agentData, creditData] = await Promise.all([
        api.listAgents(),
        api.getCredits(),
      ]);
      setAgents(agentData.agents);
      setCredits(creditData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check for payment success
    if (searchParams.get('payment') === 'success') {
      setSuccessMessage('Payment successful! Your credits have been added.');
    }
  }, [searchParams]);

  // Auto-refresh when agent is running
  useEffect(() => {
    const hasRunningAgent = agents.some(a => a.status === 'running');
    if (!hasRunningAgent) return;

    const interval = setInterval(fetchData, 30_000); // 30s
    return () => clearInterval(interval);
  }, [agents]);

  const handleStart = async (agentId: string) => {
    setActionLoading(true);
    try {
      await api.startAgent(agentId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async (agentId: string) => {
    setActionLoading(true);
    try {
      await api.stopAgent(agentId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </Layout>
    );
  }

  const agent = agents[0]; // MVP: single agent
  const hasAgent = !!agent;
  const hasCredits = credits && credits.balance > 0;

  return (
    <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
      {api.isMockMode() && <DemoBanner />}
      
      {successMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>✅ {successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>❌ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            ×
          </button>
        </div>
      )}

      <h1>Dashboard</h1>

      {credits && (
        <CreditMeter
          balanceCents={credits.balance}
          totalUsedCents={credits.totalUsed}
        />
      )}

      {hasAgent ? (
        <AgentStatusCard
          agent={agent}
          onStart={() => handleStart(agent.agentId)}
          onStop={() => handleStop(agent.agentId)}
          loading={actionLoading}
        />
      ) : (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '2rem',
          backgroundColor: '#fff',
          textAlign: 'center',
        }}>
          <h2>Welcome to OpenClaw Cloud!</h2>
          {hasCredits ? (
            <>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                You're all set! Let's create your agent.
              </p>
              <Link
                to="/setup"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#4fc3f7',
                  color: '#fff',
                  padding: '1rem 2rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Set Up Agent
              </Link>
            </>
          ) : (
            <>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                To get started, you'll need to purchase credits.
              </p>
              <Link
                to="/billing"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  padding: '1rem 2rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                Purchase Credits
              </Link>
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
