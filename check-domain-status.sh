#!/bin/bash

echo "🔍 Checking Amplify domain verification status..."
echo "Domain: openpaw.co"
echo "Time: $(date)"
echo ""

# Check Amplify status
echo "📊 Amplify Domain Status:"
STATUS=$(aws amplify get-domain-association \
  --app-id d2spow5okg20j4 \
  --domain-name openpaw.co \
  --region ap-south-1 \
  --query 'domainAssociation.domainStatus' \
  --output text)

echo "Status: $STATUS"
echo ""

# Check DNS propagation
echo "🌐 DNS Verification Record Status:"
DNS_CHECK=$(curl -s "https://dns.google/resolve?name=_3d37d28cad5b240144579db691e6ca70.openpaw.co&type=CNAME" | python3 -c "import sys, json; data=json.load(sys.stdin); print('FOUND' if data.get('Status')==0 else 'NOT FOUND')")

echo "DNS Record: $DNS_CHECK"
echo ""

# Check www
echo "🌐 WWW CNAME Status:"
WWW_CHECK=$(curl -s "https://dns.google/resolve?name=www.openpaw.co&type=CNAME" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['Answer'][0]['data'] if data.get('Status')==0 else 'NOT FOUND')")

echo "www.openpaw.co → $WWW_CHECK"
echo ""

# Summary
echo "📋 Summary:"
if [ "$STATUS" = "AVAILABLE" ]; then
    echo "✅ Domain is LIVE!"
    echo "🎉 Visit: https://www.openpaw.co"
elif [ "$STATUS" = "PENDING_VERIFICATION" ]; then
    if [ "$DNS_CHECK" = "FOUND" ]; then
        echo "⏳ Verification record found. Waiting for AWS to verify (~5-10 min)..."
    else
        echo "⚠️  Verification record NOT found in DNS yet."
        echo "Either:"
        echo "  1. Wait 5-10 minutes for DNS propagation"
        echo "  2. Double-check the CNAME record in GoDaddy:"
        echo ""
        echo "     Name: _3d37d28cad5b240144579db691e6ca70"
        echo "     Value: _f42073e854e3711976343721f8ff7183.jkddzztszm.acm-validations.aws."
    fi
else
    echo "Status: $STATUS"
fi

echo ""
echo "Run this script again in 5 minutes to check progress."
