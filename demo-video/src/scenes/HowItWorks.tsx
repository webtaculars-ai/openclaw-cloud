import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  const steps = [
    {
      number: '1',
      title: 'Sign Up & Choose Plan',
      desc: 'Pay-as-you-go credits or monthly subscriptions starting at $9',
      icon: '💳',
    },
    {
      number: '2',
      title: 'Provision Your Agent',
      desc: 'We handle infrastructure - just configure and connect your messaging app',
      icon: '⚙️',
    },
    {
      number: '3',
      title: 'Start Chatting',
      desc: 'AI responds instantly. Auto-scales down when idle to save costs',
      icon: '💬',
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#fff',
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
          How It Works
        </h2>

        <div style={{display: 'flex', gap: 60, alignItems: 'flex-start'}}>
          {steps.map((step, i) => {
            const stepOpacity = interpolate(frame, [i * 15, i * 15 + 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const translateY = interpolate(frame, [i * 15, i * 15 + 30], [50, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  opacity: stepOpacity,
                  transform: `translateY(${translateY}px)`,
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 56,
                    fontWeight: 700,
                    margin: '0 auto 30px',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  {step.number}
                </div>

                <div style={{fontSize: 60, textAlign: 'center', marginBottom: 20}}>
                  {step.icon}
                </div>

                <h3
                  style={{
                    fontSize: 28,
                    color: '#1f2937',
                    marginBottom: 15,
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontSize: 20,
                    color: '#6b7280',
                    lineHeight: 1.6,
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
