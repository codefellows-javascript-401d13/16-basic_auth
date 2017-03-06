'use strict';

const express = require('express');
const debug = require('debug')('cfgram:server');

const PORT = process.env.PORT || 3000;

const app = express();

app.listen(PORT, () => {
  debug(`Server's up on PORT: ${PORT}`);
});
