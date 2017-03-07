'use strict';

const debug = require('debug')('cfgram:gallery');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const Schema = mongoose.schema;

const gallerySchema = Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('gallery', gallerySchema);
