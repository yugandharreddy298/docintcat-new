'use strict';

var express = require('express');
var controller = require('./notification.controller');
var router = express.Router();
var auth = require('../../auth/auth.service');

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/getOfflinenotification/',auth.isAuthenticated(), controller.getOfflinenotification);
router.get('/count/', auth.isAuthenticated(), controller.count);
router.get('/:id', auth.isAuthenticated(), controller.show);

router.post('/', controller.create);
router.post('/createnotificationForChat', controller.createnotificationForChat);
router.post('/clearAll/Notifications/', auth.isAuthenticated(), controller.clearAllNotifications);
router.post('/clearAllNotificationsactive', auth.isAuthenticated(), controller.clearAllNotificationsactive);

router.put('/:id', controller.update);

router.patch('/:id', controller.update);

router.delete('/:id', controller.destroy);

module.exports = router;