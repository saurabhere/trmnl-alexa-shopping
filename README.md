# Bring! Shopping List → TRMNL

Show your [Bring!](https://www.getbring.com/) shopping list on a [TRMNL](https://usetrmnl.com/) e-ink display. Add items from the Bring! app, Alexa, Google Home, or a shared family list — they all show up on your screen.

![icon](icon-color-256.png)

## How it works

```
Bring! app / Alexa / Google Home / shared list
     │
     ▼
 Bring! account ──► TRMNL plugin (Cloudflare Worker) ──► your e-ink display
```

When your TRMNL device refreshes, the plugin fetches your current Bring! list and renders it. No polling delays, no cron jobs — the data is always **live**.

## Install (TRMNL marketplace)

If this plugin is published on the TRMNL marketplace, install it with one click from your TRMNL dashboard. You'll be asked for your Bring! email and password, and optionally which list to display.

## Self-host: fork & deploy (5 minutes)

If you'd rather run your own instance — or the plugin isn't on the marketplace yet — you have two options:

### Option A — Cloudflare Worker (recommended, live data)

The `worker/` directory contains a complete TRMNL third-party plugin that runs on Cloudflare Workers' free tier. See [`worker/README.md`](worker/README.md) for deployment instructions.

### Option B — GitHub Actions (zero infra, ~5 min cadence)

A simpler setup that polls Bring! every 5 minutes and pushes to a TRMNL Private Plugin via webhook.

1. **[Fork](../../fork)** this repo.
2. Add GitHub Actions secrets: `BRING_EMAIL`, `BRING_PASSWORD`, `TRMNL_PLUGIN_UUID`.
3. Create a TRMNL [Private Plugin](https://trmnl.com/plugin_settings/new?keyname=private_plugin) (Webhook strategy) and paste the templates from the `template*.liquid` files.
4. The workflow runs every 5 minutes automatically on the free tier.

See the [GitHub Actions workflow](.github/workflows/sync.yml) for details.

## Layouts

All four TRMNL layout sizes are supported. The templates use the TRMNL Overflow engine to auto-fill space with columns and show "and X more" when items overflow.

| Layout | Best for |
|--------|----------|
| **Full** | Dedicated screen — up to 2 columns, shows item notes |
| **Half Horizontal** | Side-by-side mashup — up to 2 columns, names only |
| **Half Vertical** | Stacked mashup — single column, shows notes |
| **Quadrant** | 4-plugin mashup — up to 2 columns, names only |

Text size adapts to item count — fewer items get larger text to fill the space.

## Files

| Path | Purpose |
|------|---------|
| `worker/` | Cloudflare Worker — full TRMNL marketplace plugin |
| `worker/src/index.js` | Router: OAuth install, markup generation, management |
| `worker/src/bring.js` | Bring! API client (login, lists, items) |
| `worker/src/crypto.js` | AES-256-GCM encryption for stored credentials |
| `worker/src/markup.js` | Generates HTML for all 4 layouts |
| `worker/src/pages.js` | Install / management / list-picker UI |
| `worker/src/help.js` | Knowledge base page |
| `bring_client.py` | Python Bring! client (for GitHub Actions path) |
| `sync.py` | Python sync script: fetch → diff → push |
| `template*.liquid` | TRMNL Liquid templates (for Private Plugin path) |

## Security

- Bring! credentials are encrypted with **AES-256-GCM** before storage.
- Credentials are only ever sent to Bring!'s own API (`api.getbring.com`).
- On uninstall, credentials are **immediately deleted**.
- The Bring! API key in the code is a public key shipped with the Bring! app — not a secret.

> **Why do we need your password?** Bring! does not offer OAuth or any "Sign in with Bring!" flow. Direct email/password login is the only way — it's the same approach [Home Assistant](https://www.home-assistant.io/integrations/bring/) and other integrations use.

## FAQ

**Can I use this without Alexa?**
Yes — the plugin reads your Bring! list regardless of how items get there. Bring! app, Alexa, Google Home, shared family list — it all shows up.

**How fast do changes appear?**
With the Cloudflare Worker: your list is fetched live on every device refresh (typically 5–15 min). With GitHub Actions: up to 5 min polling delay + device refresh.

**Can I show a specific list?**
Yes. If you have multiple Bring! lists, the install flow lets you pick which one.

**I signed up with Google/Apple — can I use this?**
The API needs an email + password. Go to Bring! app → Profile → add a password to your account, then use that.

## Notes

- The Bring! API is **unofficial** but widely relied on (Home Assistant, this plugin, and others). The client handles multiple known response shapes.
- TRMNL devices are battery-powered e-ink and poll on their own schedule — there is no push-to-device.

## License

MIT
