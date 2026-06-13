// TRMNL Marketplace Plugin — Cloudflare Worker entry point.
// Plugin: Bring! Shopping List for TRMNL

import { fetchShoppingList, bringLogin, fetchListsForUser } from "./bring.js";
import { encrypt, decrypt } from "./crypto.js";
import { generateMarkup } from "./markup.js";
import { installPage, listPickerPage, manageLoginPage, manageSettingsPage } from "./pages.js";
import { helpPage } from "./help.js";

const TRMNL_TOKEN_URL = "https://trmnl.com/oauth/token";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html;charset=utf-8" },
  });
}

function utcNow() {
  const d = new Date();
  const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = d.getUTCDate().toString().padStart(2, "0");
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  return `${mon} ${day}, ${hh}:${mm} UTC`;
}

// ---------------------------------------------------------------------------
// GET /install — show credential form
// ---------------------------------------------------------------------------

async function handleInstallGet(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const callbackUrl = url.searchParams.get("installation_callback_url") || "";
  if (!code || !callbackUrl) {
    return html("<h1>Missing installation parameters.</h1><p>Please install this plugin from your TRMNL dashboard.</p>", 400);
  }
  return html(installPage(code, callbackUrl));
}

// ---------------------------------------------------------------------------
// POST /install — validate creds, show list picker (or skip if only one list)
// ---------------------------------------------------------------------------

async function handleInstallPost(request, env) {
  const form = await request.formData();
  const code = form.get("code") || "";
  const callbackUrl = form.get("callback_url") || "";
  const email = (form.get("email") || "").trim();
  const password = form.get("password") || "";
  const locale = form.get("locale") || "en-US";

  if (!code || !callbackUrl) return html(installPage(code, callbackUrl, "Missing installation parameters."), 400);
  if (!email || !password) return html(installPage(code, callbackUrl, "Email and password are required."), 400);

  // Validate Bring! creds and fetch lists
  let lists, defaultUuid;
  try {
    const result = await fetchListsForUser(email, password);
    lists = result.lists;
    defaultUuid = result.defaultUuid;
  } catch (e) {
    return html(installPage(code, callbackUrl, `Bring! login failed: ${e.message}. Check your credentials.`), 400);
  }

  // If only one list, skip the picker
  if (lists.length <= 1) {
    return finishInstall(code, callbackUrl, email, password, defaultUuid, lists[0]?.name || "Shopping List", locale, env);
  }

  // Multiple lists → show picker
  return html(listPickerPage(code, callbackUrl, email, password, lists, defaultUuid, locale));
}

// ---------------------------------------------------------------------------
// POST /install/pick-list — user chose a list from the picker
// ---------------------------------------------------------------------------

async function handlePickList(request, env) {
  const form = await request.formData();
  const code = form.get("code") || "";
  const callbackUrl = form.get("callback_url") || "";
  const email = (form.get("email") || "").trim();
  const password = form.get("password") || "";
  const listUuid = form.get("list_uuid") || "";
  const locale = form.get("locale") || "en-US";

  if (!code || !callbackUrl || !email || !password || !listUuid) {
    return html(installPage(code, callbackUrl, "Missing parameters. Please try again."), 400);
  }

  // Resolve list name
  let listName = "Shopping List";
  try {
    const { lists } = await fetchListsForUser(email, password);
    const picked = lists.find((l) => l.uuid === listUuid);
    if (picked) listName = picked.name;
  } catch {
    // Non-fatal — we'll use the default name
  }

  return finishInstall(code, callbackUrl, email, password, listUuid, listName, locale, env);
}

// ---------------------------------------------------------------------------
// Shared: exchange TRMNL code, encrypt creds, store in KV, redirect
// ---------------------------------------------------------------------------

async function finishInstall(code, callbackUrl, email, password, listUuid, listName, locale, env) {
  // Exchange TRMNL code for access_token
  const tokenRes = await fetch(TRMNL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    return html(installPage(code, callbackUrl, `TRMNL authorization failed: ${tokenData.message || "unknown error"}`), 400);
  }
  const accessToken = tokenData.access_token;

  // Encrypt and store
  const creds = JSON.stringify({ email, password, listUuid, listName, locale });
  const encrypted = await encrypt(creds, env.ENCRYPTION_KEY);
  await env.USERS.put(`token:${accessToken}`, encrypted);
  // Reverse lookup so the management page can find the user by email
  await env.USERS.put(`email:${email.toLowerCase()}`, accessToken);

  return Response.redirect(callbackUrl, 302);
}

// ---------------------------------------------------------------------------
// POST /install/success — TRMNL success webhook
// ---------------------------------------------------------------------------

async function handleInstallSuccess(request, env) {
  const bearer = (request.headers.get("Authorization") || "").replace("Bearer ", "");
  if (!bearer) return json({ error: "missing token" }, 401);

  const body = await request.json().catch(() => ({}));
  if (body.uuid) {
    await env.USERS.put(`uuid:${body.uuid}`, bearer);
  }
  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// POST /markup — TRMNL requests screen content
// ---------------------------------------------------------------------------

async function handleMarkup(request, env) {
  const bearer = (request.headers.get("Authorization") || "").replace("Bearer ", "");
  if (!bearer) return json({ error: "unauthorized" }, 401);

  const encrypted = await env.USERS.get(`token:${bearer}`);
  if (!encrypted) return json({ error: "not installed" }, 404);

  let creds;
  try {
    const decrypted = await decrypt(encrypted, env.ENCRYPTION_KEY);
    creds = JSON.parse(decrypted);
  } catch {
    return json({ error: "credential decryption failed" }, 500);
  }

  let result;
  try {
    result = await fetchShoppingList(creds.email, creds.password, creds.listUuid, creds.locale);
  } catch (e) {
    const msg = e.message.includes("401")
      ? "Bring! login failed — update your credentials."
      : "Temporary error — will retry.";
    const errorMarkup = `<div class="layout layout--center"><div class="flex flex--col gap--small"><span class="title">${msg}</span></div></div><div class="title_bar"><span class="title">Shopping List</span><span class="instance">Error</span></div>`;
    return json({
      markup: errorMarkup,
      markup_half_horizontal: errorMarkup,
      markup_half_vertical: errorMarkup,
      markup_quadrant: errorMarkup,
    });
  }

  const markup = generateMarkup(result.purchase, result.recently, utcNow(), creds.listName);
  return json(markup);
}

// ---------------------------------------------------------------------------
// GET /manage — show login page (step 1)
// ---------------------------------------------------------------------------

async function handleManageGet(request) {
  return html(manageLoginPage());
}

// ---------------------------------------------------------------------------
// POST /manage/login — validate creds, show settings page (step 2)
// ---------------------------------------------------------------------------

async function handleManageLogin(request, env) {
  const form = await request.formData();
  const email = (form.get("email") || "").trim();
  const password = form.get("password") || "";

  if (!email || !password) return html(manageLoginPage("Email and password are required."), 400);

  // Validate creds and fetch lists
  let lists, defaultUuid;
  try {
    const result = await fetchListsForUser(email, password);
    lists = result.lists;
    defaultUuid = result.defaultUuid;
  } catch (e) {
    return html(manageLoginPage(`Bring! login failed: ${e.message}`), 400);
  }

  // Look up their current settings from KV
  const accessToken = await env.USERS.get(`email:${email.toLowerCase()}`);
  let currentListUuid = defaultUuid;
  let currentLocale = "en-US";
  if (accessToken) {
    try {
      const encrypted = await env.USERS.get(`token:${accessToken}`);
      if (encrypted) {
        const creds = JSON.parse(await decrypt(encrypted, env.ENCRYPTION_KEY));
        currentListUuid = creds.listUuid || defaultUuid;
        currentLocale = creds.locale || "en-US";
      }
    } catch {
      // Non-fatal — use defaults
    }
  }

  return html(manageSettingsPage(email, password, lists, currentListUuid, currentLocale));
}

// ---------------------------------------------------------------------------
// POST /manage/save — save updated settings to KV
// ---------------------------------------------------------------------------

async function handleManageSave(request, env) {
  const form = await request.formData();
  const email = (form.get("email") || "").trim();
  const password = form.get("password") || "";
  const listUuid = form.get("list_uuid") || "";
  const locale = form.get("locale") || "en-US";

  if (!email || !password) return html(manageLoginPage("Session expired. Please sign in again."), 400);

  // Re-validate creds
  let lists;
  try {
    const result = await fetchListsForUser(email, password);
    lists = result.lists;
  } catch (e) {
    return html(manageLoginPage(`Bring! login failed: ${e.message}`), 400);
  }

  // Resolve list name
  const picked = lists.find((l) => l.uuid === listUuid);
  const listName = picked ? picked.name : "Shopping List";

  // Find their access token from KV
  const accessToken = await env.USERS.get(`email:${email.toLowerCase()}`);
  if (!accessToken) {
    return html(manageLoginPage("No plugin installation found for this email. Please install the plugin first from your TRMNL dashboard."), 400);
  }

  // Update their stored credentials
  const creds = JSON.stringify({ email, password, listUuid, listName, locale });
  const encrypted = await encrypt(creds, env.ENCRYPTION_KEY);
  await env.USERS.put(`token:${accessToken}`, encrypted);

  // Show success — re-render settings page
  const currentListUuid = listUuid;
  return html(manageSettingsPage(email, password, lists, currentListUuid, locale, "", `Settings saved! Your TRMNL will show "${listName}" in ${locale.split("-")[0].toUpperCase()} on the next refresh.`));
}

// ---------------------------------------------------------------------------
// POST /uninstall
// ---------------------------------------------------------------------------

async function handleUninstall(request, env) {
  const bearer = (request.headers.get("Authorization") || "").replace("Bearer ", "");
  if (bearer) await env.USERS.delete(`token:${bearer}`);
  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      if (path === "/install" && method === "GET") return handleInstallGet(request);
      if (path === "/install" && method === "POST") return handleInstallPost(request, env);
      if (path === "/install/pick-list" && method === "POST") return handlePickList(request, env);
      if (path === "/install/success" && method === "POST") return handleInstallSuccess(request, env);
      if (path === "/markup" && method === "POST") return handleMarkup(request, env);
      if (path === "/manage" && method === "GET") return handleManageGet(request);
      if (path === "/manage/login" && method === "POST") return handleManageLogin(request, env);
      if (path === "/manage/save" && method === "POST") return handleManageSave(request, env);
      if (path === "/uninstall" && method === "POST") return handleUninstall(request, env);

      // Knowledge base / help page
      if (path === "/help" || path === "/kb") return html(helpPage());

      if (path === "/" || path === "/health") {
        return json({ status: "ok", plugin: "Bring! Shopping List for TRMNL" });
      }

      return json({ error: "not found" }, 404);
    } catch (e) {
      console.error("Unhandled error:", e);
      return json({ error: "internal error" }, 500);
    }
  },
};
