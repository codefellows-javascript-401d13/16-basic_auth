'use strict';

const express = require('express');
const Promise = require('bluebird');
const dotenv = require('dotenv');
const morgan = require('morgan');
const debug = require('debug')('glgram:server');
const mongoose = require('mongoose');
const cors = require('cors');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const picRouter = require('./route/pic-router.js');
const errors = require('./lib/error-middleware.js');
debug('step 1');
dotenv.load();

const PORT = process.env.PORT;

const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`server running on : ${PORT}`);
});

server.isRunning = true;
