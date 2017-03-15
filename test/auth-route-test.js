'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

// const AuthRouter = require('../route/auth-router.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

//invalid route
describe('invalid route', () => {
  it('should return a 404 error', done => {
    request.get(`${url}/api/epicfail`)
    .end(err => {
      expect(err.status).to.equal(404);
      done();
     });
    });
  });


describe('Auth Routes', function() {
  describe('POST: /api/signup', function() {
    describe('with a valid body', () => {

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if (err) return done(err);
          console.log('\ntoken:', res.text, '\n');
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });


      describe('an invalid body', function() {
       it('should return a 400 error', done => {
       request.post(`${url}/api/signup`)
          .end(err => {
            expect(err.status).to.equal(400);
            done();
          });
        });
      });
    });

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {
      before( done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });

      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('exampleuser', '1234')
        .end((err, res) => {
          if (err) return done(err);
          console.log('\nuser:', this.tempUser);
          console.log('\ntoken:', res.text);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    //GET 401 error

    describe('invalid authentication header', function() {
      it ('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .end(err => {
          expect(err.status).to.equal(401);
          done();
        });
      });

   });
  });
});
