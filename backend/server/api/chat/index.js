'use strict';

var express = require('express');
var controller = require('./chat.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();


router.get('/getdoc/:id',auth.isAuthenticated(), controller.index);
router.get('/:id', controller.show);
router.get('/',auth.isAuthenticated(), controller.getChat);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;