'use strict';

var express = require('express');
var controller = require('./signature.controller');
var multiparty = require('connect-multiparty');
var path = require('path');
var multipartyMiddleware = multiparty();
var router = express.Router();

router.use(multiparty({ uploadDir: path.dirname('./signature') + '/signature' }));

router.get('/:email', controller.index);
router.get('/initialList/:email', controller.initialList);
router.get('/getsignature/:id', controller.getsignature)
router.get('/:id', controller.show);

router.post('/getDefault/:email', controller.getDefault);
router.post('/', multipartyMiddleware, controller.create);
router.post('/createfrommobilelink/', multipartyMiddleware, controller.createfrommobilelink);
router.post('/', controller.create);

router.put('/setDefaultSetting/:id', controller.setDefaultSetting);
router.put('/:id', controller.update);

router.patch('/:id', controller.update);

router.delete('/:id', controller.destroy);

module.exports = router;