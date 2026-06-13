# TRMNL Marketplace Plugin — Cloudflare Worker

This is the server-side component that makes the Alexa Shopping List plugin
available to **all TRMNL users** via the TRMNL marketplace. It runs on
Cloudflare Workers (free tier) with zero ongoing cost.

## Architecture

```
User clicks "Install" on TRMNL marketplace
    │
    ▼
TRMNL redirects to Worker /install?code=xxx
    │
    ▼
Worker shows form → user enters Bring! email + password
    │
    ▼
Worker validates creds with Bring! API,
exchanges TRMNL code for access_token,
encrypts + stores creds in KV
    │
    ▼
Every refresh, TRMNL POSTs to /markup with Bearer token
    │
    ▼
Worker decrypts that user's Bring! creds,
fetches their shopping list,
returns HTML markup for all 4 layouts
    │
    ▼
TRMNL renders → device displays
```

## Deploy (one-time, ~5 minutes)

### Prerequisites
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- [Node.js](https://nodejs.org/) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `npm install -g wrangler`

### Steps

```bash
cd worker
npm install

# Login to Cloudflare
wrangler login

# Create the KV namespace for user data
wrangler kv namespace create USERS
# Copy the output id into wrangler.toml → [[kv_namespaces]] → id = "..."

# Generate an encryption key (32 bytes = 64 hex chars)
openssl rand -hex 32
# Set it as a secret (never in code):
wrangler secret put ENCRYPTION_KEY
# Paste the hex string when prompted

# Deploy
wrangler deploy
```

Your worker is now live at `https://trmnl-alexa-shopping.<your-subdomain>.workers.dev`.

### Optional: custom domain
If you have a domain, add a Custom Domain in the Cloudflare dashboard:
Workers & Pages → your worker → Settings → Domains & Routes → Add Custom Domain.

## Register with TRMNL

1. Go to [trmnl.com/plugins/my/new](https://trmnl.com/plugins/my/new)
2. Fill in:
   - **Name:** Alexa Shopping List
   - **Description:** Show your Alexa shopping list on your TRMNL display. Uses Bring! as a bridge.
   - **Icon:** Upload `icon-color-512.png` from the repo root
   - **Installation URL:** `https://<your-worker>/install`
   - **Installation Success Webhook URL:** `https://<your-worker>/install/success`
   - **Plugin Management URL:** `https://<your-worker>/manage`
   - **Plugin Markup URL:** `https://<your-worker>/markup`
   - **Uninstallation Webhook URL:** `https://<your-worker>/uninstall`
3. Save → note the Plugin ID from the URL

## Submit to marketplace

Email `team@trmnl.com` with subject: **"Public plugin submission - Alexa Shopping List"**

Include:
1. **Plugin ID** — from step 3 above
2. **Owner email** — your email
3. **Justification** — "Alexa has 100M+ users. Many use shopping lists by voice. This plugin bridges Alexa → Bring! → TRMNL so users see their shopping list at a glance on their e-ink display. No other TRMNL plugin does this."
4. **Demo video** — screen recording showing: install from scratch, add item via Alexa, see it appear on TRMNL
5. **Test credentials** — a Bring! test account they can keep
6. **Promotion** — "Will share on Reddit r/trmnl, Bring! community, and Alexa smart home forums"

## Security

- Bring! credentials are encrypted with AES-256-GCM before storage in KV
- Encryption key is a Cloudflare secret (never in code or logs)
- Each user's data is keyed by their unique TRMNL access_token
- On uninstall, credentials are immediately deleted from KV
- No credentials are ever logged or transmitted except to Bring!'s API

## Costs

| Resource | Free tier | Plugin usage (per user) |
|----------|-----------|------------------------|
| Worker requests | 100,000/day | ~300/day (1 per 5-min refresh) |
| KV reads | 100,000/day | ~300/day |
| KV writes | 1,000/day | ~1 (install/uninstall only) |

Free tier supports **300+ concurrent users** with zero cost.
