import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TelegramSetupGuide from '../components/TelegramSetupGuide';
import WhatsAppSetupGuide from '../components/WhatsAppSetupGuide';
import * as api from '../services/api';

interface Props {
  user: any;
  signOut?: () => void;
}

const AgentSetup: React.FC<Props> = ({ user, signOut }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(true); // Default enabled
  const [token, setToken] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValidToken = /^\d+:[A-Za-z0-9_-]{30,}$/.test(token);
  const hasAtLeastOneChannel = telegramEnabled || whatsappEnabled;

  const handleSubmit = async () => {
    // Validation
    if (!hasAtLeastOneChannel) {
      setError('Please enable at least one messaging channel (Telegram or WhatsApp)');
      return;
    }

    if (telegramEnabled && !isValidToken) {
      setError('Invalid Telegram bot token format. Token should be like: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await api.provisionAgent(
        telegramEnabled ? token : '', 
        whatsappEnabled, 
        undefined, 
        name || undefined,
        telegramEnabled
      );
      setSuccess(true);
      
      // Show success message then redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Provision error:', err);
      
      // Parse error message and make it user-friendly
      let errorMessage = err.message || 'Failed to provision agent';
      
      if (errorMessage.includes('Insufficient credits')) {
        errorMessage = '💳 Insufficient credits. Please add credits on the Billing page to continue.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = '🔐 Session expired. Please sign in again.';
      } else if (errorMessage.includes('Network')) {
        errorMessage = '🌐 Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('token')) {
        errorMessage = '❌ Invalid bot token. Please check your token from @BotFather and try again.';
      } else if (errorMessage.includes('already have an agent')) {
        errorMessage = '⚠️ ' + err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '0.5rem',
          color: '#333'
        }}>
          🚀 Launch Your AI Agent
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Your personal AI companion, ready to chat 24/7
        </p>

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'shake 0.5s'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            color: '#155724',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.5s'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <span>Agent created successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          {/* Agent Name */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Agent Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Assistant (leave blank for auto-generated name)"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4fc3f7'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            />
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              Give your agent a friendly name to identify it easily
            </p>
          </div>

          {/* Channel Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '1rem',
              fontWeight: 'bold',
              color: '#333',
              fontSize: '1.1rem'
            }}>
              Choose Your Channels <span style={{ color: '#f44336' }}>*</span>
            </label>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
              Select at least one messaging platform for your agent. You can enable both!
            </p>

            {/* Telegram Checkbox */}
            <div style={{
              padding: '1.5rem',
              border: `2px solid ${telegramEnabled ? '#0088cc' : '#e0e0e0'}`,
              borderRadius: '8px',
              marginBottom: '1rem',
              backgroundColor: telegramEnabled ? '#e3f2fd' : 'white',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => setTelegramEnabled(!telegramEnabled)}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                  style={{ marginRight: '0.75rem', width: '20px', height: '20px', cursor: 'pointer' }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                  💬 Telegram
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginLeft: '2rem' }}>
                Perfect for desktop access • Quick setup with bot token
              </p>
            </div>

            {/* Telegram Token Field (conditional) */}
            {telegramEnabled && (
              <div style={{ 
                marginLeft: '2rem', 
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                animation: 'slideDown 0.3s'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Telegram Bot Token <span style={{ color: '#f44336' }}>*</span>
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: `2px solid ${token && !isValidToken ? '#f44336' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
                {token && !isValidToken && (
                  <p style={{ fontSize: '0.85rem', color: '#f44336', marginTop: '0.5rem' }}>
                    ⚠️ Invalid token format
                  </p>
                )}
                <TelegramSetupGuide />
              </div>
            )}

            {/* WhatsApp Checkbox */}
            <div style={{
              padding: '1.5rem',
              border: `2px solid ${whatsappEnabled ? '#25D366' : '#e0e0e0'}`,
              borderRadius: '8px',
              backgroundColor: whatsappEnabled ? '#e8f5e9' : 'white',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  style={{ marginRight: '0.75rem', width: '20px', height: '20px', cursor: 'pointer' }}
                  onClick={(e) => e.stopPropagation()}
                />
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                  📱 WhatsApp
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginLeft: '2rem' }}>
                Perfect for phone access • Link via QR code after agent starts
              </p>
            </div>

            {/* WhatsApp Info (conditional) */}
            {whatsappEnabled && (
              <div style={{ 
                marginLeft: '2rem', 
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                animation: 'slideDown 0.3s'
              }}>
                <WhatsAppSetupGuide />
              </div>
            )}

            {/* Validation message */}
            {!hasAtLeastOneChannel && (
              <p style={{ fontSize: '0.9rem', color: '#f44336', marginTop: '1rem' }}>
                ⚠️ Please enable at least one channel
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !hasAtLeastOneChannel || (telegramEnabled && !isValidToken)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: (loading || !hasAtLeastOneChannel || (telegramEnabled && !isValidToken)) ? '#ccc' : '#4fc3f7',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !hasAtLeastOneChannel || (telegramEnabled && !isValidToken)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!loading && hasAtLeastOneChannel && (!telegramEnabled || isValidToken)) {
                e.currentTarget.style.backgroundColor = '#0288d1';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = (loading || !hasAtLeastOneChannel || (telegramEnabled && !isValidToken)) ? '#ccc' : '#4fc3f7';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            {loading ? '🚀 Launching Agent...' : '🚀 Launch Agent'}
          </button>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideDown {
            from { 
              opacity: 0;
              transform: translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default AgentSetup;
