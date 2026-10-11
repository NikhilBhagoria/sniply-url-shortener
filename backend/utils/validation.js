function badRequest(message) { return Object.assign(new Error(message), { status: 400 }); }
function string(value, name, { min = 0, max = 200, trim = true } = {}) {
  if (typeof value !== 'string') throw badRequest(`${name} must be text`);
  const result = trim ? value.trim() : value;
  if (result.length < min || result.length > max) throw badRequest(`${name} must be ${min}-${max} characters`);
  return result;
}
function email(value) {
  const result = string(value, 'Email', { min: 3, max: 254 }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(result)) throw badRequest('Please provide a valid email');
  return result;
}
function password(value) {
  const result = string(value, 'Password', { min: 8, max: 72, trim: false });
  if (Buffer.byteLength(result, 'utf8') > 72) throw badRequest('Password must be at most 72 UTF-8 bytes');
  return result;
}
module.exports = { badRequest, string, email, password };
