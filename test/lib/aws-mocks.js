'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  ETag: '"MOCKETAG8888"',
  Location: 'https://mockimageuri.com',
  Key: 'mockpic.png',
  key: 'mockpic.png',
  Bucket: 'test-bucket',
};

AWS.mock('S3', 'upload', function(params, callback) {
  if (!params.ACL === 'public-read') {
    return callback(new Error('ACL must be public-read'));
  }

  if(!params.Bucket === 'test-bucket') {
    return callback(new Error('bucket must be test-bucket'));
  }
  if(!params.Key) {
    return callback(new Error('key required'));
  }
  if(!params.Body) {
    return callback(new Error('body required'));
  }

  callback(null, exports.uploadMock);
});
