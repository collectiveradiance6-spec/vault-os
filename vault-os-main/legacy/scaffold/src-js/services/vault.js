export function encrypt(data) {
  return btoa(JSON.stringify(data))
}

export function decrypt(data) {
  return JSON.parse(atob(data))
}
export function setEntries(data) {
  window.__VAULT_ENTRIES__ = data;
}
