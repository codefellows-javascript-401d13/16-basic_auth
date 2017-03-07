'use strict';

const
  express = require('express'),

  morgan = require('morgan'),
  cors = require('cors'),
  debug = require('debug'),
  errors = require('./lib/error-middleware.js'),
  mongoose = require('mongoose'),
  dotenv = require('dotenv');

dotenv.load();

const
  app = express(),
  PORT = process.env.PORT || 3000;


mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(errors);
app.listen(PORT, ()=> debug('SERVER UP AT ', PORT));