'use strict';

const debug = require('debug')('ayogram:server');
const Promise = require('bluebird');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRouter = require('./route/auth-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT || 3000;
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

const app = require('express')();

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);

app.use(errors);

app.listen(PORT, debug(`Servin' it up on >>>> ${PORT} <<<<`));
