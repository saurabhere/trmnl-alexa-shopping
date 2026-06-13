// Bring! shopping list API client for Cloudflare Workers.
//
// Uses the android-client API key (same as Home Assistant's python-bring-api)
// which unlocks the lists enumeration endpoint. The webApp key does not.

const BASE = "https://api.getbring.com/rest/v2";
const API_KEY = "cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp";
const ICON_BASE = "https://web.getbring.com/assets/images/items";
const LOCALE_URL = "https://web.getbring.com/locale/articles.en-US.json";

// Cache the translation map for the lifetime of the Worker instance (~minutes).
let _translationCache = null;

async function getTranslations() {
  if (_translationCache) return _translationCache;
  try {
    const res = await fetch(LOCALE_URL);
    if (res.ok) {
      _translationCache = await res.json();
    }
  } catch {
    // Non-fatal — we'll just show the raw itemId (often German)
  }
  return _translationCache || {};
}

function baseHeaders() {
  return {
    "X-BRING-API-KEY": API_KEY,
    "X-BRING-CLIENT": "android",
    "X-BRING-APPLICATION": "bring",
    "X-BRING-COUNTRY": "US",
  };
}

export async function bringLogin(email, password) {
  const res = await fetch(`${BASE}/bringauth`, {
    method: "POST",
    headers: {
      ...baseHeaders(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bring login failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

function authHeaders(accessToken, userUuid, publicUuid) {
  return {
    ...baseHeaders(),
    Authorization: `Bearer ${accessToken}`,
    "X-BRING-USER-UUID": userUuid,
    "X-BRING-PUBLIC-USER-UUID": publicUuid || "",
  };
}

export async function bringLists(accessToken, userUuid, publicUuid) {
  const res = await fetch(`${BASE}/bringusers/${userUuid}/lists`, {
    headers: authHeaders(accessToken, userUuid, publicUuid),
  });
  if (!res.ok) throw new Error(`Bring lists failed (${res.status})`);
  const data = await res.json();
  return (data.lists || []).map((l) => ({
    uuid: l.listUuid,
    name: l.name || "Shopping List",
    theme: l.theme || "",
  }));
}

// Convert German umlauts to their ASCII equivalents for icon URLs.
function normalizeForIcon(name) {
  return name
    .replace(/ä/g, "ae").replace(/Ä/g, "Ae")
    .replace(/ö/g, "oe").replace(/Ö/g, "Oe")
    .replace(/ü/g, "ue").replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

// Build the icon URL for an item. Returns the URL (may 404 for custom items —
// the markup should use it as an <img> src and handle missing images gracefully).
export function iconUrl(iconKey) {
  if (!iconKey) return "";
  return `${ICON_BASE}/${normalizeForIcon(iconKey)}.png`;
}

export async function bringItemDetails(accessToken, userUuid, publicUuid, listUuid) {
  const res = await fetch(`${BASE}/bringlists/${listUuid}/details`, {
    headers: authHeaders(accessToken, userUuid, publicUuid),
  });
  if (!res.ok) return []; // non-fatal — we just won't have icon overrides
  const data = await res.json();
  // Response is an array of { uuid, itemId, userIconItemId, imageUrl, ... }
  return Array.isArray(data) ? data : data.items || [];
}

export async function bringItems(accessToken, userUuid, publicUuid, listUuid) {
  // Fetch items, details, and translations in parallel
  const [itemsRes, details, translations] = await Promise.all([
    fetch(`${BASE}/bringlists/${listUuid}`, {
      headers: authHeaders(accessToken, userUuid, publicUuid),
    }),
    bringItemDetails(accessToken, userUuid, publicUuid, listUuid),
    getTranslations(),
  ]);

  if (!itemsRes.ok) throw new Error(`Bring items failed (${itemsRes.status})`);
  const data = await itemsRes.json();

  // Build a lookup: itemId -> detail (for icon overrides)
  const detailMap = {};
  for (const d of details) {
    if (d.itemId) detailMap[d.itemId] = d;
  }

  const purchase = data.purchase ?? data.items?.purchase ?? [];
  const recently = data.recently ?? data.items?.recently ?? [];

  function mapItems(arr) {
    return arr
      .filter((i) => i.name || i.itemId)
      .map((i) => {
        const rawName = ((i.name || i.itemId) ?? "").trim();
        // Translate German catalog name to user's locale (falls through for custom items)
        const displayName = translations[rawName] || rawName;
        const detail = detailMap[rawName] || detailMap[i.itemId] || {};
        const iconKey = detail.userIconItemId || rawName;
        const customImageUrl = detail.imageUrl || "";
        return {
          name: displayName,
          specification: (i.specification || "").trim(),
          iconUrl: customImageUrl || iconUrl(iconKey),
          category: (detail.userSectionId || "").trim(),
        };
      });
  }

  return { purchase: mapItems(purchase), recently: mapItems(recently) };
}

export async function fetchShoppingList(email, password, listUuid) {
  const auth = await bringLogin(email, password);
  const uuid = listUuid || auth.bringListUUID;
  if (!uuid) throw new Error("No Bring list found");
  const result = await bringItems(auth.access_token, auth.uuid, auth.publicUuid, uuid);
  return result;
}

export async function fetchListsForUser(email, password) {
  const auth = await bringLogin(email, password);
  const lists = await bringLists(auth.access_token, auth.uuid, auth.publicUuid);
  return { lists, defaultUuid: auth.bringListUUID };
}
