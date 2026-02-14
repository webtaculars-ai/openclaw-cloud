#!/bin/bash

echo "🚀 OpenPaw Domain Verification Monitor (5-minute intervals)"
echo "==========================================================="
echo "Started: $(date)"
echo ""
echo "Checking every 5 minutes (300 seconds)..."
echo ""

check_count=0
max_checks=12  # 1 hour total (12 checks × 5 min)

while [ $check_count -lt $max_checks ]; do
    check_count=$((check_count + 1))
    elapsed=$((check_count * 5))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "CHECK #$check_count (Time elapsed: $elapsed minutes)"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S UTC')"
    echo ""
    
    # Check Amplify status
    STATUS=$(aws amplify get-domain-association \
      --app-id d2spow5okg20j4 \
      --domain-name openpaw.co \
      --region ap-south-1 \
      --query 'domainAssociation.domainStatus' \
      --output text 2>/dev/null)
    
    # Check DNS with Google
    DNS_GOOGLE=$(curl -s "https://dns.google/resolve?name=_3d37d28cad5b240144579db691e6ca70.openpaw.co&type=CNAME" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('Status', 99))" 2>/dev/null)
    
    # Check DNS with Cloudflare
    DNS_CF=$(curl -s "https://cloudflare-dns.com/dns-query?name=_3d37d28cad5b240144579db691e6ca70.openpaw.co&type=CNAME" -H "accept: application/dns-json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('Status', 99))" 2>/dev/null)
    
    # Check www record
    WWW_STATUS=$(curl -s "https://dns.google/resolve?name=www.openpaw.co&type=CNAME" | python3 -c "import sys, json; data=json.load(sys.stdin); print('OK' if data.get('Status')==0 else 'FAIL')" 2>/dev/null)
    
    echo "📊 Status Report:"
    echo "  Amplify Domain Status: $STATUS"
    echo "  DNS (Google):          $([ "$DNS_GOOGLE" = "0" ] && echo "✅ FOUND" || echo "⏳ Not yet (Status: $DNS_GOOGLE)")"
    echo "  DNS (Cloudflare):      $([ "$DNS_CF" = "0" ] && echo "✅ FOUND" || echo "⏳ Not yet (Status: $DNS_CF)")"
    echo "  WWW CNAME:             $([ "$WWW_STATUS" = "OK" ] && echo "✅ OK" || echo "⚠️  Issue")"
    echo ""
    
    # Check if complete
    if [ "$STATUS" = "AVAILABLE" ]; then
        echo ""
        echo "🎉🎉🎉 SUCCESS! DOMAIN IS LIVE! 🎉🎉🎉"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "✅ SSL Certificate: Issued and Active"
        echo "✅ DNS Records: Verified by AWS"
        echo "✅ Status: AVAILABLE"
        echo "✅ Time taken: $elapsed minutes"
        echo ""
        echo "🌐 Your OpenPaw SaaS is now live at:"
        echo "   🔗 https://www.openpaw.co"
        echo "   🔗 https://openpaw.co (redirects to www)"
        echo ""
        echo "🎊 Next steps:"
        echo "   1. Visit https://www.openpaw.co"
        echo "   2. Sign up for an account"
        echo "   3. Configure Lemon Squeezy payments"
        echo "   4. Launch! 🚀"
        echo ""
        exit 0
    fi
    
    # Show progress
    if [ "$DNS_GOOGLE" = "0" ] || [ "$DNS_CF" = "0" ]; then
        echo "✨ DNS verification record is visible!"
        echo "   AWS ACM is likely verifying now..."
        echo "   SSL certificate should be issued soon."
    else
        echo "⏳ Waiting for DNS propagation..."
        echo "   GoDaddy nameservers are updating globally."
    fi
    
    echo ""
    
    # Wait 5 minutes (300 seconds) unless it's the last check
    if [ $check_count -lt $max_checks ]; then
        echo "⏰ Next check in 5 minutes (at $(date -d '+5 minutes' '+%H:%M:%S' 2>/dev/null || date -v+5M '+%H:%M:%S' 2>/dev/null || echo '5 minutes'))..."
        echo ""
        sleep 300
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ 1 hour elapsed. Current status: $STATUS"
echo ""
if [ "$STATUS" != "AVAILABLE" ]; then
    echo "⚠️  Domain is still pending after 1 hour."
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Verify CNAME record in GoDaddy:"
    echo "     Name: _3d37d28cad5b240144579db691e6ca70"
    echo "     Value: _f42073e854e3711976343721f8ff7183.jkddzztszm.acm-validations.aws."
    echo ""
    echo "  2. DNS propagation can take up to 24 hours (rare)"
    echo ""
    echo "  3. Check Amplify console for any errors:"
    echo "     https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1#/d2spow5okg20j4"
    echo ""
    echo "  4. Run this script again to continue monitoring"
fi
echo ""
