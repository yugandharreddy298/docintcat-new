'use strict';

var express = require('express');
var controller = require('./comment.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/',controller.create);
router.post('/postcommentsoutside', controller.postcommentsoutside);
router.post('/getcomments/', controller.getcomments);
router.post('/replycomments/', controller.replycomments);
router.post('/replycommentsoutside', controller.replycommentsoutside);

router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.post('/commentupdate',controller.destroy);

module.exports = router;