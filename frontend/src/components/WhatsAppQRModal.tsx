import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import API_ENDPOINTS from '../config/endpoints';

interface Props {
  agentId: string;
  onClose: () => void;
  onLinked?: () => void;
}

const WhatsAppQRModal: React.FC<Props> = ({ agentId, onClose, onLinked }) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'not_ready' | 'linked'>('loading');
  const [qrText, setQrText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [qrGeneratedAt, setQrGeneratedAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [checkingLink, setCheckingLink] = useState(false);

  // QR codes expire after 2 minutes
  const QR_EXPIRY_SECONDS = 120;

  const checkLinkStatus = async () => {
    try {
      setCheckingLink(true);
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const response = await fetch(API_ENDPOINTS.getWhatsAppStatus(agentId), {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.linked) {
        setStatus('linked');
        if (onLinked) {
          setTimeout(() => {
            onLinked();
            onClose();
          }, 2000); // Show success for 2 seconds then close
        }
      }
    } catch (err) {
      console.error('Failed to check link status:', err);
    } finally {
      setCheckingLink(false);
    }
  };

  const fetchQR = async () => {
    try {
      setStatus('loading');
      setError(null);

      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const response = await fetch(API_ENDPOINTS.getWhatsAppQR(agentId), {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get QR code');
      }

      if (data.status === 'qr_not_ready') {
        setStatus('not_ready');
        setError(data.message);
        // Auto-retry after 5 seconds
        setTimeout(() => {
          if (retryCount < 6) { // Max 6 retries (30 seconds)
            setRetryCount(retryCount + 1);
            fetchQR();
          }
        }, 5000);
        return;
      }

      if (data.status === 'qr_available' && data.qrUrl) {
        // Fetch the QR text from the pre-signed URL
        const qrResponse = await fetch(data.qrUrl);
        const qrTextContent = await qrResponse.text();
        setQrText(qrTextContent);
        setQrGeneratedAt(data.generatedAt || Math.floor(Date.now() / 1000));
        setStatus('ready');
        
        // Start polling for link status every 5 seconds
        const pollInterval = setInterval(checkLinkStatus, 5000);
        return () => clearInterval(pollInterval);
      }
    } catch (err: any) {
      console.error('Failed to fetch WhatsApp QR:', err);
      setError(err.message || 'Failed to load QR code');
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchQR();
  }, [agentId]);

  // Timer countdown for QR expiry
  useEffect(() => {
    if (status === 'ready' && qrGeneratedAt) {
      const timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - qrGeneratedAt;
        const remaining = QR_EXPIRY_SECONDS - elapsed;
        
        if (remaining <= 0) {
          setTimeRemaining(0);
          clearInterval(timer);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, qrGeneratedAt]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchQR();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeRemaining !== null && timeRemaining <= 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X className="w-6 h-6" />
        </button>

        <div style={{ padding: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333'
          }}>
            Link WhatsApp
          </h2>

          {status === 'loading' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #25D366',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p style={{ color: '#666' }}>Loading QR code...</p>
            </div>
          )}

          {status === 'not_ready' && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffc107'
            }}>
              <p style={{ color: '#856404', marginBottom: '1rem' }}>
                ⏳ {error || 'QR code is being generated...'}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                Retrying automatically... ({retryCount}/6)
              </p>
            </div>
          )}

          {status === 'linked' && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              border: '1px solid #28a745'
            }}>
              <CheckCircle style={{
                width: '64px',
                height: '64px',
                color: '#28a745',
                margin: '0 auto 1rem'
              }} />
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#155724',
                marginBottom: '0.5rem'
              }}>
                ✅ WhatsApp Linked!
              </h3>
              <p style={{ color: '#155724' }}>
                You can now message your agent on WhatsApp
              </p>
            </div>
          )}

          {status === 'ready' && qrText && (
            <>
              {/* Timer */}
              {timeRemaining !== null && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: isExpired ? '#ffebee' : '#e3f2fd',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: `1px solid ${isExpired ? '#f44336' : '#2196f3'}`
                }}>
                  <Clock className="w-4 h-4" style={{ color: isExpired ? '#c62828' : '#1976d2' }} />
                  <span style={{
                    fontWeight: 'bold',
                    color: isExpired ? '#c62828' : '#1976d2'
                  }}>
                    {isExpired ? 'QR Code Expired' : `Expires in ${formatTime(timeRemaining)}`}
                  </span>
                </div>
              )}

              {isExpired ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  backgroundColor: '#ffebee',
                  borderRadius: '8px',
                  border: '1px solid #f44336'
                }}>
                  <p style={{ color: '#c62828', marginBottom: '1rem' }}>
                    ⏰ This QR code has expired
                  </p>
                  <button
                    onClick={handleRetry}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate New QR
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '2px solid #e0e0e0'
                  }}>
                    <pre style={{
                      fontFamily: 'monospace',
                      fontSize: '0.5rem',
                      lineHeight: '0.6',
                      overflow: 'auto',
                      margin: 0,
                      whiteSpace: 'pre',
                      color: '#000'
                    }}>
                      {qrText}
                    </pre>
                  </div>

                  <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #4caf50'
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      marginBottom: '0.75rem',
                      color: '#2e7d32'
                    }}>
                      📱 How to Scan:
                    </h3>
                    <ol style={{
                      paddingLeft: '1.5rem',
                      margin: 0,
                      lineHeight: '1.8',
                      color: '#555'
                    }}>
                      <li>Open <strong>WhatsApp</strong> on your phone</li>
                      <li>Go to <strong>Settings → Linked Devices</strong></li>
                      <li>Tap <strong>"Link a Device"</strong></li>
                      <li><strong>Scan this QR code</strong></li>
                      <li>Done! Your agent will be linked</li>
                    </ol>
                  </div>

                  {checkingLink && (
                    <div style={{
                      textAlign: 'center',
                      padding: '1rem',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      border: '1px solid #2196f3'
                    }}>
                      <p style={{ color: '#1976d2', fontSize: '0.9rem' }}>
                        🔄 Checking if WhatsApp is linked...
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      checkLinkStatus();
                      if (onLinked) onLinked();
                      onClose();
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#20BA5A'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                  >
                    <CheckCircle className="w-5 h-5" />
                    I've Scanned the QR Code
                  </button>

                  <p style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    textAlign: 'center',
                    marginTop: '1rem'
                  }}>
                    💡 We'll auto-detect when WhatsApp links
                  </p>
                </>
              )}
            </>
          )}

          {status === 'error' && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: '#ffebee',
              borderRadius: '8px',
              border: '1px solid #f44336'
            }}>
              <p style={{ color: '#c62828', marginBottom: '1rem' }}>
                ❌ {error || 'Failed to load QR code'}
              </p>
              <button
                onClick={handleRetry}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppQRModal;
