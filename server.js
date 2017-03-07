'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');
const Promise = require('bluebird');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const errors = require('./lib/error-middleware.js');
const authRouter = require('./route/auth-route.js');

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.load();
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(errors);

app.listen(PORT, () => {
  debug(`Port is up yo: ${PORT}`);
});
