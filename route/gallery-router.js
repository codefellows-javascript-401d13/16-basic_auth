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

galleryRouter.get('/api/gallery/', bearerAuth, function(req, res, next) {
  debug('GET: /api/gallery/');

  Gallery.find({ userID: req.user._id.toString() })
  .then( galleries => res.json(galleries))
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

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/gallery/:id');

  if (!req.body || Object.keys(req.body).length === 0) return next(createError(400, 'invalid request body'));

  Gallery.findById(req.params.id)
  .then( gallery => {
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));

    return gallery;
  })
  .then( gallery => {
    Gallery.findByIdAndUpdate(gallery._id, req.body, { new: true })
    .then( gallery => res.json(gallery))
    .catch(next);
  })
  .catch(next);
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/gallery/:id');

  Gallery.findByIdAndRemove(req.params.id)
  .then( gallery => {
    if (gallery.userID.toString() !== req.user._id.toString()) return next(createError(401, 'invalid user'));

    res.sendStatus(204);
  })
  .catch(next);
});
