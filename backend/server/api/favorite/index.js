'use strict';

var express = require('express');
var controller = require('./favorite.controller');

var router = express.Router();
var auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', controller.show);

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/multifavorite', auth.isAuthenticated(), controller.multifavorite);

router.put('/:id', controller.update);

router.patch('/:id', controller.update);

router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;