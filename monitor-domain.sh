#!/bin/bash

echo "🚀 OpenPaw Domain Verification Monitor"
echo "======================================"
echo "Started: $(date)"
echo ""
echo "Checking every 60 seconds until verification completes..."
echo "Press Ctrl+C to stop"
echo ""

check_count=0
max_checks=30  # 30 minutes

while [ $check_count -lt $max_checks ]; do
    check_count=$((check_count + 1))
    echo "[$check_count/30] Checking at $(date +%H:%M:%S)..."
    
    # Check Amplify status
    STATUS=$(aws amplify get-domain-association \
      --app-id d2spow5okg20j4 \
      --domain-name openpaw.co \
      --region ap-south-1 \
      --query 'domainAssociation.domainStatus' \
      --output text 2>/dev/null)
    
    # Check DNS
    DNS_STATUS=$(curl -s "https://dns.google/resolve?name=_3d37d28cad5b240144579db691e6ca70.openpaw.co&type=CNAME" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('Status', 99))")
    
    echo "  Amplify: $STATUS"
    echo "  DNS: $([ "$DNS_STATUS" = "0" ] && echo "✅ Found" || echo "⏳ Propagating")"
    
    # Check if complete
    if [ "$STATUS" = "AVAILABLE" ]; then
        echo ""
        echo "🎉🎉🎉 SUCCESS! Domain is LIVE! 🎉🎉🎉"
        echo ""
        echo "✅ SSL Certificate: Issued"
        echo "✅ DNS Records: Verified"
        echo "✅ Status: AVAILABLE"
        echo ""
        echo "🌐 Your site is now live at:"
        echo "   https://www.openpaw.co"
        echo "   https://openpaw.co (redirects to www)"
        echo ""
        exit 0
    fi
    
    # Wait 60 seconds
    if [ $check_count -lt $max_checks ]; then
        sleep 60
    fi
done

echo ""
echo "⏰ 30 minutes elapsed. Current status: $STATUS"
echo ""
echo "If still pending:"
echo "  1. DNS propagation can take up to 24 hours (rare)"
echo "  2. Verify CNAME record in GoDaddy is exactly correct"
echo "  3. Contact AWS Support if stuck after 24 hours"
echo ""
echo "Run this script again to continue monitoring."
