'use strict';

/* For use in development, remove before production */

const fs = require('fs');
fs.createReadStream('.sample_env')
.pipe(fs.createWriteStream('.env'));
