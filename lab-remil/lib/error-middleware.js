'use strict';

const debug = require('debug')('ayogram:error-middleware');
const createError = require('http-errors');

module.exports = function(err, req, res, next) {
  debug('error middleware');

  console.error('Error name:', err.name);
  console.error('Error message:', err.message);

  if (err.status) {
    res.status(err.status).send(err.message);
    next();
    return;
  }

  if (err.name === 'ValidationError') {
    err = createError(400, err.message);
    next();
    return;
  }

  if (err.name === 'ValidationError') {
    err = createError(400, err.message);
    next();
    return;
  }

  if (err.name === 'CastError') {
    err = createError(404, err.message);
    next();
    return;
  }

  err = createError(500, err.message);
  next();
};
