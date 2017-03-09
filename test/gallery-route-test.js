'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('glgram:gallery-route-test');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '12345',
  email: 'exampleuser@test.com'
};

const exampleGallery = {
  name: 'test gallery',
  desc: 'test gallery description'
};

mongoose.Promise = Promise;

require('../server.js');


describe('Gallery Routes', function() {
  afterEach( done => {
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
        debug('user', this.tempUser);
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        debug('token', this.tempToken);
        done();
      })
      .catch(done);
    });

    it('should return a gallery', done => {
      debug('inside it block', this.tempToken);
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
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 401 error with no token included', done => {
      debug('inside POST 401 error test');
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .end(err => {
        expect(err.status).to.equal(401);
        done();
      });
    });

    it('should return a 400 error with no/invalid body', done => {
      debug('inside POST 400 error test');
      request.post(`{url}/api/gallery`)
      .send()
      .end(err => {
        expect(err.status).to.equal(400);
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
      .end((err,res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 401 error with no token included', done => {
      debug('inside GET 401 error test');
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .end(err => {
        expect(err.status).to.equal(401);
        done();
      });
    });

    describe('GET: api/gallery', done => {
      before( done => {
        Gallery.remove({});
        done();
      })
      it('should return a 404 error with a valid request but id not found', done => {
        debug('inside GET 404 error test');
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end(err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('PUT: /api/gallery', function() {
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
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
      this.tempGallery = new Gallery(exampleGallery);
      this.tempGallery.userID = this.tempUser._id;
      this.tempGallery.save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    describe('with a valid token and a valid body', () => {
      it('should return an updated gallery', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({name: 'new name', desc: 'new desc'})
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('new name');
          expect(res.body.desc).to.equal('new desc');
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('with an invalid body', () => {
      it('should return a 404', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({broken: 'not valid'})
        .end((err, res) => {
          expect(err.message).to.equal('Bad Request');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('with an invalid gallery ID', () => {
      it('should return a 404 ', done => {
        request.put(`${url}/api/gallery/brokenID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({name: 'no name update', desc: 'no desc update'})
        .end((err, res) => {
          expect(err.message).to.equal('Not Found');
          expect(err.status).to.equal(404);
          done();
        });
      });
    });
  });
});
