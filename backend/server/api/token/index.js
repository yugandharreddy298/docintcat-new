'use strict';

var express = require('express');
var controller = require('./token.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.post('/', auth.isAuthenticated(),controller.create);
router.post('/auth', controller.auth);
router.post('/fingerprint', controller.fingerprintupdate);
router.delete('/:id', controller.destroy);
router.get('/update/:uuid',controller.updateToken)

module.exports = router;