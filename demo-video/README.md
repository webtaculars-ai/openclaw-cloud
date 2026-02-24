# OpenPaw Demo Video - Remotion Project

## Quick Start

```bash
cd openclaw-cloud/demo-video
npm install
npm start  # Preview in browser
npm run build  # Render final video
```

## Project Structure

```
demo-video/
├── package.json          # Dependencies
├── remotion.config.ts    # Remotion configuration
├── src/
│   ├── Root.tsx         # Main composition
│   ├── Video.tsx        # Video component
│   └── scenes/          # Individual scenes
│       ├── Intro.tsx
│       ├── WhatIsOpenPaw.tsx
│       ├── WhoItsFor.tsx
│       ├── HowItWorks.tsx
│       ├── KeyBenefits.tsx
│       ├── DashboardTour.tsx
│       └── Closing.tsx
└── public/
    ├── audio/           # Voiceover audio files
    └── images/          # Screenshots, logos
```

## Duration Breakdown

- Intro: 15s (0-15)
- What is OpenPaw: 30s (15-45)
- Who it's for: 20s (45-65)
- How it works: 45s (65-110)
- Key benefits: 30s (110-140)
- Dashboard tour: 35s (140-175)
- Closing: 5s (175-180)

**Total: 180 seconds (3 minutes)**

## Rendering

### Development Preview
```bash
npm start
```
Opens browser at http://localhost:3000

### Render Video
```bash
# Render to MP4
npm run build

# Output: out/video.mp4
```

### Render Options
```bash
# High quality
npx remotion render src/index.ts Video out/video.mp4 --quality=100

# With audio
npx remotion render src/index.ts Video out/video.mp4 --audio

# Custom resolution
npx remotion render src/index.ts Video out/video.mp4 --width=1920 --height=1080
```

## Text-to-Speech

We'll use Remotion's built-in TTS or Eleven Labs for voiceover:

### Option 1: Remotion TTS (Built-in)
```typescript
import {OffthreadVideo} from 'remotion';

// Auto-generates audio from text
<TextToSpeech text="Your script here" />
```

### Option 2: Eleven Labs (Better quality)
1. Generate audio files from script
2. Place in `public/audio/`
3. Use `<Audio>` component

## Assets Needed

1. **Screenshots:**
   - Dashboard (agent status)
   - Credit balance widget
   - Pricing page
   - Telegram chat with agent

2. **Audio:**
   - Voiceover for each scene (or use TTS)

3. **Branding:**
   - OpenPaw logo
   - Color palette (blue #2563eb)

## Deployment

Once rendered:
```bash
# Upload to YouTube
# Or share via Google Drive/Dropbox
```

## Timeline

- Setup project: 15 min
- Create scenes: 45 min
- Generate voiceover: 30 min (TTS) or 1 hour (manual)
- Render video: 5-10 min
- **Total: 1.5 - 2 hours**
