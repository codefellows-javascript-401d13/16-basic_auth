'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('cfgram:server');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(galleryRouter);
app.use(errors);


app.listen(PORT, () => {
  debug(`server is up: ${PORT}`);
});
