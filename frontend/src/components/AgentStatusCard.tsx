import React, { useState } from 'react';
import { Agent } from '../services/api';
import WhatsAppQRModal from './WhatsAppQRModal';

interface Props {
  agent: Agent;
  onStart: () => void;
  onStop: () => void;
  loading: boolean;
  onRefresh?: () => void;
}

const AgentStatusCard: React.FC<Props> = ({ agent, onStart, onStop, loading, onRefresh }) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'running':
        return { color: '#4caf50', emoji: '✅', text: 'ONLINE', message: 'Your agent is active and ready to chat!' };
      case 'provisioning':
        return { color: '#ff9800', emoji: '⏳', text: 'STARTING', message: 'Agent is starting up...' };
      case 'stopped':
        return { color: '#9e9e9e', emoji: '⏸️', text: 'STOPPED', message: 'Agent is offline. Start it to begin chatting.' };
      case 'stopped_no_credits':
        return { color: '#f44336', emoji: '💳', text: 'NO CREDITS', message: 'Agent stopped due to insufficient credits.' };
      case 'error':
        return { color: '#f44336', emoji: '⚠️', text: 'ERROR', message: 'Something went wrong. Try restarting.' };
      default:
        return { color: '#9e9e9e', emoji: '❓', text: status.toUpperCase(), message: '' };
    }
  };

  const statusInfo = getStatusInfo(agent.status);
  const canStart = agent.status === 'stopped' || agent.status === 'stopped_no_credits';
  const canStop = agent.status === 'running';
  const isTransitioning = agent.status === 'provisioning';

  return (
    <div style={{
      border: '2px solid #ddd',
      borderRadius: '12px',
      padding: '2rem',
      backgroundColor: '#fff',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Status banner */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: statusInfo.color,
      }} />

      {/* Header with status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            margin: '0 0 0.75rem 0',
            color: '#333'
          }}>
            {agent.name || `Agent ${agent.agentId.substring(0, 8)}`}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{statusInfo.emoji}</span>
            <div>
              <div style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                color: statusInfo.color,
                marginBottom: '0.25rem'
              }}>
                {statusInfo.text}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                {statusInfo.message}
              </div>
            </div>
          </div>
        </div>
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: statusInfo.color,
          boxShadow: `0 0 0 4px ${statusInfo.color}33`,
          animation: agent.status === 'running' ? 'pulse 2s infinite' : 'none'
        }} />
      </div>

      {/* Agent Details */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>🤖 MODEL</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
            {agent.model.includes('sonnet') ? 'Sonnet 4.5' : agent.model.includes('haiku') ? 'Haiku 3.5' : 'Claude'}
          </div>
        </div>
        <div>
          <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>📅 CREATED</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
            {new Date(agent.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>⚡ LAST ACTIVE</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
            {new Date(agent.lastActiveAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.25rem' }}>🔑 AGENT ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#666' }}>
            {agent.agentId.slice(0, 12)}...
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {canStart && (
          <button
            onClick={onStart}
            disabled={loading || isTransitioning}
            style={{
              flex: 1,
              padding: '1rem 2rem',
              backgroundColor: loading || isTransitioning ? '#ccc' : '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || isTransitioning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: loading || isTransitioning ? 'none' : '0 4px 6px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (!loading && !isTransitioning) {
                e.currentTarget.style.backgroundColor = '#45a049';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(76, 175, 80, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isTransitioning) {
                e.currentTarget.style.backgroundColor = '#4caf50';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(76, 175, 80, 0.3)';
              }
            }}
          >
            {loading ? '⏳ Starting...' : '▶️ Start Agent'}
          </button>
        )}
        
        {canStop && (
          <button
            onClick={onStop}
            disabled={loading || isTransitioning}
            style={{
              flex: 1,
              padding: '1rem 2rem',
              backgroundColor: loading || isTransitioning ? '#ccc' : '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || isTransitioning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: loading || isTransitioning ? 'none' : '0 4px 6px rgba(244, 67, 54, 0.3)',
              transition: 'all 0.3s',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (!loading && !isTransitioning) {
                e.currentTarget.style.backgroundColor = '#d32f2f';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(244, 67, 54, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isTransitioning) {
                e.currentTarget.style.backgroundColor = '#f44336';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(244, 67, 54, 0.3)';
              }
            }}
          >
            {loading ? '⏳ Stopping...' : '⏹️ Stop Agent'}
          </button>
        )}

        {isTransitioning && (
          <div style={{
            flex: 1,
            padding: '1rem 2rem',
            backgroundColor: '#e3f2fd',
            border: '2px dashed #2196f3',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#1976d2',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            ⚙️ Agent is starting up...
          </div>
        )}
      </div>

      {/* Tips based on status */}
      {agent.status === 'running' && (
        <>
          {/* Telegram Section */}
          {agent.telegramEnabled !== false && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#e8f5e9',
              border: '1px solid #0088cc',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#01579b'
            }}>
              💬 <strong>Telegram Ready!</strong> Open Telegram and message your bot to start a conversation.
            </div>
          )}

          {/* WhatsApp Section */}
          {agent.whatsappEnabled && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: agent.whatsappLinked ? '#e8f5e9' : '#f0f7ff',
              border: `1px solid ${agent.whatsappLinked ? '#4caf50' : '#2196f3'}`,
              borderRadius: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>
                    💬 WhatsApp {agent.whatsappLinked && '✅'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {agent.whatsappLinked 
                      ? '✅ Connected! You can message this agent on WhatsApp'
                      : 'Link your WhatsApp to message this agent'
                    }
                  </div>
                </div>
                {!agent.whatsappLinked && (
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#20BA5A';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#25D366';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    Link WhatsApp
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {agent.status === 'stopped' && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#e65100'
        }}>
          💡 Click "Start Agent" to bring your AI companion online. It takes about 1 minute.
        </div>
      )}

      {agent.status === 'stopped_no_credits' && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#c62828'
        }}>
          💳 <strong>Out of credits!</strong> Add more credits on the{' '}
          <a href="/billing" style={{ color: '#c62828', textDecoration: 'underline' }}>Billing page</a> to continue.
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* WhatsApp QR Modal */}
      {showWhatsAppModal && (
        <WhatsAppQRModal
          agentId={agent.agentId}
          onClose={() => setShowWhatsAppModal(false)}
          onLinked={() => {
            setShowWhatsAppModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default AgentStatusCard;
