'use strict';

require('./lib/test-env.js');
const awsMocks = require('./lib/aws-mocks.js');

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');
const Pic = require('../model/pic.js');

const serverToggle = require('./lib/server-toggler.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  email: 'example@user.com',
  password: 'pa55word',
};

const exampleGallery = {
  name: 'Example Gallery Name',
  desc: 'example gallery desription',
};

const examplePic = {
  name: 'Example Pic',
  desc: 'example pic description',
  image: `${__dirname}/data/ayo.png`,
};

describe('Pic Routes', function() {
  before( done => serverToggle.serverOn(server, done));

  before( done => {
    Promise.all([ User.remove({}), Gallery.remove({}), Pic.remove({}) ])
    .then( () => done())
    .catch(done);
  });

  beforeEach( done => {
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then( user => {
      this.tempUser = user;
      return user.generateToken();
    })
    .then( token => {
      this.tempToken = token;
      done();
    })
    .catch(done);
  });

  beforeEach( done => {
    exampleGallery.userID = this.tempUser._id.toString();
    new Gallery(exampleGallery).save()
    .then( gallery => {
      this.tempGallery = gallery;
      done();
    })
    .catch(done);
  });

  afterEach( done => {
    delete exampleGallery.userID;
    done();
  });

  afterEach( done => {
    Promise.all([ User.remove({}), Gallery.remove({}), Pic.remove({}) ])
    .then( () => done())
    .catch(done);
  });

  after( done => serverToggle.serverOff(server, done));

  describe('POST: /api/gallery/:galleryID/pic', () => {
    describe('with a valid body', () => {
      it('should return a pic and post to S3', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .field('name', examplePic.name)
        .field('desc', examplePic.desc)
        .attach('image', examplePic.image)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());

          console.log('AWS Mock:', awsMocks.uploadMock);
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          done();
        });
      });
    });
  });

  // describe('DELETE: /api/gallery/:galleryID/pic/:picID', () => {
  //   beforeEach( done => {
  //
  //   });
  //   describe('with a valid pic id', () => {
  //     it('should return a 204 and remove the pic from S3', done => {
  //
  //     });
  //   });
  // });
});
