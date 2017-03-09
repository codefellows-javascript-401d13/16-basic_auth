'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:gallery-router');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function(req, res, next){
  debug('post /api/gallery');
  if(!req.body.name) return next(createError(400, 'expected a name'));
  if(!req.body.desc) return next(createError(400, 'expected a desc'));
  req.body.userID = req.user._id;

  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('Get: /api/gallery/:id');

  Gallery.findById(req.params.id)
  .then( gallery => {
    console.log('gallery in findbyID get', gallery);
    if(gallery.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('Put: /api/gallery/:id');

  if(!req.body.name) return next(createError(400, 'expected a name'));
  if(!req.body.desc) return next(createError(400, 'expected a desc'));


  Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( gallery => {
    if(gallery.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('Delete: /api/gallery/:id');

  Gallery.findByIdAndRemove(req.params.id)
  .then( () => res.sendStatus(204))
  .catch(next);
});
