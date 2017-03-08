'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

mongoose.Promise = Promise;

const exampleUser = {
  username: 'example user',
  email: 'example@user.com',
  password: 'user password'
};

const exampleGallery = {
  name: 'example gallery',
  description: 'my example gallery'
};

describe('Gallery Routes', function () {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('POST: /api/gallery', () => {
    describe('with a valid body', () => {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
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
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.description).to.equal(exampleGallery.description);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    describe('with an invalid token', () => {
      it('should return a 401 error', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: ''
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('with an invalid body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/gallery`)
        .send()
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('GET /api/gallery/:id', function() {
    describe('with a valid body', () => {
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
        delete exampleGallery.userID;
        done();
      });

      it('should return a gallery', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          let date = new Date(res.body.created).toString();
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.description).to.equal(exampleGallery.description);
          expect(date).to.not.equal('invalid date');
          done();
        });
      });
    });
    describe('with an invalid token', () => {
      it('should return a 401', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: ''
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
    describe('with an invalid id', () => {
      let invalidId = '123-invalid-id';
      it('should return a 404', done => {
        request.get(`${url}/api/gallery/${invalidId}`)
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

  describe('PUT /api/gallery/:id', function() {
    describe('with a valid token and body', () => {
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
        exampleGallery.userID = this.tempUser._id;
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
      it('should return an updated gallery', done => {
        let updatedGallery = { name: 'updated gallery', description: 'dis the new shit'};
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('updated gallery');
          expect(res.body.description).to.equal('dis the new shit');
          done();
        });
      });
    });
    describe('with an invalid token', () => {
      let updatedGallery = { name: 'updated gallery', description: 'dis the new shit'};
      it('should return a 401 error', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .set({
          Authorization: ''
        })
        .send((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
});
