import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import CreditMeter from '../components/CreditMeter';
import * as api from '../services/api';

interface Props {
  user: any;
  signOut?: () => void;
}

const Billing: React.FC<Props> = ({ user, signOut }) => {
  const [searchParams] = useSearchParams();
  const [credits, setCredits] = useState<api.Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();

    if (searchParams.get('payment') === 'cancelled') {
      setError('Payment was cancelled');
    }
  }, [searchParams]);

  const fetchCredits = async () => {
    try {
      const data = await api.getCredits();
      setCredits(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (tier: 'starter' | 'builder' | 'pro') => {
    setRecharging(tier);
    try {
      const { url } = await api.rechargeCredits(tier);
      window.location.href = url; // Redirect to Stripe
    } catch (err: any) {
      setError(err.message);
      setRecharging(null);
    }
  };

  if (loading) {
    return (
      <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </Layout>
    );
  }

  const tiers = [
    { name: 'starter', display: 'Starter', price: '$5', credits: '$5', bonus: 'First time: $10 (2x!)' },
    { name: 'builder', display: 'Builder', price: '$15', credits: '$15', bonus: null },
    { name: 'pro', display: 'Pro', price: '$50', credits: '$50', bonus: null },
  ];

  return (
    <Layout userEmail={user?.signInDetails?.loginId} onSignOut={signOut}>
      <h1>Billing & Credits</h1>

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
        }}>
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {credits && (
        <CreditMeter
          balanceCents={credits.balance}
          totalUsedCents={credits.totalUsed}
        />
      )}

      <h2>Recharge Credits</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {tiers.map((tier) => (
          <div
            key={tier.name}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fff',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginTop: 0 }}>{tier.display}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', margin: '1rem 0' }}>
              {tier.price}
            </div>
            <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '1rem', minHeight: '2.5rem' }}>
              {tier.bonus || `→ ${tier.credits} credits`}
            </div>
            <button
              onClick={() => handleRecharge(tier.name as any)}
              disabled={recharging === tier.name}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: recharging === tier.name ? '#ccc' : '#4fc3f7',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: recharging === tier.name ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {recharging === tier.name ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        ))}
      </div>

      <h2>Transaction History</h2>
      {credits && credits.transactions.length > 0 ? (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#fff',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {credits.transactions.map((txn) => (
                <tr key={txn.txnId} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      backgroundColor: txn.type === 'usage' ? '#ffebee' : '#e8f5e9',
                      color: txn.type === 'usage' ? '#c62828' : '#2e7d32',
                    }}>
                      {txn.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    {txn.description}
                  </td>
                  <td style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: txn.amountCents > 0 ? '#4caf50' : '#f44336',
                  }}>
                    {txn.amountCents > 0 ? '+' : ''}${(txn.amountCents / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '2rem',
          backgroundColor: '#fff',
          textAlign: 'center',
          color: '#666',
        }}>
          No transactions yet
        </div>
      )}
    </Layout>
  );
};

export default Billing;
