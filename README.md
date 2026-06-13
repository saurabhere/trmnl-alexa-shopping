# Bring! Shopping List for TRMNL

Say it to Alexa, Google, or Siri. See it on your [TRMNL](https://usetrmnl.com/) e-ink display.

![icon](icon-color-256.png)

## Screenshots

| With items | Empty list |
|:----------:|:----------:|
| ![Full layout with items](screenshots/full-with-items.png) | ![Empty state](screenshots/empty-state.png) |

## How it works

Your [Bring!](https://www.getbring.com/) shopping list → Cloudflare Worker → TRMNL device. Data is fetched **live** on every device refresh — no polling delays.

Add items from the Bring! app, Alexa, Google Home, Siri, or a shared family list. They all show up.

**User guide & voice assistant setup:** [Help page](https://trmnl-alexa-shopping.saurabhere.workers.dev/help)

## Features

- Bring! item icons (bold black for e-ink) with generic fallback
- Multi-list support — pick which list, switch anytime from settings
- 17 languages — item names translated from Bring!'s catalog
- Adaptive text sizing — fewer items = bigger text
- Time-based greeting header ("Good morning! 4 items to grab")
- Shopping progress bar (purchased vs total)
- Assigned-to badges on shared lists
- Witty empty states (12 rotating italic phrases)
- Witty footer taglines
- Recently purchased strip
- All 4 TRMNL layouts (Full, Half H, Half V, Quadrant)

## Architecture

Runs on **Cloudflare Workers free tier** (100k req/day — supports 300+ users at zero cost).

```
worker/
├── src/
│   ├── index.js      # Router: OAuth install, markup, management
│   ├── bring.js      # Bring! API (login, lists, items, icons, translations)
│   ├── markup.js     # HTML generation for all 4 layouts
│   ├── pages.js      # Install / settings / list-picker UI
│   ├── help.js       # Knowledge base page
│   └── crypto.js     # AES-256-GCM credential encryption
├── wrangler.toml
└── package.json
```

User credentials encrypted with AES-256-GCM, stored in KV, deleted on uninstall. [Security details](https://trmnl-alexa-shopping.saurabhere.workers.dev/help#security).

## Deploy your own instance

```bash
cd worker && npm install
wrangler login
wrangler kv namespace create USERS    # paste ID into wrangler.toml
wrangler secret put ENCRYPTION_KEY    # paste output of: openssl rand -hex 32
wrangler deploy
```

Then register at [trmnl.com/plugins/my/new](https://trmnl.com/plugins/my/new) with your Worker URLs. See [`worker/README.md`](worker/README.md) for full deployment guide.

### Alternative: GitHub Actions (simpler, ~5 min cadence)

Fork → add secrets (`BRING_EMAIL`, `BRING_PASSWORD`, `TRMNL_PLUGIN_UUID`) → create a TRMNL Private Plugin (Webhook) → paste `template*.liquid` files. Runs every 5 min on the free tier.

## License

MIT
