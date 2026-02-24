# Browser Configuration Reference

## OpenClaw Browser Config Block

Add this to your OpenClaw `config.json`:

```json
{
  "browser": {
    "enabled": true,
    "headless": true,
    "defaultProfile": "openclaw",
    "noSandbox": true,
    "executablePath": "/usr/bin/chromium",
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu"
    ]
  }
}
```

## Configuration Explained

| Option | Value | Why |
|--------|-------|-----|
| `enabled` | `true` | Turns on browser tool for agents |
| `headless` | `true` | No GUI (required for ECS/containers) |
| `defaultProfile` | `"openclaw"` | Use OpenClaw-managed browser, not Chrome extension |
| `noSandbox` | `true` | Required for containerized environments |
| `executablePath` | `"/usr/bin/chromium"` | Point to Chromium binary (installed via apt) |

## Chromium Launch Args

| Arg | Purpose |
|-----|---------|
| `--no-sandbox` | Disable sandboxing (required for containers) |
| `--disable-setuid-sandbox` | Disable SUID sandbox (not available in containers) |
| `--disable-dev-shm-usage` | Use /tmp instead of /dev/shm (prevents OOM in containers) |
| `--disable-accelerated-2d-canvas` | Use software rendering for 2D canvas |
| `--disable-gpu` | Use software rendering (GPU not available in Fargate) |

## Required Dockerfile Packages

```dockerfile
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*
```

## Environment Variables

```dockerfile
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## ECS Task Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 0.5 vCPU | **1 vCPU** |
| Memory | 1 GB | **2 GB** |

Lower resources may cause:
- Browser launch failures
- OOM kills
- Slow page loads
- Screenshot timeouts

## Testing Browser Setup

### Quick Test
```bash
docker run --rm your-image chromium --headless --no-sandbox --dump-dom https://example.com
```

### Full Test Script
```bash
docker run --rm your-image bash /app/test-browser.sh
```

Expected output:
```
✅ Chromium installed
✅ Required libraries found
✅ Headless mode works
```

## Common Issues

### Issue: "Failed to launch browser: Chromium revision is not downloaded"
**Fix**: Ensure `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `executablePath` is set

### Issue: "No usable sandbox!"
**Fix**: Add `--no-sandbox` flag and set `noSandbox: true`

### Issue: Browser crashes immediately
**Fix**: Add `--disable-dev-shm-usage` (prevents /dev/shm size issues)

### Issue: Screenshots are blank/black
**Fix**: Add `--disable-gpu` (software rendering required)

### Issue: "error while loading shared libraries: libgbm.so.1"
**Fix**: Install `libgbm1` package in Dockerfile

### Issue: Agent OOM killed
**Fix**: Increase task memory to 2+ GB

## Agent Commands

Once deployed, agents can:

```
"Open google.com"
"Take a screenshot of this page"
"Click the search button"
"Fill in the form with my name and email"
"Navigate to the pricing page"
"Extract all the product names from this page"
"Monitor this URL and alert me if the price changes"
```

## Performance Notes

- **Browser startup**: ~2-5 seconds
- **Page load (simple)**: ~1-3 seconds
- **Screenshot**: ~1-2 seconds
- **Memory usage**: 300-800 MB per browser session
- **CPU usage**: Spikes during page load, then low

## Security Considerations

1. **No sandbox mode**: Required for containers, but reduces isolation
   - Mitigated by container-level isolation (ECS task)
   - Only visit trusted URLs or user-requested sites

2. **Headless fingerprinting**: Some sites detect headless browsers
   - OpenClaw uses realistic user agents
   - Add `--disable-blink-features=AutomationControlled` if needed

3. **Cookie/session persistence**: Browser sessions are ephemeral
   - Consider adding session persistence for logged-in workflows

## Cost Per Operation

Assuming $0.048/hour ECS task cost:

| Operation | Time | Cost |
|-----------|------|------|
| Open page | 5 sec | $0.000067 |
| Screenshot | 2 sec | $0.000027 |
| Form fill | 10 sec | $0.000133 |
| Multi-page navigation | 30 sec | $0.000400 |

---

**Version**: 1.0  
**Last Updated**: 2026-02-19  
**Compatible With**: OpenClaw latest, Node.js 22, Debian-based containers
