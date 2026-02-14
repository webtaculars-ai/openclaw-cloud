import React from 'react';

interface Props {
  balanceCents: number;
  totalUsedCents: number;
}

const CreditMeter: React.FC<Props> = ({ balanceCents, totalUsedCents }) => {
  const balanceDollars = (balanceCents / 100).toFixed(2);
  const usedDollars = (totalUsedCents / 100).toFixed(2);
  
  const totalCents = balanceCents + totalUsedCents;
  const usedPercent = totalCents > 0 ? (totalUsedCents / totalCents) * 100 : 0;

  const getBarColor = () => {
    if (usedPercent >= 90) return '#f44336';
    if (usedPercent >= 70) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Credit Balance: ${balanceDollars}
          </span>
          <span style={{ color: '#666' }}>
            Total Used: ${usedDollars}
          </span>
        </div>

        <div style={{
          height: '20px',
          backgroundColor: '#e0e0e0',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${100 - usedPercent}%`,
            backgroundColor: getBarColor(),
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {balanceCents === 0 && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404',
        }}>
          ⚠️ Your balance is empty. Please recharge to continue using your agent.
        </div>
      )}
    </div>
  );
};

export default CreditMeter;
