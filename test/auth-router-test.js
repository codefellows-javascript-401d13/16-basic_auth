'use strict';

require('./lib/test-env.js');
const awsMocks = require('./lib/aws-mocks.js');  //eslint-disable-line

const expect = require('chai').expect;
const request = require('superagent');

const User = require('../model/user.js');

require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  email: 'example@user.com',
  password: 'pa55word',
};

describe('Auth Routes', function() {
  describe('POST: /api/signup', function() {
    afterEach( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });
    describe('with a valid body', function() {
      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with an invalid body', function() {
      it('should respond with a 400 error', done => {
        request.post(`${url}/api/signup`)
        .send('invalid body')
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/signin', function() {
    beforeEach( done => {
      let user = new User(exampleUser);
      user.generatePasswordHash(exampleUser.password)
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

    describe('with valid user auth header', function() {
      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('exampleuser', 'pa55word')
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    describe('with an invalid password', function() {
      it('should respond with a 401', done => {
        request.get(`${url}/api/signin`)
        .auth('exampleuser', 'wrong password')
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });

    });
  });
});
