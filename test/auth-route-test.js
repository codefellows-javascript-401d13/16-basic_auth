'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const User = require('../model/user.js');
 
mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'nikko',
  password: 'soopersekret',
  email: 'nikko@soopersekret.com'
};


describe('Auth Routes', function() {
  describe('POST /api/signup', function() {
    describe('with a valid body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(err => done(err));
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
    describe('with an invalid body', function() {
      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .send('invalid body')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/signin', function() {
    describe('With a valid body', () => {
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
        .auth('nikko', 'soopersekret')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });

      describe('with an invalid body', function() {
        it('should return a 401 error', done => {
          request.get(`${url}/api/signin`)
          .auth('just-nikko')
          .end((err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });
    });
  });
});
