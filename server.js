'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const errors = require('./lib/error-middleware.js');
const galleryRouter = require('./route/gallery-router.js');
const picRouter = require('./route/pic-router.js');
const authRouter = require('./route/auth-router.js');

dotenv.load();

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

let morganFormat = process.env.PRODUCTION ? 'common' : 'dev';

app.use(cors());
app.use(morgan(morganFormat));
app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`Server's up on PORT: ${PORT}`);
});

server.isRunning = true;
