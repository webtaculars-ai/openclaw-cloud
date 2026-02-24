import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const DashboardTour: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div style={{maxWidth: 1400, padding: 80, width: '100%'}}>
        <h2
          style={{
            fontSize: 64,
            color: '#1f2937',
            marginBottom: 40,
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
          }}
        >
          Dashboard Tour
        </h2>

        {/* Mock Dashboard */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
        >
          {/* Agent Status Card */}
          <div
            style={{
              border: '2px solid #e5e7eb',
              borderRadius: 12,
              padding: 30,
              marginBottom: 30,
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3
                  style={{
                    fontSize: 28,
                    color: '#1f2937',
                    marginBottom: 10,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  My AI Agent
                </h3>
                <p style={{fontSize: 18, color: '#6b7280', fontFamily: 'Arial, sans-serif'}}>
                  Status: <span style={{color: '#10b981', fontWeight: 600}}>● Running</span>
                </p>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: 20, color: '#6b7280', fontFamily: 'Arial, sans-serif'}}>
                  Uptime
                </div>
                <div
                  style={{
                    fontSize: 32,
                    color: '#1f2937',
                    fontWeight: 600,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  24h 15m
                </div>
              </div>
            </div>
          </div>

          {/* Credit Balance */}
          <div
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 12,
              padding: 30,
              marginBottom: 30,
            }}
          >
            <h4
              style={{
                fontSize: 22,
                color: '#1f2937',
                marginBottom: 15,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Credit Balance
            </h4>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
              <span
                style={{
                  fontSize: 48,
                  color: '#2563eb',
                  fontWeight: 700,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                $12.50
              </span>
              <span style={{fontSize: 20, color: '#6b7280', fontFamily: 'Arial, sans-serif'}}>
                / ~1,389 messages remaining
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4
              style={{
                fontSize: 22,
                color: '#1f2937',
                marginBottom: 20,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Recent Activity
            </h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
              {[
                {time: '2m ago', action: 'Web search', cost: '$0.015'},
                {time: '12m ago', action: 'Text generation', cost: '$0.009'},
                {time: '45m ago', action: 'Code execution', cost: '$0.021'},
              ].map((activity, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '15px 20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: 8,
                  }}
                >
                  <span style={{fontSize: 18, color: '#6b7280', fontFamily: 'Arial, sans-serif'}}>
                    {activity.time}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      color: '#1f2937',
                      fontWeight: 500,
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    {activity.action}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      color: '#2563eb',
                      fontWeight: 600,
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    {activity.cost}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 20,
            color: '#6b7280',
            marginTop: 40,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Complete cost transparency - see exactly what each interaction costs
        </p>
      </div>
    </AbsoluteFill>
  );
};
