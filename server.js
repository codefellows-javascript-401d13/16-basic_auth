'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const debug = require('debug')('cfgram:server');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const picRouter = require('./route/pic-router.js');
const errors = require('./lib/error-middleware.js');

//cooool stuff

const PORT = process.env.PORT || 3000;
const app = express();
dotenv.load();

mongoose.connect(process.env.MONGODB_URI);

let morganFormat = process.env.PRODUCTION ? 'common' : 'dev';

app.use(cors());
app.use(morgan(morganFormat));


app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);
app.use(errors);


const server = module.exports = app.listen(PORT, () => {
  debug(`server is up: ${PORT}`);
});

server.isRunning = true;
