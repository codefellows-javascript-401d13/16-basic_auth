'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  email: 'example@user.com',
  password: 'pa55word',
};

const exampleGallery = {
  name: 'Example Gallery Name',
  desc: 'example gallery desription',
};

describe('Gallery Routes', function() {
  before( done => {
    Promise.all([ User.remove({}), Gallery.remove({}) ])
    .then( () => done())
    .catch(done);
  });

  beforeEach( done => {
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

  afterEach( done => {
    Promise.all([ User.remove({}), Gallery.remove({}) ])
    .then( () => done())
    .catch(done);
  });

  describe('POST /api/gallery', () => {
    describe('with a valid body', () => {
      it('should return a gallery', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err, res) => {
          if (err) done(err);
          let date = new Date(res.body.created).toString();

          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.desc).to.equal(exampleGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      });
    });

    describe('with no token provided', () => {
      it('should respond with a 401 code', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with a bad body', () => {
      it('should respond with a 400 code', done => {
        request.post(`${url}/api/gallery`)
        .send('bad body')
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET /api/gallery/:id', () => {
    beforeEach( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    afterEach( () => delete exampleGallery.userID);

    describe('with a valid id', () => {
      it('should return a gallery', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err,res) => {
          if (err) done(err);
          let date = new Date(res.body.created).toString();

          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.desc).to.equal(exampleGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      });
    });

    describe('with no token provided', () => {
      it('should respond with a 401 code', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe(' with a valid request with an id that was not found', () => {
      it('should respond with a 404 code', done => {
        request.get(`${url}/api/gallery/invalidID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
