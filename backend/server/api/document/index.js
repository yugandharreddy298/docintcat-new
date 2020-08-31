'use strict';

var express = require('express');
var controller = require('./document.controller');
var multiparty = require('connect-multiparty');
var path = require('path');
var multipartyMiddleware = multiparty();
var router = express.Router();
var router = express.Router();
var auth = require('../../auth/auth.service');

router.use(multiparty({ uploadDir: path.dirname('./uploads') + '/uploads' }));

router.post('/passwordcheck', auth.isAuthenticated(), controller.PasswordCheck)
router.post('/searchfiles', auth.isAuthenticated(), controller.searchdeletedfiles)
router.post('/encrypt', controller.encryptauditlogvalue);
router.post('/decrypt', controller.decryptauditlogvalue);
router.post('/', auth.isAuthenticated(), multipartyMiddleware, controller.create);
router.post('/zipuploads', auth.isAuthenticated(), multipartyMiddleware, controller.zipuploads);
router.post('/extractzipfiles', auth.isAuthenticated(), multipartyMiddleware, controller.extractzipfiles)
router.post('/makecopy', auth.isAuthenticated(), controller.makeacopy)
router.post('/multimakecopy', auth.isAuthenticated(), controller.multimakecopy)
router.post('/dragcreate', auth.isAuthenticated(), multipartyMiddleware, controller.dragcreate);
router.post('/url', auth.isAuthenticated(), controller.urldata);
router.post('/googledrive', auth.isAuthenticated(), controller.googledrive);
router.post('/onedrive', auth.isAuthenticated(), controller.onedrive);
router.post('/searchdocuments', auth.isAuthenticated(), controller.searchdocuments);
router.post('/restore', auth.isAuthenticated(), controller.restore);
router.post('/pdfDownload', controller.GeneratePDF);
router.post('/multiFileDelete', auth.isAuthenticated(), controller.multiFileDelete);
router.post('/verifydocument', multipartyMiddleware, controller.verifydocument);
router.post('/editTemplateDoc', auth.isAuthenticated(), multipartyMiddleware, controller.editTemplateDoc);
router.post('/isFilenameExits', auth.isAuthenticated(), controller.isFilenameExits);
router.post('/getFoldersandfiles', auth.isAuthenticated(), controller.getFoldersandfiles);

router.get('/testinggoogle', controller.testingGoogle)
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/getDeleteFiles/:id/', auth.isAuthenticated(), controller.getDeleteFiles)
router.get('/Download/OriginalPDF/:id', auth.isAuthenticated(), controller.DownloadOriginalPDF)
router.get('/check', controller.chekingpdf);
router.get('/trashbin', auth.isAuthenticated(), controller.trashfiles);
router.get('/recentfiles', auth.isAuthenticated(), controller.recentfiles);
router.get('/createimages/:id', auth.isAuthenticated(), controller.createImages)
router.get('/downloadfiles/:id', controller.downloadfiles);
router.get('/getcontent/:fileid', controller.getContent);
router.get('/getfilecontent/:fileid', controller.getContent);
router.get('/publicdoc/:id', controller.getSelectedDocPublic);
router.get('/:id', auth.isAuthenticated(), controller.getSelectedDoc);
router.get('/getDocumentRecord/:id', auth.isAuthenticated(), controller.getDocumentRecord);
router.get('/orginalpdfdownload/:id', controller.DownloadOriginalPDF);
router.get('/getFolderFiles/:id', auth.isAuthenticated(), controller.show);
router.get('/revokeFile/:docId', auth.isAuthenticated(), controller.RevokeFile);
router.get('/checkRevokeFileStatus/:docId', auth.isAuthenticated(), controller.checkRevokeFileStatus);

router.put('/check/:id', auth.isAuthenticated(), controller.update1);
router.put('/:id', controller.update);
router.put('/move/update/:id', controller.MOveOnupdate);
router.put('/removeSentFile/:id', controller.removeSentFile);
router.put('/multiple/remove/sentfiles', auth.isAuthenticated(), controller.RemoveMUltipleSentFiles)
router.put('/deletefile/:id', auth.isAuthenticated(), controller.deletefile);

router.delete('/:id', controller.destroy);


module.exports = router;