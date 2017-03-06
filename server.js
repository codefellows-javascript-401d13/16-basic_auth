'use strict';

const express = require('express');
const Promise = require('bluebird');
const dotenv = require('dotenv');
const morgan = require('morgan');
const debug = require('debug')('glgram:server');
const mongoose = require('mongoose');
const cors = require('cors');

const authRouter = require('./route/auth-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT;
// const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

// mongoose.connect(process.env.MONGODB_URI);

// app.use(cors());
// app.use(morgan('dev'));
// app.use(authRouter);
// app.use(errors);

app.listen(PORT, () => {
  debug(`server running on : ${PORT}`);
});
