'use strict';

const fs = require('fs'); //file system operations
const path = require('path'); //allows to extract info about the file
const del = require('del'); //deleting things in our filesystem//
const AWS = require('aws-sdk'); //constructor allowing uploads
const multer = require('multer'); //hash file name//
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('cfgram:pic-router');

const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`; //putting images into a data directory
const upload = multer({ dest: dataDir});

const picRouter = module.exports = Router();

function s3uploadProm(params){
  debug('s3uploadProm');
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => { //allows to upload an image, heres info
      resolve(s3data); //image uri and access key in s3data
    });
  });
}

picRouter.post('/api/gallery/:galleryID/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/gallery/:galleryID/pic');

  if(!req.file) { //file is from upload middleware//
    return next(createError(400, 'file not found'));
  }
  if(!req.file.path) { // path is where the file lives
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname); //will extract extension name(.png) from a file

  let params = {
    ACL: 'public-read', //image URI that anyone can see
    Bucket: process.env.AWS_BUCKET, //save this image at this bucket
    Key: `${req.file.filename}${ext}`, //grabs hashed version of filename & add .png from above
    Body: fs.createReadStream(req.file.path) //where we read the image & send
  };

  Gallery.findById(req.params.galleryID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);
    let picData = {
      name: req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      galleryID: req.params.galleryID
    };
    return new Pic(picData).save();
  })
  .then( pic => res.json(pic))
  .catch( err => next(err));
});
