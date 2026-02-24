import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const opacity = interpolate(frame, [0, 15], [0, 1]);

  const scale = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 100,
    },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div style={{textAlign: 'center', transform: `scale(${Math.min(scale, 1)})`}}>
        <div style={{fontSize: 100, marginBottom: 30}}>🐾</div>
        <h2
          style={{
            fontSize: 72,
            color: '#fff',
            marginBottom: 30,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
          }}
        >
          Ready to Get Started?
        </h2>
        <p
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.9)',
            fontFamily: 'Arial, sans-serif',
            marginBottom: 40,
          }}
        >
          Visit openpaw.co
        </p>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#fff',
            color: '#2563eb',
            padding: '20px 60px',
            borderRadius: 12,
            fontSize: 28,
            fontWeight: 600,
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          Launch Your Agent in Minutes
        </div>

        <p
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 40,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          No credit card required to explore
        </p>
      </div>
    </AbsoluteFill>
  );
};
