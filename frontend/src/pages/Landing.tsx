import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1a1a2e',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ color: '#4fc3f7', fontSize: '1.5rem', fontWeight: 'bold' }}>
          OpenPaw Cloud
        </div>
        <Link
          to="/dashboard"
          style={{
            backgroundColor: '#4fc3f7',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>
          Your AI Agent, Running in Minutes
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Deploy your own OpenPaw agent to AWS with zero infrastructure hassle.
        </p>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-block',
            backgroundColor: '#fff',
            color: '#667eea',
            padding: '1rem 2rem',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          Start for $5
        </Link>
      </section>

      {/* How It Works */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}>💳</div>
            <h3>1. Sign Up & Pay $5</h3>
            <p style={{ color: '#666' }}>
              Get $10 in credits (2x welcome bonus) to start
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <h3>2. Connect Telegram</h3>
            <p style={{ color: '#666' }}>
              Create a bot with @BotFather, paste your token
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3>3. Start Chatting</h3>
            <p style={{ color: '#666' }}>
              Your agent is live! Pay only for what you use.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ backgroundColor: '#f5f5f5', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Simple, Fair Pricing</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}>
            {[
              { name: 'Starter', price: '$5', bonus: '$10 credits (first time 2x!)', desc: 'Perfect for trying it out' },
              { name: 'Builder', price: '$15', credits: '$15 credits', desc: 'Best for regular use' },
              { name: 'Pro', price: '$50', credits: '$50 credits', desc: 'For power users' },
            ].map((tier) => (
              <div
                key={tier.name}
                style={{
                  backgroundColor: '#fff',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ marginTop: 0 }}>{tier.name}</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', margin: '1rem 0' }}>
                  {tier.price}
                </div>
                <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {tier.bonus || tier.credits}
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{tier.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
            Pay-as-you-go model usage. No subscriptions. Credits never expire.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1a1a2e',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p>© 2025 OpenPaw Cloud. Powered by AWS + Bedrock.</p>
      </footer>
    </div>
  );
};

export default Landing;
