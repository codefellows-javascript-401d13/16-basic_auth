'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  ETag: ' "1234abcd"',
  Location: 'http://testurl.com/test.png',
  Key: '206.png',
  key: '206.png',
  Bucket: 'cfgram-tester'
};

AWS.mock('S3', 'upload', function(params, callback) {
  if (!params.ACL === 'public-read') {
    return callback(new Error('ACL must be public-read'));
  }

  if (!params.Bucket === 'cfgram-tester') {
    return callback(new Error('bucket must be cfgram-tester'));
  }

  if (!params.Key) {
    return callback(new Error('Key required'));
  }

  if (!params.Body) {
    return callback(new Error('body required'));
  }

  callback(null, exports.uploadMock);
});
