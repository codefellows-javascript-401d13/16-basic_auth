'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');
const morgan = require('morgan');
const errors = require('./lib/error-middleware.js');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(morgan('dev'));

app.use(errors);

app.listen(PORT, () => {
  debug(`Server's up on PORT: ${PORT}`);
});
