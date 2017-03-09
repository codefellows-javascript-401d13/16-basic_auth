'use strict';

const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');
const User = require('../model/user.js');
const serverToggle = require('./lib/server-toggle.js');
const expect = require('chai').expect;
const request = require('superagent');
const server = require('../server.js');
const url = 'http://localhost:3003';

const testUser = {
  username: 'testUser',
  password: 'word',
  email: 'testUser@test.com'
};

const testGallery = {
  name: 'testGallery name',
  desc: 'testGallery description'
};

const testPic = {
  name: 'testpicname',
  desc: 'test pic description',
  image: `${__dirname}/data/tester.png`
};

describe('Pic Routes', function() {
  before(done => serverToggle.serverOn(server, done));
  after(done => serverToggle.serverOff(server, done));

  afterEach(done => {
    Promise.all([
      Pic.remove({}),
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('POST: /api/gallery/:galleryID/pic', function() {
    describe('with a valid body', function () {

      before(done => {
        new User(testUser)
        .generatePasswordHash(testUser.password)
        .then(user => {
          user.save();
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before(done => {
        testGallery.userID = this.tempUser._id.toString();
        new Gallery(testGallery).save()
        .then(gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after(done => {
        delete testGallery.userID;
        done();
      });

      it('should return a pic', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id.toString()}/pic`)
        .set( { Authorization: `Bearer ${this.tempToken}` } )
        .field('name', testPic.name)
        .field('desc', testPic.desc)
        .attach('image', testPic.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.name).to.equal(testPic.name);
          expect(res.body.desc).to.equal(testPic.desc);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });
});
