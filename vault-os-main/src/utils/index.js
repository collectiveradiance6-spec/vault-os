export function copy(text) {
  return navigator.clipboard.writeText(text);
}

export function uuid() {
  return crypto.randomUUID();
}
