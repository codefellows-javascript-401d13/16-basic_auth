'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('glgram:auth-router-test');
const User = require('../model/user.js');

mongoose.Promise = Promise;

require('../server.js');

const url = 'http://localhost:${process.env.PORT}';

const exampleUser = {
  username: 'exampleUser',
  password: '12345',
  email: 'exampleUser@test.com'
};

describe('Authorization Routes', function() {
  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
        });
      });
    });
  });
});
