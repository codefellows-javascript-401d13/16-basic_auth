'use strict';

const
  expect = require('chai').expect,
  request = require('superagent'),
  mongoose = require('mongoose'),
  Promise = require('bluebird'),
  User = require('../model/user.js');

mongoose.Promise = Promise;
require('../server.js');

const
  url = `http://localhost:${process.env.PORT}`,
  exampleUser = {
    username: 'exampleuser',
    password: 'password',
    email: 'testuser@example.com'
  };

describe('Auth routes', function(){
  describe('POST /api/signup', function(){
    describe('with a valid body', function(){

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
          done();
        });
      });
    });
  });
});
