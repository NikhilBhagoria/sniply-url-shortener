const normalizeUrl = (value) => {
  if (!value || typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : /^www\./i.test(trimmed)
        ? `https://${trimmed}`
        : `http://${trimmed}`;
    const parsed = new URL(normalized);
    return parsed.toString();
  } catch {
    return '';
  }
};

const isValidHttpUrl = (value) => {
  if (!value || typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `http://${trimmed}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

module.exports = { normalizeUrl, isValidHttpUrl };
