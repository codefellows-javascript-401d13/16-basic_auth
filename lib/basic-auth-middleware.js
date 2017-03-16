'use strict';

const createError = require('http-errors');
const debug = require('debug')('cfgram:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('basic auth');

  var authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'authorization header required'));
  };

var base64str = authHeader.split('Basic ')[1];
if (!base64str) {
  return next(createError(401, 'username and password required'));
};

};
