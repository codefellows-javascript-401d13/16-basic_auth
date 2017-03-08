'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'test user',
  password: 'test password',
  email: 'testemail@test.com',
};

const exampleGallery = {
  name: 'testing gallery',
  desc: 'testing gallery description',
};

mongoose.Promise = Promise;

describe('Gallery Routes', function(){
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/gallery', () => {
    describe('with a valid body',() => {
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

      it('should return a gallery', done => {
        request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          let date = new Date(res.body.created).toString();
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.desc).to.equal(exampleGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('Invalid date');
          done();
        });
      });

      describe('with invalid body', function(){
        before(done => {
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
          .catch();
        });

        it('should return a 400 for bad request', done => {
          request.post(`${url}/api/gallery`)
          .send({})
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
        });

        describe('if no token found', () => {
          it('should return a 401 status code', done => {
            request.post(`${url}/api/gallery`)
            .send(exampleGallery)
            .set({})
            .end((err, res) => {
              expect(res.status).to.equal(401);
              done();
            });
          });
        });
      });
    });
  });


  describe('GET: /api/gallery/:id', () => {
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then ( user => {
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

    after( () => {
      delete exampleGallery.userID;
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
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    describe('with invalid request if id not found', () => {
      it('should return a 404 status', done => {
        request.get(`${url}/api/gallery/`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
    describe('invalid if no token found', () => {
      it('should return a 401 status', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('PUT: /api/gallery/:id', () => {
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then ( user => {
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
      this.tempGallery = new Gallery(exampleGallery);
      this.tempGallery.userID = this.tempUser._id;
      this.tempGallery.save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    describe('with a valid token', () => {
      describe('with a valid body', () => {
        it('should return an updated gallery', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({name: 'updatedName', desc: 'updatedDesc'})
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal('updatedName');
            expect(res.body.desc).to.equal('updatedDesc');
            expect(res.body.userID).to.equal(this.tempUser._id.toString());
            done();
          });
        });
      });

      describe('with an invalid body', () => {
        it('should return a 400 error', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({wrongName: 'this is wrong', wrongDesc: 'this is also wrong'})
          .end((err, res) => {
            expect(res.status).to.equal(400);
            done();
          });
        });
      });
      describe('with an invalid gallery id', () => {
        it('should return a 404', done => {
          request.put(`${url}/api/gallery/`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({ name: 'this is wrong', desc: 'this is also wrong'})
          .end((err, res) => {
            expect(res.status).to.equal(404);
            done();
          });
        });
      });
    });

    describe('with an invalid token found', () => {
      it('should return a 401 error', done => {
        request.put(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: 'wrong'
        })
        .send({name: 'updatedName', desc: 'updatedDesc'})
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
});
