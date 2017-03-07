'use strict';

const createError = require('http-errors');
const debug = require('debug')('cfgram:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('auth');
  var authHeader = req.headers.authorization;
  if(!authHeader) return next(createError(401, 'authorization header required'));

  var base64string = authHeader.split('Basic ');
  if(!base64string) return next(createError(401, 'username and password required'));

  var utf8str = new Buffer(base64string, 'base64').toString();
  var authArray = utf8str.split(':');

  req.auth = {
    username: authArray[0],
    password: authArray[1]
  };

  if(!authArray[0]) return next(createError(401, 'username required'));
  if(!authArray[1]) return next(createError(401, 'password required'));
};
