#!/bin/bash

echo "🔍 Monitoring Nameserver Propagation for openpaw.co"
echo "===================================================="
echo "Started: $(date)"
echo ""
echo "Waiting for nameservers to change from GoDaddy to AWS Route 53..."
echo ""
echo "Target nameservers:"
echo "  - ns-1875.awsdns-42.co.uk"
echo "  - ns-1414.awsdns-48.org"
echo "  - ns-556.awsdns-05.net"
echo "  - ns-458.awsdns-57.com"
echo ""
echo "Checking every 60 seconds..."
echo ""

check_count=0
max_checks=60  # 1 hour

while [ $check_count -lt $max_checks ]; do
    check_count=$((check_count + 1))
    elapsed=$((check_count * 1))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "CHECK #$check_count ($(date '+%H:%M:%S UTC'))"
    echo ""
    
    # Check nameservers via Google DNS
    NS_RESULT=$(curl -s "https://dns.google/resolve?name=openpaw.co&type=NS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('Status') == 0:
    ns_servers = [ans['data'].strip('.') for ans in data.get('Answer', [])]
    for ns in ns_servers:
        print(ns)
else:
    print('ERROR')
" 2>/dev/null)
    
    echo "Current nameservers:"
    echo "$NS_RESULT" | sed 's/^/  - /'
    echo ""
    
    # Check if AWS nameservers
    if echo "$NS_RESULT" | grep -q "awsdns"; then
        echo "🎉🎉🎉 SUCCESS! AWS NAMESERVERS DETECTED! 🎉🎉🎉"
        echo ""
        echo "✅ Nameserver propagation complete!"
        echo "✅ DNS is now using Route 53"
        echo ""
        echo "Next: Wait 5-30 minutes for full DNS propagation, then:"
        echo "  - https://openpaw.co will work with HTTPS"
        echo "  - https://www.openpaw.co will continue working"
        echo ""
        exit 0
    fi
    
    # Check if still GoDaddy
    if echo "$NS_RESULT" | grep -q "domaincontrol"; then
        echo "⏳ Still using GoDaddy nameservers (domaincontrol.com)"
        echo "   Waiting for GoDaddy to publish the change..."
    else
        echo "🤔 Unknown nameserver state"
    fi
    
    echo ""
    
    # Wait 60 seconds
    if [ $check_count -lt $max_checks ]; then
        echo "⏰ Next check in 60 seconds..."
        echo ""
        sleep 60
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ 1 hour elapsed and nameservers still not updated."
echo ""
echo "Troubleshooting:"
echo "  1. Verify nameservers in GoDaddy:"
echo "     https://dcc.godaddy.com/control/portfolio/openpaw.co/settings"
echo ""
echo "  2. Make sure you entered all 4 nameservers:"
echo "     ns-1875.awsdns-42.co.uk"
echo "     ns-1414.awsdns-48.org"
echo "     ns-556.awsdns-05.net"
echo "     ns-458.awsdns-57.com"
echo ""
echo "  3. Nameserver changes can take up to 24 hours (rare)"
echo ""
