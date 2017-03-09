'use strict';

const debug = require('debug')('cfgram:server-toggle');

module.exports = exports = {};

exports.serverOn = function(server, done) {
  if(!server.isRunning) {
    server.listen(process.env.PORT, () => {
      debug('server turnt');
      done();
    });
    server.isRunning = true;
    return;
  }
  done();
};

exports.serverOff = function(server, done) {
  if(server.isRuning) {
    server.close( err => {
      if(err) return done(err);
      debug('server unturnt');
      done();
    });
    server.isRunning = false;
    done();
  }
  done();
};
