
'use strict';
const debug = require('debug')('ayogram:server');
const Promise = require('bluebird');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const picRouter = require('./route/pic-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT || 3000;
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

let morganFormat = process.env.PRODUCTION ? 'common' : 'dev';

const app = require('express')();

app.use(cors());
app.use(morgan(morganFormat));

app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);

app.use(errors);

const server = module.exports = app.listen(PORT, debug(`Servin' it up on >>>> ${PORT} <<<<`));

server.isRunning = true;
