export function validateEntry(data) {
  const errors = {};
  if (!data.name?.trim())     errors.name     = 'Name is required';
  if (data.url && !/^https?:\/\//.test(data.url)) errors.url = 'URL must start with http:// or https://';
  if (data.password && data.password.length < 4)  errors.password = 'Password too short';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function sanitise(str) {
  return String(str ?? '').replace(/[<>&"']/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c]));
}
