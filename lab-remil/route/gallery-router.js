'use strict';

const debug = require('debug')('ayogram:gallery-router');
const jsonParser = require('body-parser').json();

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Gallery = require('../model/gallery.js');

const galleryRouter = module.exports = require('express').Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/gallery');

  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});
