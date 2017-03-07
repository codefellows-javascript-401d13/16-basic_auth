'use strict';

const
  Router = require('express').Router,
  jsonParser = require('body-parser').json(),
  debug = require('debug')('CFgram:auth-router'),
  authmiddleware = require('../lib/auth-middleware.js'),

  User = require('../model/user.js'),

  authRouter = module.exports = new Router();

authRouter.post('/api/signup',jsonParser, function(req, res, next){
  debug('POST /api/signup');
  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.genpasswordHash(password)
  .then( user => user.save())
  .then( user => user.genToken())
  .then( token => res.send(token))
  .catch(next);
});

authRouter.get('/api/login',authmiddleware, function(req, res, next){
  debug('GET /api/login');
  User.findOne({username: req.auth.username})
  .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => user.genToken())
  .then( token => res.send(token))
  .catch(next);
});