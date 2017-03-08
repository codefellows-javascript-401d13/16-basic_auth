'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
    username: 'exampleuser',
    password: '1234',
    email: 'exampleuser@test.com'
};

const exampleGallery = {
    name: 'test gallery',
    desc: 'test gallery description'
};

describe('Gallery Routes', function() {
    afterEach( done => {
        Promise.all([
            User.remove({}),
            Gallery.remove({})
        ])
        .then( () => done())
        .catch(done);
    });

    describe('POST: /api/gallery', () => {
        describe('with a valid body', function() {
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
                    if (err) return done(err);
                    let date = new Date(res.body.created).toString();
                    expect(res.body.name).to.equal(exampleGallery.name);
                    expect(res.body.desc).to.equal(exampleGallery.desc);
                    expect(res.body.userID).to.equal(this.tempUser._id.toString());
                    expect(date).to.not.equal('invalid date');
                    expect(res.status).to.equal(200);
                    done();
                });
            });
        });

        describe('with an invalid body', function() {
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
                .set({
                    Authorization: `Bearer ${this.tempToken}`
                })
                .end((err, res) => {
                    expect(res.status).to.equal(400);
                    done();
                });
            });

            it('should return a gallery', done => {
                request.post(`${url}/api/gallery`)
                .send(exampleUser)
                .send((err, res) => {
                    expect(res.status).to.equal(401);
                })
                done();
            });
        });
    });

    describe('GET: /api/gallery/:id', () => {
        describe('with a valid id', function() {
            before( done => {
                new User(exampleUser)
                .generatePasswordHash(exampleUser.password)
                .then( user => user.save())
                .then( user => {
                    this.tempUser = user;
                    return user.generateToken()
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
                    if (err) return done(err);
                    let date = new Date(res.body.created).toString();
                    expect(res.body.name).to.equal(exampleGallery.name);
                    expect(res.body.desc).to.equal(exampleGallery.desc);
                    expect(res.body.userID).to.equal(this.tempUser._id.toString());
                    expect(date).to.not.equal('invalid date');
                    expect(res.status).to.equal(200);
                    done();
                });
            });
        });

        describe('with an invalid id', function() {
            before( done => {
                new User(exampleUser)
                .generatePasswordHash(exampleUser.password)
                .then( user => user.save())
                .then( user => {
                    this.tempUser = user;
                    return user.generateToken();;
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
                .end((err, res) => {
                    expect(res.status).to.equal(401);
                    done();
                });
            });
        });

        describe('with an invalid id and valid token', function() {
            before( done => {
                new User(exampleUser)
                .generatePasswordHash(exampleUser.password)
                .then( user => user.save())
                .then( user => {
                    this.tempUser = user;
                    return user.generateToken();;
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
                request.get(`${url}/api/nopath`)
                .set({
                    Authorization: `Bearer ${this.tempToken}`
                })
                .end((err, res) => {
                    expect(res.status).to.equal(404);
                    done();
                });
            });
        });
    });

    describe('PUT: /api/gallery/:id', () => {
        describe('with an invalid body', function() {
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
                    done;
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

            after(() => {
                delete exampleGallery.userID;
            });

            it('should return a PUT request with a valid body', done => {
                let newGallery = {
                    name: 'updated gallery',
                    desc: 'updated gallery description'
                };

                request.put(`${url}/api/gallery/${this.tempGallery._id}`)
                .send(newGallery)
                .set({
                    Authorization: `Bearer ${this.tempToken}`
                })
                .end((err, res) => {
                    if (err) return done(err);
                    this.tempGallery = res.body;
                    expect(res.body.name).to.equal('updated gallery');
                    expect(res.body.desc).to.equal('updated gallery description');
                    expect(res.status).to.equal(200);
                    done();
                });
            });
        });

        describe('with an invalid body', function() {
            before( done => {
                new User(exampleUser)
                .generatePasswordHash(exampleUser.password)
                .then( user => user.save())
                .then( user => {
                    this.tempUser = user;
                    return user.generateToken();;
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

            it('should return a valid id', done => {
                request.put(`${url}/api/nopath`)
                .send({ 
                    name: 'updated gallery', 
                    desc: 'updated gallery description'
                })
                .set({
                    Authorization: `Bearer ${this.tempToken}`
                })
                .send((err, res) => {
                    expect(res.status).to.equal(404);
                    done();
                });
            });
        });
    });
});