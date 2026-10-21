module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500;
  let msg = err.message || 'Something went wrong';
  if (err.name === 'ValidationError') { status = 400; msg = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { status = 409; msg = 'That email or slug is already in use'; }
  if (err.name === 'CastError') { status = 400; msg = 'Invalid id format'; }
  if (err.name === 'VersionError') { status = 409; msg = 'This link changed. Reload it before saving again.'; }
  if (err.type === 'entity.parse.failed') { status = 400; msg = 'Malformed JSON body'; }
  if (status >= 500) {
    console.error(JSON.stringify({ event: 'request_failed', requestId: req.requestId, error: err.name }));
    msg = 'Something went wrong. Please try again later.';
  }
  res.status(status).json({ msg, requestId: req.requestId });
};
