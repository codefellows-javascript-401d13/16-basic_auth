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
  before( () => {
    return Promise.all([ User.remove({}), Gallery.remove({}) ])
    .catch(Promise.reject);
  });

  afterEach( () => {
    return Promise.all([ User.remove({}), Gallery.remove({}) ])
    .catch(Promise.reject);
  });

  describe('POST /api/gallery', function() {
    beforeEach( () => {
      return new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => this.tempToken = token)
      .catch(Promise.reject);
    });

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
});
