import React from 'react';

const WhatsAppSetupGuide: React.FC = () => {
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#e8f5e9',
      border: '1px solid #4caf50',
      borderRadius: '8px',
      fontSize: '0.9rem',
      color: '#2e7d32'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        ✅ WhatsApp Enabled!
      </div>
      <p style={{ margin: 0, lineHeight: '1.6' }}>
        After your agent starts, you'll see a "Link WhatsApp" button on your dashboard. 
        Click it to scan a QR code and connect your WhatsApp.
      </p>
      <div style={{
        marginTop: '0.75rem',
        padding: '0.75rem',
        backgroundColor: 'white',
        borderRadius: '6px',
        fontSize: '0.85rem'
      }}>
        <strong>How it works:</strong>
        <ol style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
          <li>Launch your agent</li>
          <li>Wait 30-60 seconds for it to start</li>
          <li>Click "Link WhatsApp" on dashboard</li>
          <li>Scan QR code with your phone</li>
          <li>Start chatting on WhatsApp!</li>
        </ol>
      </div>
    </div>
  );
};

export default WhatsAppSetupGuide;
