'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'test user',
  password: 'test password',
  email: 'testemail@test.com'
};

describe('Auth Routes', function() {
  describe('POST: /api/signup', function(){
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
          if (err) return done(err);
          console.log('token:', res.text);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });

  describe('with invalid body', function(){
    it('should return a 400 for bad request', (done) => {
      request.post(`${url}/api/signup`)
      .send('hi')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {
      before ( done => {
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
        .auth('test user', 'test password')
        .end((err, res) => {
          if(err) return done(err);
          console.log('temporary user:', this.tempUser);
          console.log('GET: /api/signin token', res.text);
          expect(res.status).to.equal(200);
          done();
        });
      });

      describe('without a valid authenication', function ()  {
        it('should return a 401 error', done => {
          request.get(`${url}/api/signin`)
          .auth('test user', 'wrong password')
          .end(err => {
            expect(err.status).to.equal(401);
            done();
          });
        });
      });
    });
  });
});
