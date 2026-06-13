// AES-256-GCM encryption for storing Bring! credentials in KV.
// Uses the Web Crypto API (available in Cloudflare Workers).

const ALGO = "AES-GCM";

async function getKey(hexKey) {
  const raw = hexToBytes(hexKey);
  return crypto.subtle.importKey("raw", raw, ALGO, false, ["encrypt", "decrypt"]);
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encrypt(plaintext, hexKey) {
  const key = await getKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);
  // Store as iv:ciphertext (both hex-encoded)
  return bytesToHex(iv) + ":" + bytesToHex(ciphertext);
}

export async function decrypt(stored, hexKey) {
  const key = await getKey(hexKey);
  const [ivHex, ctHex] = stored.split(":");
  const iv = hexToBytes(ivHex);
  const ciphertext = hexToBytes(ctHex);
  const plaintext = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
