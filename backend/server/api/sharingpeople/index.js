'use strict';

var express = require('express');
var controller = require('./sharingpeople.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();
router.get('/getSharePeopleEmails',auth.isAuthenticated(), controller.getSharePeopleEmails);
router.get('/',auth.isAuthenticated(), controller.index);
router.get('/shared/sharedDocuments',auth.isAuthenticated(),controller.sharedDocuments); 
router.get('/getsharingpeople/:id', controller.getsharingpeople);
router.get('/getsharingpeople/auditlog/:id',auth.isAuthenticated(), controller.getsharingpeopleInauditLog);
router.get('/getorgsharingpeople/:id',auth.isAuthenticated(),controller.getorgsharingpeople);
router.get('/:id',  controller.getpass);
router.get('/getempbygroup/:id',auth.isAuthenticated(),controller.getempbygroup)
router.get('/getSharedDoc/:id', controller.getSharedDoc);
router.get('/getshareDocbasedemp/:id',controller.getshareDocbasedemp);
router.get('/checkpassword/:id/:password/:title', controller.checkpassword);
router.get('/getsharedDocumet/:fileid/:email', controller.getsharedDocumet);
router.get('/getfoldersharingpeople/:id', controller.getfoldersharingdata);

router.put('/:id', auth.isAuthenticated(),controller.Sharedpeopleupdate);
router.put('/sharedoc/update/:id', controller.update);
router.put('/removedepartsharing/:id',auth.isAuthenticated(), controller.removedepartsharing);
router.put('/updateorgsharingpeople/:id',auth.isAuthenticated(),controller.updateorgsharingpeople)
router.patch('/:id', controller.update);

router.post('/',auth.isAuthenticated(), controller.create);
router.post('/checkallusers', controller.checkallusers);
router.post('/fileid', controller.filedecrypt);
router.post('/fileid1',auth.isAuthenticated(), controller.filedecrypt1);
router.post('/AllSharedpeopleupdate',auth.isAuthenticated(), controller.AllSharedpeopleupdate);
router.post('/multiFolder/ShareDelete',auth.isAuthenticated(), controller.ShareDeleteMulti);
router.post('/Shareto_Department/',auth.isAuthenticated(), controller.Shareto_Department);
router.post('/SharedWith_Departments/',auth.isAuthenticated(), controller.SharedWith_Departments);
router.post('/multisharetodepartment/',auth.isAuthenticated(), controller.multisharetodepartment);
router.post('/getCurVerSharedPeopleList/', controller.CurVerSharedPeopleList);
router.post('/updateCurVerSharedPeopleList/', controller.updateCurVerSharedPeopleList);
router.post('/multishare/',auth.isAuthenticated(), controller.multishare);

router.delete('/:id',auth.isAuthenticated(), controller.destroy);

module.exports = router;

