'use strict';

var express = require('express');
var controller = require('./department.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/departmentslist', auth.isAuthenticated(), controller.departmentslist)
router.get('/:id', controller.show);

router.post('/searchdepartment/search', auth.isAuthenticated(), controller.searchdepartment);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/checkdepartments', auth.isAuthenticated(), controller.checkdepartments);

router.put('/:id', auth.isAuthenticated(), controller.update);

router.patch('/:id', controller.update);

router.delete('/:id', controller.destroy);

module.exports = router;