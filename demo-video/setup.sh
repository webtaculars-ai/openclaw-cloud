#!/bin/bash
set -e

echo "🎬 Setting up OpenPaw Demo Video (Remotion)"
echo ""

cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Preview the video:"
echo "   npm start"
echo ""
echo "2. Render the final video:"
echo "   npm run build"
echo ""
echo "3. Output will be at: out/video.mp4"
echo ""
echo "🎥 Video specs:"
echo "   - Duration: 3 minutes (180 seconds)"
echo "   - Resolution: 1920x1080 (Full HD)"
echo "   - FPS: 30"
echo "   - Format: MP4 (H.264)"
echo ""
echo "💡 Tip: Add voiceover audio files to public/audio/ for better quality"
echo "   or the video will use text overlays only"
