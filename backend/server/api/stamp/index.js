'use strict';

var express = require('express');
var controller = require('./stamp.controller');
var multiparty = require('connect-multiparty');
var path = require('path');
var multipartyMiddleware = multiparty();
var router = express.Router();

router.use(multiparty({ uploadDir: path.dirname('./stamp') + '/stamp' }));

router.get('/:email', controller.index);
router.get('/getDefault/:id', controller.getDefault);
router.get('/:id', controller.show);
router.get('/getstamp/:id', controller.getstamp)

router.post('/', multipartyMiddleware, controller.create);
router.post('/createfrommobilelink/', multipartyMiddleware, controller.createfrommobilelink);

router.put('/:id', controller.update);
router.put('/setDefaultSetting/:id', controller.setDefaultSetting);

router.patch('/:id', controller.update);

router.delete('/:id', controller.destroy);

module.exports = router;