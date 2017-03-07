'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const errors = require('./lib/error-middleware.js');
const galleryRouter = require('./route/gallery-router.js');
const authRouter = require('./route/auth-router.js');

dotenv.load();

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(galleryRouter);
app.use(errors);

app.listen(PORT, () => {
  debug(`Server's up on PORT: ${PORT}`);
});
