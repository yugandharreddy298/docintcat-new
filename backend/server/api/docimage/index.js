'use strict';

var express = require('express');
var controller = require('./docimage.controller');
var router = express.Router();

router.get('/getDocumentImages/:id', controller.index);

module.exports = router;