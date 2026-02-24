import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import CreditMeter from '../components/CreditMeter';
import * as api from '../services/api';
import { redeemPromoCode } from '../services/promoCode';

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
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

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
    
    // If referral code is applied, redeem it now
    if (referralApplied && referralCode) {
      try {
        const result = await redeemPromoCode(referralCode);
        
        if (result.success) {
          setSuccess(`🎉 Success! Added $${((result.bonusAmount || 0) / 100).toFixed(2)} credits to your account!`);
          setReferralCode('');
          setReferralApplied(false);
          // Refresh credits
          await fetchCredits();
        } else {
          setError(result.error || 'Failed to redeem code');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to redeem code');
      }
      
      setRecharging(null);
      return;
    }
    
    // No promo code - proceed with normal purchase
    try {
      const { url } = await api.rechargeCredits(tier);
      
      if (url && !url.includes('demo')) {
        window.location.href = url;
      } else {
        setError('Payment system not yet configured. Please try a promo code or contact support.');
        setRecharging(null);
      }
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

      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>
      )}

      {credits && (
        <CreditMeter
          balanceCents={credits.balance}
          totalUsedCents={credits.totalUsed}
        />
      )}

      {/* Referral Code Section */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <h3 style={{ marginTop: 0, color: '#15803d' }}>🎁 Promo Code = FREE Credits!</h3>
        <p style={{ color: '#166534', marginBottom: '1rem', fontSize: '0.95rem' }}>
          Have a promo code? Enter it below to get <strong>$20 FREE credits</strong> instantly - no payment required!
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Enter promo code (e.g., LAUNCH2026-72D1E9CE)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              disabled={referralApplied}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #22c55e',
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'monospace',
              }}
            />
          </div>
          <button
            onClick={() => {
              if (referralCode) {
                const validCodes = [
                  'LAUNCH2026-72D1E9CE',
                  'LAUNCH2026-997390A7',
                  'LAUNCH2026-816375EB',
                  'LAUNCH2026-5EC7545A',
                  'LAUNCH2026-47A27035'
                ];
                
                if (validCodes.includes(referralCode.toUpperCase())) {
                  setReferralApplied(true);
                  setError(null);
                } else {
                  setError('Invalid promo code. Please check and try again.');
                }
              }
            }}
            disabled={!referralCode || referralApplied}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: referralApplied ? '#22c55e' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: referralApplied || !referralCode ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            {referralApplied ? '✓ Applied' : 'Apply Code'}
          </button>
        </div>
        {referralApplied && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ color: '#22c55e', fontSize: '0.95rem', fontWeight: 'bold' }}>
              ✓ Code "{referralCode}" validated!
            </div>
            <div style={{ color: '#15803d', fontSize: '0.9rem', marginTop: '0.25rem', padding: '0.5rem', backgroundColor: '#dcfce7', borderRadius: '4px' }}>
              🎉 Click any "Redeem Code" button below to claim your <strong>$20 FREE credits</strong> instantly!
            </div>
          </div>
        )}
      </div>

      <h2>{referralApplied ? 'Redeem Your Free Credits' : 'Purchase Credits'}</h2>
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
                backgroundColor: recharging === tier.name ? '#ccc' : (referralApplied ? '#22c55e' : '#4fc3f7'),
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: recharging === tier.name ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {recharging === tier.name ? 'Processing...' : (referralApplied ? '🎁 Redeem Code' : 'Purchase')}
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
                    {new Date(txn.timestamp).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      backgroundColor: txn.type.includes('USAGE') ? '#ffebee' : '#e8f5e9',
                      color: txn.type.includes('USAGE') ? '#c62828' : '#2e7d32',
                    }}>
                      {txn.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    {txn.promoCode ? `Promo: ${txn.promoCode}` : 'Agent usage'}
                  </td>
                  <td style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: txn.amount > 0 ? '#4caf50' : '#f44336',
                  }}>
                    {txn.amount > 0 ? '+' : ''}${(txn.amount / 100).toFixed(2)}
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
