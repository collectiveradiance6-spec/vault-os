// NOTE: btoa is base64, NOT encryption. Replace with Web Crypto AES-GCM for production.

export function encrypt(data) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  } catch {
    return null;
  }
}

export function decrypt(data) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(data))));
  } catch {
    return null;
  }
}

// Production-ready AES-GCM — call this when backend is live
export async function encryptSecure(plaintext, key) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(plaintext))
  );
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
}
