'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'testuser',
  password: 'TESTpassword',
  email: 'testuser@email.com'
};

const testGallery = {
  name: 'test gallery',
  desc: 'test gallery description'
};

mongoose.Promise = Promise;

describe('Gallery Routes', function() {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/gallery', function() {
    beforeEach( done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
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

    describe('with a valid body', () => {
      it('should return a gallery', done => {
        request.post(`${url}/api/gallery`)
        .send(testGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(testGallery.name);
          expect(res.body.desc).to.equal(testGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('invalid date');
          done();
        });
      });
    });

    describe('with a missing body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/gallery`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });

    describe('with an invalid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/gallery`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({ name: true })
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });

    describe('without a token', () => {
      it('should return a 401 error', done => {
        request.post(`${url}/api/gallery`)
        .send(testGallery)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });
  });

  describe('GET: /api/gallery/:id', function() {
    beforeEach( done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
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
      testGallery.userID = this.tempUser._id.toString();
      new Gallery(testGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testGallery.userID;
    });

    describe('with a valid id', () => {
      it('should return a gallery', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.body.name).to.equal(testGallery.name);
          expect(res.body.desc).to.equal(testGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      });
    });

    describe('without token', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(err.status).to.equal(res.status);
          done();
        });
      });
    });

    describe('with an unrecognized id', () => {
      it('should return a 404 error', done => {
        let fakeID = '111222333444555666777888';
        request.get(`${url}/api/gallery/${fakeID}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(err.status).to.equal(res.status);
          done();
        });
      });
    });
  });

  describe('PUT: /api/gallery/:id', function() {
    beforeEach( done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
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
      testGallery.userID = this.tempUser._id.toString();
      new Gallery(testGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testGallery.userID;
    });

    describe('with a valid id and request', () => {
      it('should return an updated gallery', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send( { name: 'update test'} )
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('update test');
          done();
        });
      });
    });
  });

  describe('DELETE: /api/gallery/:id', function() {
    beforeEach( done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
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
      testGallery.userID = this.tempUser._id.toString();
      new Gallery(testGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testGallery.userID;
    });

    describe('with a valid id', () => {
      it('should return a 204 message', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
  });
});
