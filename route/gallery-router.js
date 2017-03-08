'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:gallery-router');
const Router = require('express').Router;
const createError = require('http-errors');

const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const galleryRouter = module.exports = Router();

galleryRouter.post('/api/gallery', bearerAuth, jsonParser, function (req, res, next) {
  debug('POST:/api/gallery');

 //user ID attatched here/
  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => res.json(gallery))
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, function(req, res, next){
  debug('GET: /api/gallery/:id');


//this gallery belongs to this user//
  Gallery.findById(req.params.id)
  .then( gallery => {
    if(gallery.userID.toString() !== req.user._id.toString()){
      return next(createError(401, 'invalid user'));
    }
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/galley/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/gallery/:id');
  Gallery.findById(req.params.id)
  .then(gallery => {
    if(gallery.userID.toString() !== req.user._id.toString()) return(createError(401, 'invalid userId'));
    return Gallery.findByIdAndUpdate(req.params.id, req.body, {new: true});
  })
  .then(gallery => {
    res.json(gallery);
  })
  .catch(err => next(createError(404, err.message)));
});
