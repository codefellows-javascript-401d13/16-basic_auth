'use strict';

const debug = require('debug')('ayogram:basic-auth-middleware');
const createError = require('http-errors');

module.exports = function(req, res, next) {
  debug('basic auth');

  let authHeader = req.headers.authorization;
  if (!authHeader) return next(createError(401, 'authorization header required'));

  let base64str = authHeader.split('Basic ')[1];
  if (!base64str) return next(createError(401, 'username and password required'));

  let utf8str = new Buffer(base64str, 'base64').toString();
  let authArray = utf8str.split(':');

  req.auth = {
    username: authArray[0],
    password: authArray[1],
  };

  next();
};
