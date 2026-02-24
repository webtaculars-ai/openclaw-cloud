import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scale animation
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 100,
    },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1f2937',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div style={{textAlign: 'center', transform: `scale(${scale})`}}>
        <div style={{fontSize: 120, marginBottom: 40}}>🐾</div>
        <h1
          style={{
            fontSize: 80,
            color: '#fff',
            fontWeight: 700,
            margin: 0,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          OpenPaw
        </h1>
        <p
          style={{
            fontSize: 32,
            color: '#9ca3af',
            marginTop: 20,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Managed AI Agent Platform
        </p>
      </div>

      {/* Voiceover text (for reference) */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 24,
          color: '#6b7280',
          padding: '0 80px',
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.5,
        }}
      >
        "Hi, I'm here to show you OpenPaw - a managed AI agent platform that
        lets you run intelligent AI assistants without any DevOps overhead."
      </div>
    </AbsoluteFill>
  );
};
