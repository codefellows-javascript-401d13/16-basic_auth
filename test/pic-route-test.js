'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('cfgram:pic-router-test');

const Pic = require('../model/pic.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'example user',
  password: 'badpass',
  email: 'example@user.com'
};

const exampleGallery = {
  name: 'test gallery',
  description: 'my test gallery'
};

const examplePic = {
  name: 'example pic',
  description: 'my example pic',
  image: `${__dirname}/data/tester.jpg`
};

describe('Pic Routes', function() {

});
