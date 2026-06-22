// HTML pages for install and management flows.

import { fetchListsForUser } from "./bring.js";

export function installPage(code, callbackUrl, error = "") {
  const errorHtml = error
    ? `<div style="background:#fee;border:1px solid #c00;padding:12px;border-radius:8px;margin-bottom:16px;color:#900;">${escapeHtml(error)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Connect Bring! Shopping List</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 20px; font-size: 14px; line-height: 1.5; }
    label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 16px; }
    input:focus { outline: none; border-color: #ff4d3d; box-shadow: 0 0 0 3px rgba(255,77,61,.15); }
    button { width: 100%; padding: 12px; background: #ff4d3d; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
    button:hover { opacity: .9; }
    .trust { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
    .trust-header { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
    .trust-header span.lock { font-size: 18px; }
    .trust-header span.label { font-weight: 600; font-size: 14px; color: #333; }
    .trust-header span.toggle { margin-left: auto; font-size: 12px; color: #999; }
    .trust-body { display: none; margin-top: 12px; font-size: 13px; color: #555; line-height: 1.6; }
    .trust-body.open { display: block; }
    .trust-item { display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start; }
    .trust-item .icon { flex-shrink: 0; font-size: 14px; margin-top: 1px; }
    .trust-item .text { flex: 1; }
    .why { background: #fff8f0; border: 1px solid #ffe0c0; border-radius: 8px; padding: 12px 14px; margin-bottom: 20px; font-size: 13px; color: #885500; line-height: 1.5; }
    .why strong { color: #664400; }
    .help { font-size: 12px; color: #999; margin-top: 16px; line-height: 1.5; }
    .help a { color: #ff4d3d; }
    .logo { font-size: 32px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🛒</div>
    <h1>Connect Bring!</h1>
    <p class="subtitle">Link your Bring! account so your shopping list shows on your TRMNL display. Works with Alexa, Google Home, or just the Bring! app.</p>

    <div class="why">
      <strong>Why do we need your password?</strong> Bring! doesn't offer "Sign in with Bring!" for third-party apps (no OAuth). This is the same way <a href="https://www.home-assistant.io/integrations/bring/" target="_blank" style="color:#885500">Home Assistant</a> and other integrations connect — it's the only way.
    </div>

    <div class="trust">
      <div class="trust-header" onclick="document.getElementById('trust-details').classList.toggle('open'); this.querySelector('.toggle').textContent = document.getElementById('trust-details').classList.contains('open') ? '▲ Hide' : '▼ Details'">
        <span class="lock">🔒</span>
        <span class="label">How we protect your credentials</span>
        <span class="toggle">▼ Details</span>
      </div>
      <div class="trust-body" id="trust-details">
        <div class="trust-item">
          <span class="icon">🔐</span>
          <span class="text"><strong>Encrypted at rest</strong> — your password is encrypted with AES-256-GCM before storage. We never store it in plaintext.</span>
        </div>
        <div class="trust-item">
          <span class="icon">🚫</span>
          <span class="text"><strong>Never logged or displayed</strong> — your credentials are only ever sent to Bring!'s own servers (<code>api.getbring.com</code>) to fetch your list. Nowhere else.</span>
        </div>
        <div class="trust-item">
          <span class="icon">🗑️</span>
          <span class="text"><strong>Deleted on uninstall</strong> — the moment you remove this plugin, your encrypted credentials are permanently deleted.</span>
        </div>
        <div class="trust-item">
          <span class="icon">📖</span>
          <span class="text"><strong>Open source</strong> — the entire codebase is public. <a href="https://github.com/saurabhere/trmnl-alexa-shopping" target="_blank" style="color:#ff4d3d">Audit it yourself</a> on GitHub.</span>
        </div>
        <div class="trust-item">
          <span class="icon">💡</span>
          <span class="text"><strong>Tip:</strong> If you'd rather not use your main password, create a separate Bring! account, add items to a shared list, and use that account here instead.</span>
        </div>
      </div>
    </div>

    ${errorHtml}
    <form method="POST" action="/install">
      <input type="hidden" name="code" value="${escapeAttr(code)}">
      <input type="hidden" name="callback_url" value="${escapeAttr(callbackUrl)}">
      <label for="email">Bring! Email</label>
      <input type="email" id="email" name="email" required placeholder="you@example.com">
      <label for="password">Bring! Password</label>
      <input type="password" id="password" name="password" required>
      <label for="locale">Item Language</label>
      <select id="locale" name="locale" style="margin-bottom:16px; padding:10px 12px; border:1px solid #ddd; border-radius:8px; font-size:16px; width:100%; appearance:auto;">
        <option value="en-US" selected>English</option>
        <option value="de-DE">Deutsch</option>
        <option value="de-CH">Deutsch (Schweiz)</option>
        <option value="de-AT">Deutsch (Österreich)</option>
        <option value="es-ES">Español</option>
        <option value="fr-FR">Français</option>
        <option value="fr-CH">Français (Suisse)</option>
        <option value="hu-HU">Magyar</option>
        <option value="it-IT">Italiano</option>
        <option value="it-CH">Italiano (Svizzera)</option>
        <option value="nb-NO">Norsk</option>
        <option value="nl-NL">Nederlands</option>
        <option value="pl-PL">Polski</option>
        <option value="pt-BR">Português</option>
        <option value="ru-RU">Русский</option>
        <option value="sv-SE">Svenska</option>
        <option value="tr-TR">Türkçe</option>
      </select>
      <button type="submit">Connect to Bring!</button>
    </form>
    <p class="help">
      Don't have Bring!? <a href="https://www.getbring.com/" target="_blank">Create a free account</a>.
      <br>Signed up with Google/Apple? Go to Bring! app → Profile → add a password first.
    </p>
  </div>
</body>
</html>`;
}

export function listPickerPage(code, callbackUrl, email, password, lists, defaultUuid, locale) {
  const options = lists
    .map((l) => {
      const selected = l.uuid === defaultUuid ? " selected" : "";
      return `<option value="${escapeAttr(l.uuid)}"${selected}>${escapeHtml(l.name)}</option>`;
    })
    .join("\\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Choose Your List — Bring!</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
    label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
    select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 16px; appearance: auto; }
    select:focus { outline: none; border-color: #ff4d3d; box-shadow: 0 0 0 3px rgba(255,77,61,.15); }
    button { width: 100%; padding: 12px; background: #ff4d3d; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
    button:hover { opacity: .9; }
    .check { color: #090; margin-bottom: 16px; font-size: 14px; }
    .logo { font-size: 32px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">✅</div>
    <h1>Choose a list</h1>
    <p class="check">Logged in as <strong>${escapeHtml(email)}</strong></p>
    <p class="subtitle">Which Bring! list should appear on your TRMNL?</p>
    <form method="POST" action="/install/pick-list">
      <input type="hidden" name="code" value="${escapeAttr(code)}">
      <input type="hidden" name="callback_url" value="${escapeAttr(callbackUrl)}">
      <input type="hidden" name="email" value="${escapeAttr(email)}">
      <input type="hidden" name="password" value="${escapeAttr(password)}">
      <input type="hidden" name="locale" value="${escapeAttr(locale || "en-US")}">
      <label for="list_uuid">List</label>
      <select id="list_uuid" name="list_uuid">
        ${options}
      </select>
      <button type="submit">Use this list</button>
    </form>
  </div>
</body>
</html>`;
}

const MANAGE_STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 20px; font-size: 14px; line-height: 1.5; }
    label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; }
    input, select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 16px; appearance: auto; }
    input:focus, select:focus { outline: none; border-color: #ff4d3d; box-shadow: 0 0 0 3px rgba(255,77,61,.15); }
    button { width: 100%; padding: 12px; background: #ff4d3d; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
    button:hover { opacity: .9; }
    .current { background: #f0f8f0; border: 1px solid #cde6cd; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #336633; }
    .current strong { color: #224422; }
`;

const LOCALE_OPTIONS = [
  ["en-US", "English"], ["de-DE", "Deutsch"], ["de-CH", "Deutsch (Schweiz)"],
  ["de-AT", "Deutsch (Österreich)"], ["es-ES", "Español"], ["fr-FR", "Français"],
  ["fr-CH", "Français (Suisse)"], ["hu-HU", "Magyar"], ["it-IT", "Italiano"],
  ["it-CH", "Italiano (Svizzera)"], ["nb-NO", "Norsk"], ["nl-NL", "Nederlands"],
  ["pl-PL", "Polski"], ["pt-BR", "Português"], ["ru-RU", "Русский"],
  ["sv-SE", "Svenska"], ["tr-TR", "Türkçe"],
];

function localeSelect(name, selected) {
  const opts = LOCALE_OPTIONS.map(([val, label]) =>
    `<option value="${val}"${val === selected ? " selected" : ""}>${label}</option>`
  ).join("");
  return `<select id="${name}" name="${name}">${opts}</select>`;
}

// Step 1: Login to access settings
export function manageLoginPage(error = "", uuid = "") {
  const errorHtml = error
    ? `<div style="background:#fee;border:1px solid #c00;padding:12px;border-radius:8px;margin-bottom:16px;color:#900;">${escapeHtml(error)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manage Bring! Plugin</title>
  <style>${MANAGE_STYLES}</style>
</head>
<body>
  <div class="card">
    <h1>🛒 Manage Plugin</h1>
    <p class="subtitle">Sign in with your Bring! account to change your settings.</p>
    ${errorHtml}
    <form method="POST" action="/manage/login">
      <input type="hidden" name="uuid" value="${escapeAttr(uuid)}">
      <label for="email">Bring! Email</label>
      <input type="email" id="email" name="email" required placeholder="you@example.com">
      <label for="password">Bring! Password</label>
      <input type="password" id="password" name="password" required>
      <button type="submit">Sign In</button>
    </form>
  </div>
</body>
</html>`;
}

// Step 2: Settings page (after login) — list picker, language, password update
export function manageSettingsPage(email, password, lists, currentListUuid, currentLocale, error = "", success = "", uuid = "") {
  const errorHtml = error
    ? `<div style="background:#fee;border:1px solid #c00;padding:12px;border-radius:8px;margin-bottom:16px;color:#900;">${escapeHtml(error)}</div>`
    : "";
  const successHtml = success
    ? `<div style="background:#efe;border:1px solid #090;padding:12px;border-radius:8px;margin-bottom:16px;color:#060;">${escapeHtml(success)}</div>`
    : "";

  const listOptions = lists.map((l) => {
    const selected = l.uuid === currentListUuid ? " selected" : "";
    return `<option value="${escapeAttr(l.uuid)}"${selected}>${escapeHtml(l.name)}</option>`;
  }).join("");

  const currentList = lists.find((l) => l.uuid === currentListUuid);
  const currentListName = currentList ? currentList.name : "Default";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Settings — Bring! Plugin</title>
  <style>${MANAGE_STYLES}</style>
</head>
<body>
  <div class="card">
    <h1>🛒 Plugin Settings</h1>
    <p class="subtitle">Signed in as <strong>${escapeHtml(email)}</strong></p>
    <div class="current">
      Currently showing: <strong>${escapeHtml(currentListName)}</strong>
    </div>
    ${errorHtml}${successHtml}
    <form method="POST" action="/manage/save">
      <input type="hidden" name="email" value="${escapeAttr(email)}">
      <input type="hidden" name="password" value="${escapeAttr(password)}">
      <input type="hidden" name="uuid" value="${escapeAttr(uuid)}">
      <label for="list_uuid">Shopping List</label>
      <select id="list_uuid" name="list_uuid">${listOptions}</select>
      <label for="locale">Item Language</label>
      ${localeSelect("locale", currentLocale || "en-US")}
      <button type="submit">Save Settings</button>
    </form>
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
