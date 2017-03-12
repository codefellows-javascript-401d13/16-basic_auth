'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('cfgram:server');

dotenv.load();

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});
