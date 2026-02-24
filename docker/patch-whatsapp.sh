#!/bin/bash
# Patch WhatsApp schema to add missing 'enabled' field
# Fix for: https://github.com/openclaw/openclaw/issues/24931

SCHEMA_FILE="/usr/local/lib/node_modules/openclaw/dist/config/zod-schema.providers-whatsapp.js"

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ WhatsApp schema file not found at $SCHEMA_FILE"
  exit 1
fi

echo "📝 Patching WhatsApp schema to add 'enabled' field..."

# Backup original
cp "$SCHEMA_FILE" "${SCHEMA_FILE}.backup"

# Find the line with WhatsAppSharedSchema.extend and add enabled field
# The fix adds: enabled: zod_1.z.boolean().optional(),
sed -i '/WhatsAppSharedSchema\.extend({/a\    enabled: zod_1.z.boolean().optional(),' "$SCHEMA_FILE"

echo "✅ WhatsApp schema patched successfully"
