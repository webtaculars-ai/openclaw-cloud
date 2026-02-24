import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const WhoItsFor: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  const personas = [
    {icon: '👨‍💻', title: 'Individual Developers', desc: 'Personal AI assistants without infrastructure hassle'},
    {icon: '🏢', title: 'Small Businesses', desc: 'Customer support and workflow automation'},
    {icon: '👥', title: 'Teams', desc: 'Collaborative AI agents for shared projects'},
    {icon: '🚀', title: 'Anyone', desc: 'Powerful AI with zero DevOps required'},
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div style={{maxWidth: 1400, padding: 80}}>
        <h2
          style={{
            fontSize: 64,
            color: '#1f2937',
            marginBottom: 60,
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
          }}
        >
          Who Is OpenPaw For?
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
          }}
        >
          {personas.map((persona, i) => {
            const cardOpacity = interpolate(frame, [i * 5, i * 5 + 20], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#fff',
                  padding: 40,
                  borderRadius: 16,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  opacity: cardOpacity,
                }}
              >
                <div style={{fontSize: 60, marginBottom: 20}}>{persona.icon}</div>
                <h3
                  style={{
                    fontSize: 32,
                    color: '#1f2937',
                    marginBottom: 15,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {persona.title}
                </h3>
                <p
                  style={{
                    fontSize: 22,
                    color: '#6b7280',
                    lineHeight: 1.6,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  {persona.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
