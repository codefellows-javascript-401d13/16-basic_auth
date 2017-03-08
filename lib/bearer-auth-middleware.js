'use strict';

const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const debug = require('debug')('cfgram:basic-auth-middleware');

const User = require('../model/user.js');
module.exports = function(req, res, next){
  debug('bearer auth');
  var authHeader = req.headers.authorization;
  console.log('auth header in beaerer auth', authHeader);
  if(!authHeader) {
    return next(createError(401, 'authorization header required'));
  }
  var token = authHeader.split('Bearer ')[1];
  if(!token) return next(createError(401, 'token required'));
  jwt.verify(token, process.env.APP_SECRET, (err, decoded) => {
    if(err) return next(err);

    User.findOne({ findHash: decoded.token})
    .then( user => {
      req.user = user;
      next();
    })
    .catch(err => {
      next(createError(401, err.message));
    });
  });
};
