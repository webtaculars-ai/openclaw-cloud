import React from 'react';
import { Agent } from '../services/api';

interface Props {
  agent: Agent;
  onStart: () => void;
  onStop: () => void;
  loading: boolean;
}

const AgentStatusCard: React.FC<Props> = ({ agent, onStart, onStop, loading }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#4caf50';
      case 'provisioning': return '#ff9800';
      case 'stopped': return '#9e9e9e';
      case 'stopped_no_credits': return '#f44336';
      case 'error': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const canStart = agent.status === 'stopped';
  const canStop = agent.status === 'running';

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(agent.status),
        }} />
        <strong style={{ fontSize: '1.2rem' }}>{agent.status.replace('_', ' ').toUpperCase()}</strong>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Model</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {agent.model.includes('sonnet') ? 'Sonnet 4.5' : 'Haiku 3.5'}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Created</div>
          <div>{new Date(agent.createdAt).toLocaleDateString()}</div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Last Active</div>
          <div>{new Date(agent.lastActiveAt).toLocaleDateString()}</div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Agent ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{agent.agentId.slice(0, 8)}...</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {canStart && (
          <button
            onClick={onStart}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Starting...' : 'Start Agent'}
          </button>
        )}
        {canStop && (
          <button
            onClick={onStop}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Stopping...' : 'Stop Agent'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentStatusCard;
