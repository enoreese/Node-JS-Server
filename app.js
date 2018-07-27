var express = require('express');
var app = express();
var db = require('./db');
var multer = require('multer');

global.__root   = __dirname + '/';

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var profile = require(__root + 'auth/profile');
app.use('/api/profile', profile);

var Transaction = require(__root + 'merchant/merchantController');
app.use('/api/merchant', Transaction)

module.exports = app;
