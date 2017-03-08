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
  //////
  // Setup Hooks for ALL Routes
  /////

  // Clear User and Gallery before all tests
  before( () => {
    return Promise.all([ User.remove({}), Gallery.remove({}) ])
    .catch(Promise.reject);
  });

  // Create a User and token before all tests
  beforeEach( () => {
    return new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => user.save())
    .then( user => {
      this.tempUser = user;
      return user.generateToken();
    })
    .then( token => {
      this.tempToken = token;
      return Promise.resolve();
    })
    .catch(Promise.reject);
  });

  // Clear User and Gallery after all tests
  afterEach( () => {
    return Promise.all([ User.remove({}), Gallery.remove({}) ])
    .catch(Promise.reject);
  });

  describe('POST /api/gallery', () => {
    // beforeEach( () => {
    //   return new User(exampleUser)
    //   .generatePasswordHash(exampleUser.password)
    //   .then( user => user.save())
    //   .then( user => {
    //     this.tempUser = user;
    //     return user.generateToken();
    //   })
    //   .then( token => this.tempToken = token)
    //   .catch(Promise.reject);
    // });

    describe('with a valid body', () => {
      it('should return a gallery', () => {
        return request.post(`${url}/api/gallery`)
        .send(exampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .then( res => {
          let date = new Date(res.body.created).toString();

          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleGallery.name);
          expect(res.body.desc).to.equal(exampleGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          expect(date).to.not.equal('Invalid Date');
        })
        .catch(Promise.reject);
      });
    });
  });

  describe('GET /api/gallery/:id', () => {
    beforeEach( () => {
      console.log('tempToken:', this.tempToken);
      console.log('tempUser:', this.tempUser);
      exampleGallery.userID = this.tempUser._id.toString();
      return new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        return Promise.resolve();
      })
      .catch(Promise.reject);
    });

    afterEach( () => delete exampleGallery.userID);

    describe('with a valid id', () => {
      it('should return a gallery', () => {
        return request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .then( res => {
          expect(res.status).to.equal(200);
        })
        .catch(Promise.reject);
      });
    });
  });
});
