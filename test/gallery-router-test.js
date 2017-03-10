'use strict';

require('./lib/test-env.js');
const awsMocks = require('./lib/aws-mocks.js'); //eslint-disable-line

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

  describe('GET /api/gallery', () => {
    let secondGallery = {
      name: 'Second Galley',
      desc: 'second gallery description',
    };

    beforeEach( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      secondGallery.userID = this.tempUser._id.toString();

      let promGalleryOne = new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        return Promise.resolve;
      })
      .catch(Promise.reject);
      let promGalleryTwo = new Gallery(secondGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        return Promise.resolve;
      })
      .catch(Promise.reject);

      Promise.all([ promGalleryOne, promGalleryTwo])
      .then( () => done())
      .catch(done);
    });

    afterEach( () => delete exampleGallery.userID);

    describe('with a valid user token', () => {
      it('should return an array of that user\'s galleries', done => {
        request.get(`${url}/api/gallery`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err,res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(2);
          expect(res.body[0].userID).to.equal(res.body[1].userID);
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

  describe('PUT: /api/gallery/:id', () => {
    let updatedGallery = {
      name: 'New Gallery',
      desc: 'new gallery description',
    };

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

    describe('with a valid id and body', () => {
      it('should return a gallery', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err,res) => {
          if (err) done(err);
          let date = new Date(res.body.created).toString();

          expect(res.status).to.equal(200);
          expect(res.body._id.toString()).to.equal(this.tempGallery._id.toString());
          expect(res.body.name).to.equal(updatedGallery.name);
          expect(res.body.desc).to.equal(updatedGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('Invalid Date');
          done();
        });
      });
    });

    describe('with no token provided', () => {
      it('should return a 401 code', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send(updatedGallery)
        .end( (err,res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with a bad body', () => {
      it('should return a 400 code', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .send('bad body')
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err,res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with a bad body', () => {
      it('should return a 400 code', done => {
        request.put(`${url}/api/gallery/badID`)
        .send(updatedGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err,res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/gallery/:id', () => {
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
      it('should return a 204 code', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end( (err,res) => {
          if (err) done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });

    describe('with no token provided', () => {
      it('should respond with a 401 code', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe(' with a valid request with an id that was not found', () => {
      it('should respond with a 404 code', done => {
        request.delete(`${url}/api/gallery/invalidID`)
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
