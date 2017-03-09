'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('glgram:gallery-router');


const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/gallery');

  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/gallery');

  Gallery.findById(req.params.id, function(err) {
    if (err) {
      if (err.name === 'CastError') next(createError(404, 'gallery is not found'));
    }
  })
  .then( gallery => {
    if (!gallery) return next(createError(404, 'gallery is not found'));
    if (gallery.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/gallery/:id');
  if(!req.body.name) return next(createError(400, 'name required'));
  if(!req.body.desc) return next(createError(400, 'description required'));

  Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( gallery => {
    if (!gallery) return next(createError(404, 'Not found'));
    if (gallery.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(gallery);
  })
  .catch(next);
});


galleryRouter.delete('/api/people/:id', function(req, res, next) {
  debug('DELETE: /api/gallery/:id');

  Gallery.findByIdAndRemove(req.params.id)
  .then(gallery => {
    if(!gallery) return next(createError(404, 'Not found'));
    res.sendStatus(204);
  })
  .catch(next);
});
