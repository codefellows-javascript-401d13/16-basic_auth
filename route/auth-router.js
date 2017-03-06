'use strict';

const jsonParser = require('body-parser');
const debug = require('debug')('glgram:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');

const User = require('../model/user.js');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST /api/signup');

  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});
