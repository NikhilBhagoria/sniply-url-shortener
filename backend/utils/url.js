function normalizeUrl(value) {
  if (typeof value !== 'string') return '';
  const input = value.trim();
  if (!input || input.length > 2048 || /[\s\x00-\x1f\\]/.test(input)) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(input) && !/^https?:\/\//i.test(input)) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `http://${input}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return '';
    return url.href.length <= 2048 ? url.href : '';
  } catch { return ''; }
}
module.exports = { normalizeUrl, isValidHttpUrl: value => Boolean(normalizeUrl(value)) };
