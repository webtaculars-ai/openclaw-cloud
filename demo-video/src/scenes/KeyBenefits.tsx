import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const KeyBenefits: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  const benefits = [
    {icon: '🚀', title: 'Zero DevOps', desc: 'We manage servers, updates, infrastructure'},
    {icon: '💰', title: 'Pay-per-use', desc: 'Credits only consumed during conversations'},
    {icon: '⏸️', title: 'Auto-stop', desc: 'Agents hibernate when idle to save costs'},
    {icon: '🔒', title: 'Privacy-focused', desc: 'Data stays secure, no AI training on your data'},
    {icon: '📊', title: 'Transparent pricing', desc: 'No hidden fees, clear credit system'},
    {icon: '🔓', title: 'Open foundation', desc: 'Built on Apache 2.0 licensed OpenClaw'},
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1f2937',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div style={{maxWidth: 1400, padding: 80}}>
        <h2
          style={{
            fontSize: 64,
            color: '#fff',
            marginBottom: 60,
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
          }}
        >
          Why Choose OpenPaw?
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 40,
          }}
        >
          {benefits.map((benefit, i) => {
            const cardOpacity = interpolate(frame, [i * 5, i * 5 + 20], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: 30,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.2)',
                  opacity: cardOpacity,
                }}
              >
                <div style={{fontSize: 48, marginBottom: 15}}>{benefit.icon}</div>
                <h3
                  style={{
                    fontSize: 24,
                    color: '#fff',
                    marginBottom: 10,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {benefit.title}
                </h3>
                <p
                  style={{
                    fontSize: 18,
                    color: '#9ca3af',
                    lineHeight: 1.5,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
