'use strict';

const
  mongoose = require('mongoose'),
  debug = require('debug')('CFgram:user'),
  Promise = require('bluebird'),
  bcrypt = require('bcrypt'),
  crypto = require('crypto'),
  createError = require('http-errors'),
  jwt = require('jsonwebtoken');



const userSchema = mongoose.Schema({
  username : {type: String, required: true, unique: true},
  email : {type: String, required: true, unique: true},
  password: {type: String, requires: true},
  findHash: {type: String, required: true}
});

userSchema.methods.genPasswordHash = function(password){
  debug('genPasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if(err) return reject(err);
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(password){
  debug('comparePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(createError(401, 'Wrong password'));
      resolve(this);
    });
  });
};

userSchema.methods.genFindHash = function(){
  debug('genFindHash');

  return new Promise((resolve, reject) => {
    let tries = 0;

    function _genFindHash(){
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then(() => resolve(this.findHash))
      .catch( err => {
        if (tries > 3) return reject(err);
        tries++;
        _genFindHash.call(this);
      });
    }
  });
};

userSchema.methods.genToken = function(){
  debug('genToken');

  return new Promise((resolve, reject) => {
    this.genFindHash()
    .then(findHash => resolve(jwt.sign({token: findHash}), process.env.APP_SECRET))
    .catch( err => reject(err));
  });
};


module.exports = mongoose.model('user', userSchema);
