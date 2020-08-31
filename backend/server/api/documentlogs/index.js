'use strict';

var express = require('express');
var controller = require('./documentlogs.controller');
var router = express.Router();
var multiparty = require('connect-multiparty');
var path = require('path');
var multipartyMiddleware = multiparty();
var auth = require('../../auth/auth.service');

multipartyMiddleware,

    router.use(multiparty({ uploadDir: path.dirname('./uploads') + '/uploads' }));

router.get('/', controller.index);
router.get('/getSingleLog/:id', controller.getSingleLog);
router.get('/:id', controller.show);

router.post('/logs/', controller.my);
router.post('/', controller.create);
router.post('/getdevice', controller.getdevice);
router.post('/fieldlogs', controller.fieldlogs)
router.post('/uploadvideo/', controller.uploadvideocreate);
router.post('/filesFilter/', controller.filesFilter);
router.post('/createBulkFieldLogs/', controller.createBulkFieldLogs);
router.post('/getDocumentSingleLog/', controller.getDocumentSingleLog);

router.put('/:id', controller.update);

router.patch('/:id', controller.update);

router.delete('/:id', controller.destroy);
router.get('/getVideoLog/:id', auth.isAuthenticated(), controller.getVideoLog);


module.exports = router;