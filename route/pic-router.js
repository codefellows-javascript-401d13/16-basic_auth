'use strict';

const debug = require('debug')('ayogram:pic-router');
const createError = require('http-errors');
// const jsonParser = require('body-parser').json();
const Promise = require('bluebird');
const del = require('del');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AWS = require('aws-sdk');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');

AWS.config.setPromisesDependency(Promise);
const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const picRouter = module.exports = require('express').Router();

const s3UploadProm = function s3UploadProm(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

picRouter.post('/api/gallery/:galleryID/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/gallery/:galleryID/pic');

  console.log('req-file:', req.file);

  if (!req.file) return next(createError(400, 'file not found'));
  if (!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Gallery.findById(req.params.galleryID)
  .then( () => s3UploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      name: req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      galleryID: req.params.galleryID,
    };
    return new Pic(picData).save();
  })
  .then( pic => res.json(pic))
  .catch(next);
});
