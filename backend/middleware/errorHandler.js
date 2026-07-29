module.exports = function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let msg = err.message || 'Something went wrong';
  if (err.name === 'ValidationError') {
    status = 400; msg = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) {
    status = 409; msg = `${Object.keys(err.keyValue)[0]} already exists`;
  }
  if (err.name === 'CastError') { status = 400; msg = 'Invalid id format'; }
  if (status === 500) console.error(err);
  res.status(status).json({ msg });
};
