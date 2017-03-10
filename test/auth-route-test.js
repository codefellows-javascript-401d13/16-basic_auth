'use strict';

require('./lib/test-env.js');
require('./lib/aws-mocks.js');

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'test user',
  password: 'password',
  email: 'testuser@test.com'
};

describe('Auth Routes', function() {
  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(testUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with an invalid body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .send( { dog: 'cat', baller: true, lame: false })
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });

    describe('with a missing body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });
  });

  describe('POST: /', function() {
    describe('undefined post routes', function() {
      it('should return a 404 error', function(done) {
        request.post(`${url}/`)
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });
  });

  describe('GET: /api/signin', function() {
    beforeEach( done => {
      let user = new User(testUser);
      user.generatePasswordHash(user.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        done();
      })
      .catch(done);
    });

    afterEach( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });

    describe('with valid credentials', function() {
      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('test user', 'password')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with invalid username', function() {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .auth('gimme all your', 'password')
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });

    describe('with invalid password', function() {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .auth('test user', 'not the password')
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });

    describe('with no credentials supplied', function() {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });

    describe('undefined GET routes', function() {
      it('should return a 404 error', done => {
        request.get(`${url}/`)
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });
  });

  describe('PUT: /api', function() {
    describe('undefined routes', function() {
      it('should return a 404 error', function(done) {
        request.put(`${url}/`)
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });
  });

  describe('DELETE: /api', function() {
    describe('undefined routes', function() {
      it('should return a 404 error', function(done) {
        request.delete(`${url}/`)
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });
  });
});
