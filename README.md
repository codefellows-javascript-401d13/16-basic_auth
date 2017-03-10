![cf](https://i.imgur.com/7v5ASc8.png) Lab 16 - Basic Auth
======
After cloning down the repository, in the root directory run:

```sh
$ node setup
```
Then, copy the values submitted with this pull request and paste them in the newly created `.env` file copy inside of the quotes:
```sh
MONGODB_URI='<secret mongodb env var goes here>'
APP_SECRET='<token goes here>'
```
Now you'll have the necessary environment variables needed for authentication.

After that's done, install the dependency modules using the command line:
```
$ npm install
```
Once they're all loaded up, to run tests use:
```
$ npm test
```
Or to run the app use:
```
$ npm start
```
Current existing routes allow user to sign up and sign in using an unique username, a password of their choice (which is encrypted using bcrypt before storage) and an email. 
