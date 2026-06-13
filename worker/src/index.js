// TRMNL Marketplace Plugin — Cloudflare Worker entry point.
// Plugin: Bring! Shopping List for TRMNL

import { fetchShoppingList, bringLogin, fetchListsForUser } from "./bring.js";
import { encrypt, decrypt } from "./crypto.js";
import { generateMarkup } from "./markup.js";
import { installPage, listPickerPage, managePage } from "./pages.js";
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
    return finishInstall(code, callbackUrl, email, password, defaultUuid, lists[0]?.name || "Shopping List", env);
  }

  // Multiple lists → show picker
  return html(listPickerPage(code, callbackUrl, email, password, lists, defaultUuid));
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

  return finishInstall(code, callbackUrl, email, password, listUuid, listName, env);
}

// ---------------------------------------------------------------------------
// Shared: exchange TRMNL code, encrypt creds, store in KV, redirect
// ---------------------------------------------------------------------------

async function finishInstall(code, callbackUrl, email, password, listUuid, listName, env) {
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
  const creds = JSON.stringify({ email, password, listUuid, listName });
  const encrypted = await encrypt(creds, env.ENCRYPTION_KEY);
  await env.USERS.put(`token:${accessToken}`, encrypted);

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
    result = await fetchShoppingList(creds.email, creds.password, creds.listUuid);
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
// GET /manage
// ---------------------------------------------------------------------------

async function handleManageGet(request) {
  const url = new URL(request.url);
  const success = url.searchParams.get("success") || "";
  return html(managePage("your connected account", "", success ? "Credentials updated successfully!" : ""));
}

// ---------------------------------------------------------------------------
// POST /manage
// ---------------------------------------------------------------------------

async function handleManagePost(request, env) {
  const form = await request.formData();
  const email = (form.get("email") || "").trim();
  const password = form.get("password") || "";

  if (!email || !password) return html(managePage(email, "Email and password are required."), 400);

  try {
    await bringLogin(email, password);
  } catch (e) {
    return html(managePage(email, `Bring! login failed: ${e.message}`), 400);
  }

  return html(managePage(email, "", "Credentials verified! To complete the update, reinstall the plugin from your TRMNL dashboard."));
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
      if (path === "/manage" && method === "POST") return handleManagePost(request, env);
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
