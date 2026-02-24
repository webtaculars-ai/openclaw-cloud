#!/bin/bash
set -e

echo "🚀 OpenPaw WhatsApp Wrapper"

# Check if WhatsApp is enabled and not already linked
if [ "$WHATSAPP_ENABLED" = "true" ] && [ ! -f /root/.openclaw/credentials/whatsapp/default/creds.json ]; then
  echo "📱 WhatsApp enabled but not linked"
  echo "Attempting to generate QR code..."
  
  # Create a named pipe for capturing output in real-time
  mkfifo /tmp/whatsapp-output
  
  # Start background process to monitor the pipe
  (
    while IFS= read -r line; do
      echo "$line"
      echo "$line" >> /tmp/whatsapp-qr.txt
      
      # Check if we've captured the QR code
      if echo "$line" | grep -q "████"; then
        echo "✅ QR code line detected!"
      fi
    done < /tmp/whatsapp-output
  ) &
  MONITOR_PID=$!
  
  # Run channels login with output redirected to pipe
  # Use timeout to prevent hanging
  timeout 60 openclaw channels login --channel whatsapp > /tmp/whatsapp-output 2>&1 || true
  
  # Close the pipe
  exec 3>&- 2>/dev/null || true
  rm -f /tmp/whatsapp-output
  
  # Check if QR was generated
  if [ -f /tmp/whatsapp-qr.txt ] && grep -q "████" /tmp/whatsapp-qr.txt; then
    echo "✅ QR code captured! Uploading to S3..."
    
    # Upload to S3
    aws s3 cp /tmp/whatsapp-qr.txt \
      s3://openpaw-whatsapp-qr/${AGENT_ID}/qr.txt \
      --region ap-south-1
    
    # Create timestamp
    date -u +%s > /tmp/qr-timestamp.txt
    aws s3 cp /tmp/qr-timestamp.txt \
      s3://openpaw-whatsapp-qr/${AGENT_ID}/timestamp.txt \
      --region ap-south-1
    
    echo "📱 QR code is now available in the UI!"
  else
    echo "⚠️ No QR code generated"
    if [ -f /tmp/whatsapp-qr.txt ]; then
      echo "Output captured:"
      cat /tmp/whatsapp-qr.txt
    fi
  fi
  
  # Clean up
  kill $MONITOR_PID 2>/dev/null || true
  wait $MONITOR_PID 2>/dev/null || true
fi

# Now start the gateway normally
echo "🎯 Starting OpenClaw gateway..."
exec "$@"
