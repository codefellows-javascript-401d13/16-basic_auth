'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const serverToggle = require('./lib/server-toggle.js');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleUser',
  password: '1234',
  email: 'exampleuser@test.com'
};

const exampleGallery = {
  name: 'test gallery',
  desc: 'test gallery description'
};

const updatedGallery = {
  name: 'new name',
  desc: 'new desc'
};

mongoose.Promise = Promise;

describe('Gallery Routes', function() {
  before( done => {
    serverToggle.serverOn(server, done);
  });

  after( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done =>  {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done)
  });

  describe('POST: /api/gallery', () => {
    before( done => {
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

    it('should return a gallery', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('invalid date');
        done();
      });
    });

    it('should return 400 status if invalid body', done => {
      request.post(`${url}/api/gallery`)
      .send({
        desc: 'test gallery description'
      })
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      })
    });

    it('should return 401 status if no token', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
  });

  describe('GET: /api/gallery/:id', () => {
    before( done => {
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

    before( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    after( () => {
      delete exampleGallery.userID;
    });

    it('should return a gallery', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString())
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return 401 status - no token provided', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return 404 status if no id', done => {
      request.get(`${url}/api/gallery`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

  });

  describe('PUT: /api/gallery/:id', function() {
    describe('put request', function() {
      before( done => {
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

      before( done => {
        exampleGallery.userID = this.tempUser._id.toString();
        new Gallery(exampleGallery).save()
        .then( gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });

      after( done => {
        if (this.tempGallery) {
          Gallery.remove({})
          .then( ()=> done())
          .catch(done);
          return;
        };
        done();
      });

      it('should return a gallery', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(updatedGallery.name);
          expect(res.body.desc).to.equal(updatedGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString())
          done();
        });
      });

      it('shoule return 400 status if body was invalid', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send({})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });

      it('should return 401 if token wasn\'t provided', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });

      it('should return 404 status if id not found', done => {
        request.put(`${url}/api/gallery/invalidId`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
