'use strict';

const debug = require('debug')('cfgram:server');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const Promise = require('bluebird');
// const authRouter = require('./route/auth-router.js');
const errors = require('./lib/error-middleware.js');
const PORT = process.env.PORT || 3004;

const app = express();

app.use(cors());
app.use(morgan('dev'));
// app.use(authRouter);
app.use(errors);

app.listen(PORT, () => debug(`Listening on port ${PORT}.`));
