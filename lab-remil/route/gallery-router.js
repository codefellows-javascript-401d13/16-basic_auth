'use strict';

const debug = require('debug')('ayogram:gallery-router');
const createError = require('http-errors');
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

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/gallery/:id');

  Gallery.findById(req.params.id)
  .then( gallery => {
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));

    return res.json(gallery);
  })
  .catch(next);
});
