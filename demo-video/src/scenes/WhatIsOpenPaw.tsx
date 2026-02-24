import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const WhatIsOpenPaw: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div style={{maxWidth: 1200, padding: 80}}>
        <h2
          style={{
            fontSize: 64,
            color: '#1f2937',
            marginBottom: 40,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
          }}
        >
          What is OpenPaw?
        </h2>

        <div style={{fontSize: 28, color: '#4b5563', lineHeight: 1.8, fontFamily: 'Arial, sans-serif'}}>
          <p>
            OpenPaw is a <strong>fully managed AI agent infrastructure</strong> built on OpenClaw,
            an open-source framework.
          </p>
          <p style={{marginTop: 30}}>
            Instead of setting up servers, managing infrastructure, or wrestling with API keys,
            you simply <strong>sign up, provision an agent, and start chatting</strong> through
            Telegram, WhatsApp, or other messaging platforms.
          </p>
          <p style={{marginTop: 30}}>
            Your AI agent runs <strong>24/7 in our secure cloud environment</strong>, powered by
            Claude AI from Anthropic via AWS Bedrock.
          </p>
        </div>

        <div
          style={{
            marginTop: 60,
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
          }}
        >
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 48, marginBottom: 10}}>💬</div>
            <div style={{fontSize: 20, color: '#6b7280'}}>Telegram</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 48, marginBottom: 10}}>📱</div>
            <div style={{fontSize: 20, color: '#6b7280'}}>WhatsApp</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 48, marginBottom: 10}}>💻</div>
            <div style={{fontSize: 20, color: '#6b7280'}}>Discord</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 48, marginBottom: 10}}>☁️</div>
            <div style={{fontSize: 20, color: '#6b7280'}}>Cloud Hosted</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
