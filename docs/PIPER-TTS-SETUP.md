# Piper TTS — VPS Setup Guide (DEPRECATED / NOT IN USE)

> **STATUS:** Rolled back. The agent currently uses browser SpeechSynthesis.
> This document is kept as a reference if the team later decides to
> self-host Piper TTS. The route + frontend wiring has been removed.

---

Self-hosted text-to-speech for Jarvis. Free forever, no API keys, no monthly
quotas. Voice quality (especially English) competitive with paid services.

**Repository:** https://github.com/rhasspy/piper
**License:** MIT

---

## Why Piper

| Aspect | Piper (self-hosted) | ElevenLabs free | Azure free | Google Cloud free |
|--------|--------------------|-----------------|------------|--------------------|
| Cost | $0 forever | $0 / 10k chars/month | $0 / 500k chars/month | $0 / 1M chars/month |
| Indonesian voice | Community model (medium quality) | Multilingual model | id-ID-ArdiNeural (premium) | id-ID-Wavenet-B (premium) |
| English voice | Excellent (Ryan medium) | Excellent | Excellent | Excellent |
| Latency | ~300-800ms on VPS | ~800-2000ms | ~400-1000ms | ~400-1000ms |
| External dependency | None | API | API | API |
| VPS load | ~80MB RAM, brief CPU spike per request | None | None | None |

You picked self-hosted for: zero ongoing cost + privacy + no quota surprises.
Trade-off accepted: Indonesian voice quality is medium (community ONNX model)
vs. premium cloud alternatives.

---

## VPS install — one-shot script

SSH into the VPS as root (or with sudo). This script installs Piper and the
required voice models (English Ryan + Indonesian Fajri) under `/opt/piper`.

```bash
#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
PIPER_VERSION="2023.11.14-2"           # latest stable as of 2026-06; check releases for newer
PIPER_DIR="/opt/piper"
MODELS_DIR="${PIPER_DIR}/models"

# --- Detect arch ---
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  PIPER_ARCH="amd64" ;;
  aarch64) PIPER_ARCH="arm64" ;;
  armv7l)  PIPER_ARCH="armv7" ;;
  *) echo "Unsupported arch: $ARCH"; exit 1 ;;
esac

# --- Install Piper binary ---
mkdir -p "${PIPER_DIR}" "${MODELS_DIR}"
cd /tmp
curl -fL -o piper.tar.gz \
  "https://github.com/rhasspy/piper/releases/download/${PIPER_VERSION}/piper_linux_${PIPER_ARCH}.tar.gz"
tar -xzf piper.tar.gz -C /tmp
# The tarball extracts a `piper/` folder containing the binary + libs
cp -r /tmp/piper/* "${PIPER_DIR}/"
chmod +x "${PIPER_DIR}/piper"
rm -rf /tmp/piper /tmp/piper.tar.gz

# --- Download EN voice (Ryan, medium quality — male, natural) ---
cd "${MODELS_DIR}"
curl -fL -O \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx"
curl -fL -O \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json"

# --- Download ID voice (Fajri, medium quality — male, community model) ---
# Note: Indonesian model may not be on rhasspy/piper-voices yet — check first.
# Fallback: keep only English; agent will use English voice for Indonesian text.
if curl -fLs --head \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/fajri/medium/id_ID-fajri-medium.onnx" \
  > /dev/null 2>&1; then
  curl -fL -O \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/fajri/medium/id_ID-fajri-medium.onnx"
  curl -fL -O \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/fajri/medium/id_ID-fajri-medium.onnx.json"
  echo "Indonesian model installed."
else
  echo "WARNING: Indonesian voice not found in official Piper voices."
  echo "         English voice will be used for Indonesian text (acceptable but accented)."
fi

# --- Permission for the nodejs process user (commonly 'www-data' or 'pm2') ---
# Adjust to whatever user PM2 runs as on your VPS
PIPER_USER="${PIPER_USER:-www-data}"
chown -R "${PIPER_USER}:${PIPER_USER}" "${PIPER_DIR}" || \
  echo "WARNING: could not chown ${PIPER_DIR} to ${PIPER_USER} — adjust if needed"

# --- Smoke test ---
echo "Testing English voice..."
echo "Hello, I am Jarvis from IDE Asia." | "${PIPER_DIR}/piper" \
  --model "${MODELS_DIR}/en_US-ryan-medium.onnx" \
  --output_file /tmp/piper-test.wav
if [ -s /tmp/piper-test.wav ]; then
  echo "OK — English TTS generates $(stat -c%s /tmp/piper-test.wav) bytes of WAV"
else
  echo "FAIL — English TTS produced empty output"
  exit 1
fi

if [ -f "${MODELS_DIR}/id_ID-fajri-medium.onnx" ]; then
  echo "Testing Indonesian voice..."
  echo "Halo, saya Jarvis dari IDE Asia." | "${PIPER_DIR}/piper" \
    --model "${MODELS_DIR}/id_ID-fajri-medium.onnx" \
    --output_file /tmp/piper-test-id.wav
  if [ -s /tmp/piper-test-id.wav ]; then
    echo "OK — Indonesian TTS generates $(stat -c%s /tmp/piper-test-id.wav) bytes"
  fi
fi

echo "Done. Piper installed at ${PIPER_DIR}/piper"
```

Save as `/root/install-piper.sh`, then run:

```bash
chmod +x /root/install-piper.sh
sudo bash /root/install-piper.sh
```

Expected install time: 2-5 minutes (most of it downloading the voice models,
which are ~60-120MB each).

---

## Configure the app

Add to your `.env` on the VPS (or rely on the defaults baked into
`src/routes/agent.js`):

```bash
# Defaults shown — only set these if you customized install paths
PIPER_BIN=/opt/piper/piper
PIPER_MODEL_EN=/opt/piper/models/en_US-ryan-medium.onnx
PIPER_MODEL_ID=/opt/piper/models/id_ID-fajri-medium.onnx
TTS_MAX_CHARS=600
TTS_TIMEOUT_MS=15000
```

Reload PM2 so it picks up the env:

```bash
cd /var/www/idea-website
pm2 reload idea-website --update-env
pm2 logs idea-website --lines 30 --nostream
```

You should see in the logs:

```
[tts] Piper ready — /opt/piper/piper
```

(or, if Indonesian model is missing:)
```
[tts] Indonesian model missing at /opt/piper/models/id_ID-fajri-medium.onnx — ID requests will use English voice
```

---

## Verify

### Quick health check

```bash
curl -s https://ide.asia/agent/tts/status | jq
```

Should return something like:

```json
{
  "available": true,
  "bin": "/opt/piper/piper",
  "modelEn": "/opt/piper/models/en_US-ryan-medium.onnx",
  "modelEnExists": true,
  "modelId": "/opt/piper/models/id_ID-fajri-medium.onnx",
  "modelIdExists": true,
  "cacheDir": "/var/www/idea-website/public/audio/tts-cache",
  "cacheFiles": 0
}
```

### End-to-end TTS test

```bash
# English
curl -X POST https://ide.asia/agent/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, I am Jarvis from IDE Asia.","lang":"en"}' \
  -o /tmp/jarvis-en.wav

# Indonesian
curl -X POST https://ide.asia/agent/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Halo, saya Jarvis dari IDE Asia.","lang":"id"}' \
  -o /tmp/jarvis-id.wav

ls -lh /tmp/jarvis-*.wav
# Play with: ffplay /tmp/jarvis-en.wav   (or scp to local + open)
```

### Browser test

Open https://ide.asia/agent in Chrome. Open DevTools → Network tab. Type
"hello" and hit send. Look for the `/agent/tts` request:

- Status 200 = Piper working
- Response header `Content-Type: audio/wav` = correct
- Response header `X-TTS-Cache: MISS` (first time) or `HIT` (subsequent)
- Audio plays through your speakers via the `<audio>` element

If you get 503: see Troubleshooting.

---

## Choosing different voices

Piper has 100+ free voices. Browse the catalog:
https://rhasspy.github.io/piper-samples/

Switch voice by downloading another `.onnx` + `.onnx.json` pair into
`/opt/piper/models/` and updating env vars:

```bash
# Example: switch English to British male "Alan"
cd /opt/piper/models
curl -fL -O https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium/en_GB-alan-medium.onnx
curl -fL -O https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/alan/medium/en_GB-alan-medium.onnx.json

# Then in .env:
# PIPER_MODEL_EN=/opt/piper/models/en_GB-alan-medium.onnx
pm2 reload idea-website --update-env
```

### Recommended male voices

| Language | Voice | Quality | Notes |
|----------|-------|---------|-------|
| en_US | ryan-medium | High | Default. Natural American male. |
| en_US | joe-medium | High | Alternative warmer American male |
| en_GB | alan-medium | High | British male, sounds authoritative ("Jarvis"-like) |
| en_GB | northern_english_male-medium | High | Yorkshire male |
| id_ID | fajri-medium | Medium | Community Indonesian male |

For a "Jarvis" persona we recommend **en_GB-alan-medium** — it's the closest
to the Iron Man Jarvis voice in tone. The default `en_US-ryan-medium` is more
neutral/American.

---

## Performance + scaling

- **Cold start** of Piper subprocess: ~150ms. The model loads each request.
- **Generation speed**: ~5-10× faster than realtime on a 2-core VPS.
- **Memory**: ~80-120MB peak per request, released immediately after.
- **Concurrency**: Each request spawns its own subprocess. The VPS handles
  2-4 concurrent requests on a 2 vCPU box comfortably. For higher load,
  consider running a persistent piper HTTP server (see "Server mode" below).
- **Cache**: First request generates + caches. Subsequent identical requests
  serve from disk in <10ms. Cache grows with usage — clean it periodically
  if disk is tight.

### Cache cleanup cron (optional)

Add to `/etc/cron.daily/piper-tts-cache`:

```bash
#!/usr/bin/env bash
# Remove cache files older than 30 days
find /var/www/idea-website/public/audio/tts-cache -type f -mtime +30 -delete
```

```bash
chmod +x /etc/cron.daily/piper-tts-cache
```

### Server mode for higher concurrency (optional)

If you have many concurrent users (50+ simultaneous), running Piper as a
persistent HTTP server avoids per-request subprocess overhead:

```bash
# Start piper as HTTP server on localhost:5000
/opt/piper/piper \
  --model /opt/piper/models/en_US-ryan-medium.onnx \
  --http \
  --port 5000 &

# Then modify src/routes/agent.js to POST to http://127.0.0.1:5000 instead
# of spawning subprocess. For your current scale this is unnecessary.
```

---

## Troubleshooting

### `[tts] Piper not found at /opt/piper/piper`

Install didn't run or `PIPER_BIN` env points to the wrong path. Verify:

```bash
ls -l /opt/piper/piper
file /opt/piper/piper   # should show "ELF 64-bit LSB executable"
```

### TTS endpoint returns 503 + frontend falls back to SpeechSynthesis

Check PM2 logs:

```bash
pm2 logs idea-website --lines 50 | grep tts
```

Common causes:
1. Piper binary not executable → `chmod +x /opt/piper/piper`
2. Wrong user permission → `chown -R www-data:www-data /opt/piper`
3. Missing shared lib → `ldd /opt/piper/piper` (look for `not found`)
4. Model file corrupted → re-download

### Audio sounds robotic or stuttering

You may have downloaded a `-low` quality voice instead of `-medium`. Verify:

```bash
ls -lh /opt/piper/models/*.onnx
```

Medium-quality models are 60-120MB. Low-quality are 10-30MB.

### Indonesian voice not available

Piper's Indonesian voice (`id_ID-fajri`) isn't in the official voices repo
as of late 2025. If the smoke test step failed to download it, the system
falls back to English voice for Indonesian text — works but sounds accented.

Alternatives:
1. **Browser SpeechSynthesis fallback** — frontend automatically uses
   `id-ID-DamayantiNeural` on the user's device if Piper returns 503 or
   no ID model. Quality is excellent but voice is female.
2. **Hybrid model** — use Piper for English, browser TTS for Indonesian.
   Already the default behavior of the agent.

### High CPU during requests

Normal. Piper uses all available cores during inference for ~200-500ms.
If you see sustained high CPU, check for stuck Piper processes:

```bash
ps aux | grep piper | grep -v grep
```

The route enforces a 15-second timeout but if many requests fire
simultaneously, you'll see spikes.

---

## Cost summary

| Item | Cost |
|------|------|
| Piper binary | $0 |
| Voice models | $0 (Apache 2.0 / MIT licensed) |
| VPS compute | already included in your VPS subscription |
| **Monthly TTS cost** | **$0** |

For comparison:
- ElevenLabs Pro plan: $99/month for 500k chars
- Azure Speech beyond free tier: $4/million chars
- Google Cloud TTS beyond free tier: $4/million chars

At a typical 50,000 generated characters/month of Jarvis usage, Piper
saves $4-10/month. At 500,000/month, it saves $50-100/month.

---

## Update path

If you later decide premium voice quality is worth paying for (especially
for Indonesian), switching to cloud TTS is a one-file change in
`src/routes/agent.js` — replace the `runPiper()` call with an axios POST
to the cloud provider. The rest of the frontend, caching, and fallback
logic stays the same.
