'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const del = require('del');
const AWS = require('aws-sdk');
const Router = require('express').Router;
// const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:pic-route');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Gallery = require('../model/gallery.js');
const Pic = require('../model/pic.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const picRouter = module.exports = Router();

function s3UploadProm(params) {
  debug('s3UploadProm');

  return new Promise((reject, resolve) => {
    s3.upload(params, (err, data) => {
      resolve(data);
    });
  });
}

picRouter.post('/api/gallery/:galleryID/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST /api/gallery/:galleryID/pic');

  if(!req.file) return next(createError(400, 'bad request'));

  if(!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Gallery.findById(req.params.galleryID)
  .then( () => s3UploadProm(params))
  .then( data => {
    del([`${dataDir}/*`]);
    let picData = {
      name: req.body.name,
      description: req.body.description,
      userID: req.user._id,
      galleryID: req.params.galleryID,
      objectKey: data.Key,
      imageURI: data.Location
    };
    return new Pic(picData).save();
  })
  .then( pic => res.json(pic))
  .catch( err => next(err));
});
