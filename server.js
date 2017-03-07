'use strict';

const express = require('express');
const morgan = require('morgan');
const debug = require('debug')('cfgram:server');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRouter = require('./route/basic-auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(galleryRouter);
app.use(authRouter);
app.use(errors);

app.listen(PORT, () => {
  debug(`Server up: ${PORT}`);
});
