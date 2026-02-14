import React, { useState } from 'react';

interface Props {
  token: string;
  onTokenChange: (token: string) => void;
}

const TelegramSetupGuide: React.FC<Props> = ({ token, onTokenChange }) => {
  const [showToken, setShowToken] = useState(false);

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ marginTop: 0 }}>Setup Your Telegram Bot</h3>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Step 1: Create a Bot</div>
        <p style={{ color: '#666', margin: 0 }}>
          1. Open Telegram and search for <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>@BotFather</code><br />
          2. Send <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>/newbot</code><br />
          3. Follow the prompts to choose a name and username<br />
          4. Copy the bot token provided
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Step 2: Enter Your Bot Token</div>
        <div style={{ position: 'relative' }}>
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#666',
            }}
          >
            {showToken ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Step 3: Launch & Start Chatting</div>
        <p style={{ color: '#666', margin: 0 }}>
          Once your agent is running, find your bot on Telegram and send <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>/start</code> to begin!
        </p>
      </div>

      <div style={{
        padding: '0.75rem',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#1565c0',
      }}>
        🔒 Your token is encrypted and stored securely. We never share it with third parties.
      </div>
    </div>
  );
};

export default TelegramSetupGuide;
