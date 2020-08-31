'use strict';

var express = require('express');
var controller = require('./ios.controller');


var router = express.Router();

router.get('/apple-app-site-association', controller.index);

module.exports = router;