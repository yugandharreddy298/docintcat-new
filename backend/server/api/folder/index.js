'use strict';

var express = require('express');
var controller = require('./folder.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/trashbin',auth.isAuthenticated(), controller.trashfolders);
router.get('/getallfolders', auth.isAuthenticated(), controller.getallfolders);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/folder/info/:id',  auth.isAuthenticated(),controller.folderInfo);
router.get('/user_folders_files/:id', auth.hasRole('admin'), controller.user_folders_files);
router.get('/adminfolderdetails/:id', auth.hasRole('admin'), controller.adminfolderdetails);
router.get('/getSentDocs/sent',auth.isAuthenticated(), controller.getSentDoc);
router.get('/getnavigationfolder/:id', controller.getnavigationfolder);
router.get('/getparentfolders/:id', controller.getparentfolders);
router.get('/getFoldersAndFiles/:id',auth.isAuthenticated(),controller.getFoldersAndFiles); 

router.get('/isEmptyfolder/:id',auth.isAuthenticated(), controller.isEmptyfolder);
router.put('/deletefolder/:id',auth.isAuthenticated(), controller.deletefolder);
router.put('/removeSentFolder/:id',  auth.isAuthenticated(),controller.removesentfolder);
router.put('/:id', auth.isAuthenticated(), controller.FolderUpdate);
router.put('/move/update/:id', auth.isAuthenticated(), controller.MoveOnupdate);


router.post('/',  auth.isAuthenticated(),controller.create);
router.post('/isFolderIsExist',  auth.isAuthenticated(),controller.isFolderIsExist);
router.post('/restore',  auth.isAuthenticated(),controller.restore);
router.post('/permanentFolderDeletion/', auth.isAuthenticated() ,controller.destroyfolder);
router.post('/searchfiles',auth.isAuthenticated(),controller.searchdeletedfiles);
router.post('/multiFolderDelete',auth.isAuthenticated(),controller.multiFolderDelete);
router.post('/multiselectmove',auth.isAuthenticated(),controller.multiselectmove);
router.post('/multiselect_Permenant_Delete/',auth.isAuthenticated(),controller.multiselect_Permenant_Delete);

router.delete('/filesFolder/delete',auth.isAuthenticated(),controller.deleteAllFolderFile);
router.delete('/:id', auth.isAuthenticated() ,controller.destroy);  


module.exports = router;