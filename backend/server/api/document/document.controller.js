var _ = require('lodash');
var Document = require('./document.model');
var Documentlogs = require('../documentlogs/documentlogs.model');
var Folder = require('../folder/folder.model');
var SharingPeople = require('../sharingpeople/sharingpeople.model')
var fieldOptions = require('../fieldoption/fieldoption.model');
var fieldValues = require('../fieldvalue/fieldvalue.model')
const AWS = require('aws-sdk');
var Docimage = require('../docimage/docimage.model');
var async = require('async');
var moment = require('moment')
var nodemailer = require('nodemailer');
//const selfCert = require('self-cert')
const selfCert = require('./cert_helper')
const HummusRecipe = require('hummus-recipe');
var fs = require('fs');
var http = require('http');
var https = require('https');
var unzip = require('unzip');
var shell = require('shelljs');
const path = require('path');
const os = require('os');
var childprocess = require('child_process')
const pdfjs = require('pdfjs-dist');
const bereich = require('bereich');
var request = require('request')
var AdmZip = require('adm-zip');
var _this = this;
var key = "secretkey";
var crypto = require("crypto")
var config = require('../../config/environment');
var Favorite = require('../favorite/favorite.model')
var socketio=require('socket.io-client')(config.backendurl)
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads')
if (!fs.existsSync('./convertimages')) fs.mkdirSync('./convertimages')
if (!fs.existsSync('./photo')) fs.mkdirSync('./photo')
if (!fs.existsSync('./stamp')) fs.mkdirSync('./stamp')
if (!fs.existsSync('./signature')) fs.mkdirSync('./signature')
// Encrpyt Data from UTF-8 to hex format  
function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}
//  Decrypt Data from UTF-8 to hex format   
function decrypt(key, data) {

    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
/**
 * Encrpyt Data from UTF-8 to hex format  
 * used For Id Encryption
 */
function encrypturl(key, data) {
    var cipher = crypto.createCipher('aes-128-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'base64');
    crypted += cipher.final('base64');
    return crypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, 'cFcFc');
}
/**
 * Decrypt Data from UTF-8 to hex format  
 * used For Id Decryption
 */
function decrypturl(key, data) {
    if (data != undefined) {
        var decode = data.replace('-', '+').replace('_', '/').replace('cFcFc', '=');
        var decipher = crypto.createDecipher('aes-128-cbc', key);
        var decrypted = decipher.update(decode, 'base64', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    } else return false;
}
/**
 * @api {get} /  Get list of documents 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName index
 * @apiGroup document
 * @apiSuccess {array}  Get list of documents  
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function (req, res) {
    Document.find({ $and: [{ uid: req.user._id }, { active: true }] }).sort({ created_at: 'desc' }).exec(function (err, documents) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(documents);
    });
};
/**
 * @api {post} /PasswordCheck  validate whether document is encrypted or not.If encrypted check with password
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName PasswordCheck
 * @apiParam {json}
 * @apiGroup fieldvalue
 * @apiSuccess {array}  validate whether document is encrypted or not.If encrypted check with password 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.PasswordCheck = async function (req, res) {
    console.log("password checking")
    const pdfjs = require('pdfjs-dist');
    if (!req.body.password) {
        var path = __dirname + '/../../../' + req.files.uploads[0].path;
        return await pdfjs.getDocument(path).then(function (pdfdoc) {
            return "no password";
        }).catch(function (error) {
            return "protected";
        })
    } else if (req.body.password) {
        var path = __dirname + '/../../../' + req.body.file.uploads[0].path;
        console.log(req.body.file.uploads[0])
        var Newpath = __dirname + '/../../../uploads/' + Math.floor((Math.random() * 100) + 1) + '.pdf';
        // Shall scripot to decode the password
        if (shell.exec('pdftk ' + path + ' input_pw ' + req.body.password + ' output ' + Newpath).code) res.send({ "Message": "Please check your password", "files": req.body.file })
        else {
            if (fs.existsSync(path)) fs.unlinkSync(path)
            fs.renameSync(Newpath, path);
            if (req.body.file.uploads[0].type == 'application/pdf') {
                var hummus = require('hummus');
                var path = __dirname + '/../../../' + req.body.file.uploads[0].path;
                var pdfReader = await hummus.createReader(path);
                if (pdfReader.isEncrypted()) {
                    var Newpath = __dirname + '/../../../uploads/' + Math.floor((Math.random() * 1000) + 1) + '.pdf';
                    if (shell.exec('pdftk ' + path + ' output ' + Newpath).code) { }
                    if (fs.existsSync(path)) fs.unlinkSync(path)
                    fs.renameSync(Newpath, path);
                }
            }
            var file = {};
            const pdfjs = require('pdfjs-dist');
            const bereich = require('bereich');
            const pdf = await pdfjs.getDocument(__dirname + '/../../../' + req.body.file.uploads[0].path); // PDF Path
            const numPages = pdf.numPages;
            const pageNumbers = Array.from(bereich(1, numPages));
            // Start reading all pages 1...numPages
            const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
            // Wait until all pages have been read
            const pages = await Promise.all(promises);
            var pagesInfo = []
            for (i = 0; i < numPages; i++) {
                console.log(pages[i]._pageInfo.view);
                pagesInfo[i] = pages[i]._pageInfo.view
            }
            file.pagesInfo = pagesInfo
            file.originalFilename = req.body.file.uploads[0].originalFilename;
            file.path = req.body.file.uploads[0].path;
            file.path = file.path.replace("../", "");
            file.path = file.path.replace("backend/", "");
            file.size = req.body.file.uploads[0].size;
            file.type = req.body.file.uploads[0].type;
            file.name = req.body.file.uploads[0].name;
            if (req.body.folderid) file.folderid = req.body.folderid;
            var encryptedid = encrypt(key, String(Date.now()));
            file.encryptedid = encryptedid,
                file.uid = req.user.id;
            file.copycount = 0;
            if (file.type == 'application/pdf') {
                var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                var pdfFile = __dirname + '/../../../' + file.path;
                if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                if (numPages > 100) var c = '-f 1 -l 4';
                else var c = ''
                var sshCommand = 'pdftoppm ' + c + ' ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
                var child1 = childprocess.fork(__dirname + '/childprocess')
                child1.on('message', async function (msg) {
                    var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
                        file.path = p;
                        Document.create(file, function (err, document) {
                            if (err) { return handleError(res, err); }
                            if (!document) { return res.status(404).send('Not Found'); }
                            fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                //handling error
                                if (err) {
                                    return console.log('Unable to scan directory: ' + err);
                                }
                                //listing all files using forEach
                                await createDocImages(files, document, encryptedid)
                                if (document && document.pagesInfo.length > 100) {
                                    req.params.id = document._id
                                    _this.createImages(req)
                                }
                            });
                            return res.status(201).json(document);
                        });
                    });
                    child1.kill()
                })
                child1.on('close', (code) => {
                    console.log(`child process close all stdio with code ${code}`);
                });
                child1.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                });
                child1.send({ sshCommand: sshCommand, filepath: pdfFile })
            }
        }
    }
}
/**
 * @api {get} /Download/OriginalPDF/:id  To download original file
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName DownloadOriginalPDF
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json}  path of document 
 * @apiError 500-InternalServerError SERVER error.
 */
exports.DownloadOriginalPDF = function (req, res) {
    const { PDFDocumentFactory, PDFDocumentWriter } = require('pdf-lib');
    Document.findById({ _id: req.params.id }).exec(function (err, document) {
        const loadPdf = fs.readFileSync(__dirname + '/../../../' + document.path);
        const pdfDoc = PDFDocumentFactory.load(loadPdf);
        const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
        const filePath = __dirname + '/../../../uploads/' + document.encryptedid + '.pdf';
        fs.writeFileSync(filePath, pdfBytes);
        res.send({ path: document.encryptedid + '.pdf' });
    })
}
/**
 * @api {get} /trashbin  Get a deleted files and folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName trashfiles
 * @apiGroup document
 * @apiSuccess {array}  Get a deleted files and folders
 * @apiError 500-InternalServerError SERVER error.
 */
exports.trashfiles = function (req, res) {
    Folder.find({ $and: [{ userid: req.user._id }, { active: false }] }).sort({ created_at: 'desc' }).exec(function (err, folders) {
        Document.find({ $and: [{ uid: req.user._id }, { active: false }] }).sort({ created_at: 'desc' }).exec(function (err, documents) {
            if (err) { return handleError(res, err); } else {
                var documents = JSON.parse(JSON.stringify(documents));
                documents.forEach(element => {
                    element.show = true;
                    if (element.folderid) {
                        if (folders.some(x => x._id == element.folderid)) element.show = false;
                    }
                    if (documents.length - 1 == documents.indexOf(element)) documents = documents.filter(x => x.show);
                })
                return res.status(200).json(documents);
            }
        });
    });
};
/**
 * @api {get} /getDocumentRecord/:id  Get a single document record 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName getDocumentRecord
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json} Get a single document record 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.getDocumentRecord = function (req, res) {
    Document.findById(req.params.id).exec(function (err, document) {
        if (err) { return handleError(res, err); }
        if (!document) { return res.status(404).send('Not Found'); }
        return res.json(document);
    });
};
/**
 * @api {get} /getFolderFiles/:id  Get all documents for specific user 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName show
 * @apiParam {String} userid
 * @apiGroup document
 * @apiSuccess {array}  Get all documents for specific user 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.show = function (req, res) {
    Document.find({ $or: [{ uid: req.params.id }, { folderid: req.params.id }] }).sort({ created_at: 'desc' }).exec(function (err, document) {
        if (err) {
            console.log(err)
            return handleError(res, err);
        }
        if (!document) { return res.status(404).send('Not Found'); }
        return res.json(document);
    });
};
/**
 * @api {get} /getDeleteFiles/:id/ remove document from document collection,docimages collection and from S3 server 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getDeleteFiles
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {String}  
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getDeleteFiles = function (req, res) {
    Document.find({ _id: req.params.id }).sort({ created_at: 'desc' }).exec(function (err, document) {
        if (err) { return handleError(res, err); }
        if (!document) { return res.status(404).send('Not Found'); }
        async.each(document, function (element, callback) {
            removeS3folder('convertimages/' + element.encryptedid + '/', function (resp) { console.log(resp) })
            Docimage.remove({ $and: [{ documentid: element._id }, { active: true }] }).exec(function (err) { console.log(err) });
            element.remove(function (err) {
                callback();
            });
        }, function (err) {
            return res.status(201).json({ messsage: 'success' });
        })
    });
};
/**
 * @api {get} /publicdoc/:id or /:id  get Selected document record 
 * @apiName getSelectedDoc
 * @apiParam {String}
 * @apiGroup document
 * @apiSuccess {json}  get Selected document record 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.getSelectedDoc = function (req, res) {
    Document.findOne({ _id: req.params.id ,uid:req.user.id}).exec(function (err, document) {
        console.log(document,req.user.id,"{{{{{{{{{{{{{{")
        if (err) {
            return handleError(res, err);
        }
        if (!document) { return res.status(404).send('Not Found'); }
        return res.json(document);
    });
};
/**
 * @api {get} /publicdoc/:id or /:id  get Selected document record 
 * @apiName getSelectedDocPublic
 * @apiParam {String}
 * @apiGroup document
 * @apiSuccess {json}  get Selected document record 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.getSelectedDocPublic = function (req, res) {
    Document.findById({ _id: req.params.id }).exec(function (err, document) {
        if (err) {
            return handleError(res, err);
        }
        if (!document) { return res.status(404).send('Not Found'); }
        return res.json(document);
    });
};
/**
 * @api {post} /dragcreate  create a document for draganddrop file 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName dragcreate
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  created document 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.dragcreate = async function (req, res) {
    var file = {};
    if (req.files.uploads.type == 'application/pdf') {
        var hummus = require('hummus');
        var path = __dirname + '/../../../' + req.files.uploads.path;
        var pdfReader = await hummus.createReader(path);
        if (pdfReader.isEncrypted()) {
            var Newpath = __dirname + '/../../../uploads/' + Math.floor((Math.random() * 100) + 1) + '.pdf';
            if (shell.exec('pdftk ' + path + ' output ' + Newpath).code) { }

            if (fs.existsSync(path)) fs.unlinkSync(path)
            fs.renameSync(Newpath, path);
        }
    }
    //FOR PAGE INFO
    const pdfjs = require('pdfjs-dist');
    const bereich = require('bereich');
    const pdf = await pdfjs.getDocument(__dirname + '/../../../' + req.files.uploads.path); // PDF Path
    const numPages = pdf.numPages;
    const pageNumbers = Array.from(bereich(1, numPages));
    // Start reading all pages 1...numPages
    const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
    // Wait until all pages have been read
    const pages = await Promise.all(promises);
    var pagesInfo = []
    for (i = 0; i < numPages; i++) {
        console.log(pages[i]._pageInfo.view);
        pagesInfo[i] = pages[i]._pageInfo.view
    }
    file.pagesInfo = pagesInfo
    file.originalFilename = req.files.uploads.originalFilename;
    file.path = req.files.uploads.path;
    file.path = file.path.replace("../", "");
    file.path = file.path.replace("backend/", "");
    file.size = req.files.uploads.size;
    file.type = req.files.uploads.type;
    file.name = req.files.uploads.name;
    if (req.body.folderid) file.folderid = req.body.folderid;
    var encryptedid = encrypt(key, String(Date.now()));
    file.encryptedid = encryptedid,
        file.uid = req.user.id;
    if (file.type == 'application/pdf') {
        var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
        var pdfFile = __dirname + '/../../../' + file.path;
        if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
        if (shell.exec('pdftoppm ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png').code) { }
    }
    var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
        file.path = p;
        Document.create(file, function (err, document) {
            if (err) { return handleError(res, err); }
            if (!document) { return res.status(404).send('Not Found'); }
            fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                //listing all files using forEach
                await createDocImages(files, document, encryptedid)
                if (document && document.pagesInfo.length > 100) {
                    req.params.id = document._id
                    _this.createImages(req)
                }
            });
            return res.status(201).json(document);
        });
    });
};
/**
 * @api {get} /recentfiles  Get latest 6 records from document collection 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName recentfiles
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {array}  Get latest 6 records from document collection
 * @apiError 500-InternalServerError SERVER error.
 */
exports.recentfiles = function (req, res) {
    Document.find({ $and: [{ uid: req.user._id }, { active: true }] }).sort({ updatedAt: 'desc' }).limit(6).exec(function (err, document) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(document);
    });
}
/**
 * @api {post} /searchfiles  get deleted files based on where condition (NOT USED) 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName searchdeletedfiles
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {array}  get deleted files  
 * @apiError 500-InternalServerError SERVER error.
 */
exports.searchdeletedfiles = function (req, res) {
    Document.find({ $and: [req.body.where, { $and: [{ uid: req.user._id }, { active: false }] }] }).populate('uid').exec(function (err, document) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(document);
    });
};



/**
 * @api {post} /isFilenameExits to check Whether file name already exits
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName isFilenameExits
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {boolean}  true or false
 * @apiError 500-InternalServerError SERVER error.
 */
exports.isFilenameExits = function (req, res) {
    if(!req.body.folderid)req.body.folderid=undefined;
    var files=req.body.files;
    var folders=req.body.folders;
    var filePresent=false;
          if(folders && folders.length)
          {
            Folder.find({ $and: [{ userid: req.user._id }, { active: true },{parentid:req.body.folderid}] } ).exec(function (err, folder) {
                if (err) { return handleError(res, err); }
                while(folders.length!=0  && !filePresent)   
                {
                 if(folder.some(x=>String(x.name).toLowerCase()==String(folders[0].name).toLowerCase()))
                 {
                    filePresent=true;
                 }
                 folders.shift();
                }
                return res.status(200).json(filePresent);

            })
          }
           
       else{
        Document.find({ $and: [{ uid: req.user._id }, { active: true },{folderid:req.body.folderid}] } ).exec(function (err, document) {
            if (err) { return handleError(res, err); }
        while(files.length!=0 && !filePresent)   
        {
         if(document.some(x=>String(x.name).split('.')[0]==String(files[0].name).split('.')[0]))
         {
            filePresent=true;
         }
         files.shift();
        }
          return res.status(200).json(filePresent);
    })
}
};

/**
 * @api {post} /getFoldersandfiles to get folders and files
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName isFilenameExits
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {boolean}  true or false
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getFoldersandfiles = async function (req, res) {
    if(req.body.type=='folderfiles') {
        var folders = await getFolders(req.body,req.user)
        var files = await getFiles(req.body,req.user)
        if(files && folders) {
            return res.status(200).json(folders.concat(files))
        }
    }
    else if(req.body.type=='files') {
        var files = await getFiles(req.body,req.user)
        if(files) {
            return res.status(200).json(files)
        }
    }
    else if(req.body.type=='folders') {
        var folders = await getFolders(req.body,req.user)
        if(folders) {
            return res.status(200).json(folders)
        }
    }
};
getFolders =  function (body,user) {
    return new Promise((resolve, reject) => {
        var params 
        if(body.isSent) params = [{ userid: user._id }, { active: true },{parentid:body.parentid},{isSent: body.isSent}]
        else params = [{ userid: user._id }, { active: true },{parentid:body.parentid}]
        Folder.find({ $and: params }).sort({ updatedAt: 'desc' }).skip(body.start).limit(body.end-body.start).exec(function (err, folders) {
        if (err) { reject(res, err); }
        else {
            folders.forEach(element => {
                element.encryptedId = encrypt(key, element._id.toString());
                if (element.parentid) {
                    element.parentencryptedId = encrypt(key, element.parentid.toString());
                }
            })
            resolve(folders);
        }
        });
    })
}
getFiles =  function (body,user) {
    return new Promise((resolve, reject) => {
        var params 
        if(body.isSent) params = [{ uid: user._id }, { active: true },{folderid:body.folderid},{isSent: body.isSent}]
        else params = [{ uid: user._id }, { active: true },{folderid:body.folderid}]
        Document.find({ $and: params }).sort({ updated_at: 'desc' }).skip(body.start).limit(body.end-body.start).exec(function (err, documents) {
            if (err) { reject(res, err); }
            resolve(documents);
        });
    })
}
// Export PDF file to dirve
function ExportToDrive(token, path, callback) {
    var request = require('request')
    var file = __dirname + '/../../../uploads/' + path;
    if (!fs.existsSync(file)) { console.log('File not exist...') }
    // var stats = fs.statSync(file)
    // var fileSizeInBytes = stats["size"]
    fs.readFile(file, function read(e, f) {
        console.log('token', token)
        if (e) { return; } else request({
            method: 'POST',
            preambleCRLF: true,
            postambleCRLF: true,
            uri: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            headers: {
                'Authorization': 'Bearer ' + token.access_token,
            },
            multipart: [{
                'content-type': 'application/json',
                body: JSON.stringify({ "name": token.name })
            },
            { body: f }
            ],
        },
            function (error, response, body) {
                if (error) {
                    return console.error('upload failed:', error);
                }
                callback(path)
            })

    });
}
// generate log with pdf
function genrateLogPDf(document, DocInfo, pdfFile, fieldvalues, CallBacks) {
    var pdf = require('html-pdf');
    var htmlName = Math.round((new Date()).getTime() / 1000) + '.html';
    var PDfName = Math.round((new Date()).getTime() / 1000) + '.pdf';
    var OutPDfName = Math.round((new Date()).getTime() / 100) + '.pdf';
    var encryptPDfName = Math.round((new Date()).getTime() / 10000) + '.pdf';
    if (!document.withlog) {
        if (document.downloadType == 'drive') {
            if (document.pdfPin && document.pdfPin.length > 0) {
                attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + pdfFile, DocInfo, document, function (respath) {
                    ExportToDrive(document, path.basename(respath), function (res) {
                        CallBacks(path.basename(respath))
                    });
                })
            } else {
                attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + pdfFile, DocInfo, document, function (respath) {
                    ExportToDrive(document, path.basename(respath), function (res) {
                        CallBacks(path.basename(respath))
                    });
                })
            }
        } else if (document.downloadType != 'drive' && document.pdfPin && document.pdfPin.length > 0) {
            attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + pdfFile, DocInfo, document, function (respath) {
                CallBacks(path.basename(respath));
            })
        } else {
            if (document.createCompDocImg || document.sharethisdocument)
                CallBacks(pdfFile)
            else
                attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + pdfFile, DocInfo, document, function (respath) {
                    CallBacks(path.basename(respath));
                })
        }
    } else {
        var i = Math.floor(Math.log(DocInfo.size) / Math.log(1024));
        DocInfo.size = (DocInfo.size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        var html = '<html><bodystyle="overflow-x: visible !important;"><div style="width:100%;"><div style="width:100%;padding:30px;"><h3 style="font-family:orkney;font-size:18px;">Audit Log of ' + DocInfo.name + '</h3><hr style="background-color:#F2F2F2;border: 1px solid #f2f2f2;">' +
            '<div style="width:90%;border:1px solid #EBEBEB;border-radius:10px;padding:10px;margin-top:30px;">'
        SharingPeople.find({ $and: [{ fileid: DocInfo.id }, { active: true }] }).populate('toid').populate('fromid').exec(function (err, sharingpeoples) {
            Documentlogs.find({ documentid: document.id }).populate('toid').populate('uid').sort({ "_id": +1 }).exec(function (err, documentlogs) {
                if (sharingpeoples.length) {
                    sharingpeoples.forEach(async function (people) {
                        people.status = fieldvalues.some(x => people.toemail == x.insertedemail) ? 'Submited' : 'Waiting';
                    })
                    if (DocInfo.uid && DocInfo.uid.name) var name = DocInfo.uid.name
                    if (DocInfo.uid && DocInfo.uid.companyname) var name = DocInfo.uid.companyname
                    var docStatus = sharingpeoples.filter(x => x.status == 'Submited').length;
                    if (docStatus > 0) DocInfo.status = sharingpeoples.filter(x => x.status == 'Submited').length == sharingpeoples.length ? 'Completed' : (sharingpeoples.filter(x => x.status == 'Submited').length < sharingpeoples.length && sharingpeoples.filter(x => x.status == 'Submited').length > 0) ? 'In Progress' : 'Waiting';
                    if (DocInfo.status && DocInfo.status == 'Completed') {
                        html += '<h3 style="color:#000;font-weight:600;font-size:15px;">This Document has <span style="color:#06B31D;">' + DocInfo.status + '</span> all the Signatures</h3>'
                    }
                    if (DocInfo.status && DocInfo.status == 'In Progress') {
                        html += '<h3 style="color:#000;font-weight:600;font-size:15px;">This Document has <span style="color:#06B31D;">' + DocInfo.status + '</span> all the Signatures</h3>'
                    }
                    if (DocInfo.status && (DocInfo.status == 'Waiting' || DocInfo.status == 'Waiting for Sign')) {
                        html += '<h3 style="color:#000;font-weight:600;font-size:15px;">This Document has <span style="color:#06B31D;">' + DocInfo.status + '</span> all the Signatures</h3>'
                    }
                    html += '<table style="width:100%;">'
                    html += '<tr >' +
                        '<td style="width:30%;color:#656363;font-size:10px;">File Owner' +
                        '</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:' +
                        '</td>' +
                        '<td style="width:65%;color:#656363;font-size:10px;padding-bottom: 7px;">' + name + '(' + DocInfo.uid.email + ')' +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:30%;color:#656363;font-size:10px;">Shared With' +
                        '</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:</td>' +
                        '<td style="width:65%;color:#656363;font-size:10px;margin-top: 10px;">'
                    sharingpeoples.forEach(async function (data) {
                        console.log(data.toemail, "testtttt")
                        html += '<span>' + data.toemail + '</span></br>'
                    });
                    html += '</td>' +
                        '</tr>' +
                        '<tr>' +
                        ' <td style="width:50%;color:#656363;font-size:10px;"> Documents Uploaded' +
                        '</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:' +
                        '</td>' +
                        '<td style="width:45%;color:#656363;font-size:10px;">' + moment(DocInfo.created_at).utcOffset(330).format('lll') + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:30%;color:#656363;font-size:10px;">No.of.Pages' +
                        '</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:</td>' +
                        '<td style="width:65%;color:#656363;font-size:10px;">' + DocInfo.pagesInfo.length + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:30%;color:#656363;font-size:10px;">File Size</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:</td>' +
                        '<td style="width:65%;color:#656363;font-size:10px;">' + DocInfo.size + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '</div>'
                    if (sharingpeoples.some(x => x.view)) html += '<h3 style="clor:#000;font-weight:600;background-color:#ddd;padding-left:15px;padding-top:5px;padding-bottom:5px;border-radius:3px;width:90%;">Reviewers</h3>'
                    sharingpeoples.forEach(async function (data) {
                        if (data.view || data.reviewed) {
                            var IP = documentlogs.find(log => log.message == "Reviewed" && log.toemail == data.toemail) ? documentlogs.find(log => log.message == "Reviewed" && log.toemail == data.toemail).IpAddress : '';
                            html += '<div style="width:90%;border-radius:10px;padding: 0px 10px 10px 10px;background-color:#f8f8f8;margin-top:25px;">' +
                                '<div style=" page-break-inside:avoid">' +
                                '<div style="width:5%;float:left;"><p style="width:30px;height:30px;background-color:#DECC2B;color:#fff;font-weight:600;font-size:15px;text-align:center;line-height:1.9;border-radius:100%;vertical-align:middle;">' + data.toemail.charAt(0) + '</p></div>' +
                                '<div style="width:70%;padding-left:0;margin-top:25px;padding-top:10px;"><h2 style="font-size:10px;color:#000;margin-left:35px;">' + data.toemail + '</h2></div>' +
                                '</div>' +
                                '<div>' +
                                '<div style="font-size: 8px;font-weight: 600;white-space:nowrap;width: 20%;float:left;"><img src="https://i.stack.imgur.com/bGgyE.png" style="vertical-align:middle;width:10px;">Verified Email</div>' +
                                '<div style="font-size: 8px;font-weight: 600;white-space:nowrap;width: 24%;float:left;"><img src="https://i.stack.imgur.com/bGgyE.png" style="vertical-align:middle;width:10px;">Verified Consent to Esign</div>'
                            if (IP) {
                                html += '<div style="font-size: 10px;font-weight: 600;white-space:nowrap;width: 56%;"><img src="https://i.stack.imgur.com/bGgyE.png"  style="vertical-align:middle;width:10px;"><span style="vertical-align:middle;font-size:8px">Verified IP Address&nbsp;&nbsp;:&nbsp;&nbsp;' + IP + '</span></div>'
                                //  '<td style="font-size: 10px;font-weight: 600;white-space:nowrap;text-align:left;"></td>'
                            }
                            html += '</div><table style="width:100%;border-collapse: collapse;">' +
                                '<tbody>'
                            if (!data.reviewed) {
                                html += '<tr>' + '<td colspan="6" style="text-align:center;padding: .75rem;vertical-align:top;white-space:nowrap;display:table-cell;font-size:10px;background-color: white;">Not Reviewed</td>' +
                                    '</tr>' + '</tbody>' +
                                    '</table>' +
                                    '</div>'
                            }
                            if (data.reviewed) {
                                html += '<tr>' + '<td colspan="6" style="text-align:center;padding: .75rem;vertical-align:top;white-space:nowrap;display:table-cell;font-size:10px;background-color: white;">Reviewed successfully</td>' +
                                    '</tr>' + '</tbody>' +
                                    '</table>' +
                                    '</div>'
                            }
                        }
                    });
                    if (sharingpeoples.some(x => x.signed || !x.view)) html += '<h3 style="clor:#000;font-weight:600;background-color:#ddd;padding-left:15px;padding-top:5px;padding-bottom:5px;border-radius:3px;width:90%;">Signers</h3>'
                    let count = 0;
                    sharingpeoples.forEach(async function (data) {
                        if (data.signed || !data.view) {
                            var check = fieldvalues.some(x => data.toemail == x.insertedemail || data.toemail == x.people);
                            var SubmittedBoolean = fieldvalues.some(x => data.toemail == x.insertedemail);
                            if (SubmittedBoolean) var IP = documentlogs.find(log => log.message == 'Submitted' && log.toemail == data.toemail) ? documentlogs.find(log => log.message == 'Submitted' && log.toemail == data.toemail).IpAddress : '';
                            html += '<div style="width:90%;border-radius:10px;padding: 0px 10px 10px 10px;background-color:#f8f8f8;margin-top:25px;">' +
                                '<div style=" page-break-inside:avoid">' +
                                '<div style="width:5%;float:left;"><p style="width:30px;height:30px;background-color:#DECC2B;color:#fff;font-weight:600;font-size:15px;text-align:center;line-height:1.9;border-radius:100%;vertical-align:middle;">' + data.toemail.charAt(0) + '</p></div>' +
                                '<div style="width:70%;padding-left:0;margin-top:25px;padding-top:10px;"><h2 style="font-size:10px;color:#000;margin-left:35px;">' + data.toemail + '</h2></div>' +
                                '</div>' +
                                '<div>' +
                                '<div style="font-size: 8px;font-weight: 600;white-space:nowrap;width: 20%;float:left;"><img src="https://i.stack.imgur.com/bGgyE.png" style="vertical-align:middle;width:10px;">Verified Email</div>' +
                                '<div style="font-size: 8px;font-weight: 600;white-space:nowrap;width: 24%;float:left;"><img src="https://i.stack.imgur.com/bGgyE.png" style="vertical-align:middle;width:10px;">Verified Consent to Esign</div>'
                            if (SubmittedBoolean && IP) {
                                html += '<div style="font-size: 10px;font-weight: 600;white-space:nowrap;width: 56%;"><img src="https://i.stack.imgur.com/bGgyE.png"  style="vertical-align:middle;width:10px;"><span style="vertical-align:middle;font-size:8px">Verified IP Address&nbsp;&nbsp;:&nbsp;&nbsp;' + IP + '</span></div>'
                            }
                            html += '</div><table style="width:100%;border-collapse: collapse;">' +
                                '<thead style="background-color: #ddd; page-break-inside:avoid">' +
                                '<tr>' +
                                '<th style="padding:10px;font-size:10px;">Value</th>' +
                                '<th style="padding:10px;font-size:10px;">Type</th>' +
                                '<th style="padding:10px;font-size:10px;">Page</th>' +
                                '<th style="padding:10px;font-size:10px;">Required</th>' +
                                '<th style="padding:10px;font-size:10px;">Location</th>' +
                                '<th style="padding:10px;font-size:10px;">Date</th>' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody>'
                            if (check) {
                                fieldvalues.forEach(async function (log) {
                                        if ((data.toemail == log.insertedemail || data.toemail == log.people) && log.type != 'label' && log.ownerField==false) {
                                            var id;
                                            if (log.type == 'signature' || log.type == 'initial') id = log.signatureId;
                                            else if (log.type == 'Stamp') id = log.stampId;
                                            else if (log.type == 'Photo') id = log.photoId;
                                            html += '<tr style="background-color:#fff;border-bottom:2px solid #dddddd;">' 
                                            if((log.type=="initial"|| log.type=="signature" || log.type=="Photo" || log.type=="Stamp")){
                                                html +='<td style="white-space: nowrap;padding:15px;">'
                                            if (((log.type == 'Stamp' || log.type == 'Photo') && log.path) || ((log.type == 'signature' || log.type == 'initial') && log.signatureType)) {
                                                html += '<div style = "page-break-inside:avoid;"><div style="position: absolute;height:55px;width: 1%;border-left: 2px solid #3799de; border-top: 2px solid #3799de;border-bottom: 2px solid #3799de;border-radius: 10px 0px 0px 10px;margin: 2px 0px 0px 0px;">' +
                                                    '</div>'
                                            }
                                            html += '<div>'
                                            if (((log.type == 'signature' || log.type == 'initial') && log.signatureType)) {
                                                html += '<div style="font-size: 8px;padding-left: 15px;margin-top: -9px;">' +
                                                    'Signed By</div>'
                                            }
                                            if (((log.type == 'Stamp' || log.type == 'Photo') && log.path)) {
                                                html += '<div style="font-size: 8px;padding-left: 15px;margin-top: -9px;">' +
                                                    'Submitted By</div>'
                                            }
                                            if ((log.type == 'signature' || log.type == 'initial') && log.signatureType == 'signaturepad' && log.signaturebaseData) {
                                                html += '<img  src="' + log.signaturebaseData + '"  style="width:70px;object-fit:contain;max-width:fit-content;max-height:40px;margin-top:10px;padding-left:15px;">'
                                            }
                                            if ((log.type == 'signature' || log.type == 'initial') && log.signatureType == 'font' && (log.fontText || log.fontStyle)) {
                                                console.log(log, "fontttttt")
                                                html += '<span style="color:black;word-break: break-all;padding-left: 10px;font-size:13px;font-family:' + log.fontStyle + '">' + log.fontText + '</span>'
                                            }
                                            if ((log.type == 'Stamp' || log.type == 'Photo' || ((log.type == 'signature' || log.type == 'initial') && log.signatureType != 'signaturepad')) && log.path) {
                                                html += '<img  src="' + log.path + '" style="width:40px;padding-left:15px;object-fit:contain;max-width:fit-content;max-height:40px;margin-top:10px;">'
                                            }
                                            if (((log.type == 'Stamp' || log.type == 'Photo') && log.path) || ((log.type == 'signature' || log.type == 'initial') && log.signatureType)) {
                                                var type = encrypturl(key, log.type)
                                                var fileid = encrypturl(key, String(id))
                                                var docid = encrypturl(key, DocInfo.id)
                                                if (DocInfo.uid) {
                                                    if (DocInfo.uid.type == 'individual')
                                                        html += '<div style="font-size:8px;padding-left:15px;">' +
                                                            '<div style="color:#3799de;font-weight:600;text-overflow: ellipsis;width: 57px;overflow: hidden; white-space: nowrap;cursor: pointer;font-weight: bold;color: #3799de;margin-top: 15px;"><a target="_blank" rel="noopener noreferrer"  href="' + config.frontendUrl + '/individual/transaction-verify/' + type + '/' + fileid + '/' + docid + '">' + log.id + '</a></div></div>'
                                                    else if (DocInfo.uid.type == 'organisation' || DocInfo.uid.type == 'employee')
                                                        html += '<div style="font-size:8px;padding-left:15px;">' +
                                                            '<div style="color:#3799de;font-weight:600;text-overflow: ellipsis;width: 57px;overflow: hidden; white-space: nowrap;cursor: pointer;font-weight: bold;color: #3799de;margin-top: 15px;"><a target="_blank" rel="noopener noreferrer"  href="' + config.frontendUrl + '/organization/transaction-verify/' + type + '/' + fileid + '/' + docid + '">' + log.id + '</a></div></div>'
                                                } else
                                                    html += '<div style="font-size:8px;padding-left:15px;">' +
                                                        '<div style="color:#3799de;font-weight:600;text-overflow: ellipsis;width: 57px;overflow: hidden; white-space: nowrap;cursor: pointer;font-weight: bold;color: #3799de;margin-top: 15px;"><a target="_blank" rel="noopener noreferrer"  href="' + config.frontendUrl + '/user/transaction-verify/' + type + '/' + fileid + '/' + docid + '">' + log.id + '</a></div></div>'
                                            }
                                            html += '</div></div>' +
                                                '</td>' 
                                        }else if(log.value!=undefined && log.value!=''){
                                            html +='<td  style="white-space: nowrap;text-align:left;padding:15px;font-size:8px;">' + log.value + '</td>'

                                        }
                                        html +='<td  style="white-space: nowrap;text-align:center;padding:15px;font-size:8px;">' + log.type + '</td>'+
                                             '<td  style="white-space: nowrap;text-align:center;padding:15px;font-size:8px;">' + log.pageNo + '</td>'
                                            if (log.restrict == "required") {
                                                html += '<td  style="white-space: nowrap;text-align:center;padding:15px;font-size:8px;">Yes</td>'
                                            } else {
                                                html += '<td  style="white-space: nowrap;text-align:center;padding:15px;font-size:8px;">No</td>'
                                            }
                                            if (log.value || id) {
                                                if (log.latitude && log.longitude)
                                                    html += '<td  style="white-space: nowrap;text-align:center;padding:15px;font-size:8px;"><a href="http://maps.google.com/?q=' + log.latitude + ',' + log.longitude + '" target="_blank" style="color:#379ade;">Location</a></td>'
                                                else
                                                    html += '<td  style="white-space: nowrap;text-align:center;padding:15px;font-size:10px;">Not Available</td>'
                                                html += '<td  style="white-space: nowrap;text-align:center;padding:15px;font-size:8px;">' + moment(log.created_at).utcOffset(330).format('MMM DD, YYYY h:mm a') + '</td>' + '</tr>'
                                            } else {
                                                html += '<td style="text-align:center;padding: .75rem;vertical-align:top;white-space:nowrap;display:table-cell;width:25%;">' + '</td>' +
                                                    '<td style="text-align:center;padding: .75rem;vertical-align:top;white-space:nowrap;display:table-cell;width:25%;">' +
                                                    '<span></span>' + '</td>' + '</tr>'
                                            }
                                        } 
                                });
                                html += '</tbody>' +
                                    '</table>' +
                                    '</div>'
                            } else {
                                html += '<tr>' + '<td colspan="6" style="text-align:center;padding: .75rem;vertical-align:top;white-space:nowrap;display:table-cell;font-size:12px;background-color: white;">No Fields Submitted</td>' +
                                    '</tr>' + '</tbody>' +
                                    '</table>' +
                                    '</div>'
                            }
                        }
                    });
                }
                if (sharingpeoples && sharingpeoples.length == 0) {
                    if (DocInfo.uid && DocInfo.uid.name) var name = DocInfo.uid.name
                    if (DocInfo.uid && DocInfo.uid.companyname) var name = DocInfo.uid.companyname
                    html += '<table style="width:100%;">'
                    html += '<tr >' +
                        '<td style="width:30%;color:#656363;font-size:10px;">File Owner' +
                        '</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:' +
                        '</td>' +
                        '<td style="width:65%;color:#656363;font-size:10px;padding-bottom: 7px;">' + name + '(' + DocInfo.uid.email + ')' +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        ' <td style="width:50%;color:#656363;font-size:10px;"> Documents Uploaded' +
                        '</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:' +
                        '</td>' +
                        '<td style="width:45%;color:#656363;font-size:10px;">' + moment(DocInfo.created_at).utcOffset(330).format('lll') + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:30%;color:#656363;font-size:10px;">No.of.Pages' +
                        '</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:</td>' +
                        '<td style="width:65%;color:#656363;font-size:10px;">' + DocInfo.pagesInfo.length + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td style="width:30%;color:#656363;font-size:10px;">File Size</td>' +
                        '<td style="width:5%;font-weight:600;color:#656363;">:</td>' +
                        '<td style="width:65%;color:#656363;font-size:10px;">' + DocInfo.size + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '</div>'
                }
                html += '<h3 style="clor:#000;font-weight:600;background-color:#ddd;border-radius:5px;width:90%;padding-left:10px;padding-top:5px;padding-bottom:5px;">Activity Log</h3>'
                if (err) { CallBacks(); }
                if (!documentlogs) { CallBacks(); } else {
                    html += '<div style="width:91%;">' +
                        '<table style="width:100%;border-collapse: collapse;">' +
                        '<thead style="background-color: #ddd;">' +
                        '<tr>' +
                        '<th style="padding:10px;font-size:10px;text-align:left;">Activity</th>' +
                        '<th style="padding:10px;font-size:10px;text-align:left;">Email</th>' +
                        '<th style="padding:10px;font-size:10px;text-align:left;">Location</th>' +
                        '<th style="padding:10px;font-size:10px;text-align:left;">Date</th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody>'
                    async.eachSeries(documentlogs, function iteratee(log, callback) {
                        var email = ' - ';
                        if (log.uid && log.uid.email && log.message != 'Shared') email = log.uid.email
                        if (!log.uid && log.email && log.message != 'Shared') email = log.email
                        if (log.message == 'Shared' && log.toid) email = log.toid.email
                        html += '<tr style="background-color:#e6e4e48a;border-bottom:2px solid #dddddd;">'
                        if (log.message == 'Submited' || log.message == 'Shared' || log.message == 'Photo' || log.message == 'Initial' || log.message == 'initial' || log.message == 'signature' || log.message == 'Signature' || log.message == 'Stamp' || log.message == 'Viewed') {
                            if (log.message == 'Photo' || log.message == 'Initial' || log.message == 'initial' || log.message == 'signature' || log.message == 'Signature' || log.message == 'Stamp') {
                                html += '<td style="text-align:left;padding:8px;font-size:8px;">' + log.message + 'Submitted   BY</td>'
                            }
                            if (log.message == 'Submited') {
                                html += '<td style="text-align:left;padding:10px;font-size:8px;">Document ' + log.message + ' By</td>'

                            }
                            if (log.message != 'Submited' && log.message != 'Photo' && log.message != 'Initial' && log.message != 'Signature' && log.message != 'Stamp' && log.message != 'initial' && log.message != 'signature' && (log.message == 'Shared') && (log.message != 'Viewed')) {
                                html += '<td style="text-align:left;padding:10px;font-size:8px;">Document ' + log.message + ' To</td>'

                            }
                            if (log.message != 'Submited' && log.message != 'Photo' && log.message != 'Initial' && log.message != 'Signature' && log.message != 'Stamp' && log.message != 'initial' && log.message != 'signature' && (log.message != 'Shared') && (log.message == 'Viewed')) {
                                html += '<td style="text-align:left;padding:10px;font-size:8px;">Document ' + log.message + 'By</td>'
                            }
                            html += '<td style="text-align:left;padding:10px;font-size:8px;">' + email + '</td>'
                            if (log.latitude && log.longitude) {
                                html += '<td style="text-align:left;padding:10px;font-size:8px;"><a href="http://maps.google.com/?q=' + log.latitude + ',' + log.longitude + '" target="_blank" style="color:#379ade;">Location</a></td>'
                            } else {
                                html += '<td style="text-align:left;padding:10px;font-size:8px;">Not Available</td>'
                            }
                            html += '<td style="text-align:left;padding:10px;font-size:8px;white-space:nowrap;"><span>' + moment(log.created_at).utcOffset(330).format('MMM DD, YYYY h:mm a') + '</span>' +
                                '</td>'
                        }
                        html += '</tr>'
                        callback();
                    }, function () {
                        if (!documentlogs.length) {
                            html += '<tr style="display: table-row;vertical-align: inherit;border-color: inherit;white-space: nowrap;">' +
                                '<td colspan=4 style="text-align:center;padding: .75rem;vertical-align: top;display:table-cell;font-size:10px;">No Data Avaliable</td></tr>'
                        }
                        html += '</tbody></table></div></div></div></body></html>';
                        fs.writeFile(__dirname + '/../../../uploads/' + htmlName, html, function (err) {
                            if (err) return console.log(err);
                            console.log('File writing done');
                            console.log(html);

                            var htmlFile = fs.readFileSync(__dirname + '/../../../uploads/' + htmlName, 'utf8');
                            var options = { orientation: 'portrait', header: { "height": "10mm" }, footer: { "height": "10mm" }, border: { "top": "1px", "right": "1px", "left": "1px" }, type: 'pdf', width: DocInfo.pagesInfo[0][2] - DocInfo.pagesInfo[0][0] + 'px', height: DocInfo.pagesInfo[0][3] - DocInfo.pagesInfo[0][1] + 'px' };

                            pdf.create(htmlFile, options).toFile(__dirname + '/../../../uploads/' + PDfName, function (err, res) {
                                console.log(res)
                                if (err) return console.log(err);
                                const pdfDoc = new HummusRecipe(__dirname + '/../../../uploads/' + pdfFile, __dirname + '/../../../uploads/' + OutPDfName);
                                const longPDF = PDfName;
                                pdfDoc.appendPage(__dirname + '/../../../uploads/' + PDfName).endPDF();
                                if (document.downloadType == 'drive') {
                                    if (document.pdfPin && document.pdfPin.length > 0) {
                                        attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + OutPDfName, DocInfo, document, function (respath) {
                                            ExportToDrive(document, path.basename(respath), function (res) {
                                                if (fs.existsSync(__dirname + '/../../../uploads/' + pdfFile)) fs.unlinkSync(__dirname + '/../../../uploads/' + pdfFile)
                                                if (fs.existsSync(__dirname + '/../../../uploads/' + PDfName)) fs.unlinkSync(__dirname + '/../../../uploads/' + PDfName)
                                                if (fs.existsSync(__dirname + '/../../../uploads/' + htmlName)) fs.unlinkSync(__dirname + '/../../../uploads/' + htmlName)
                                                CallBacks(path.basename(respath))
                                            });
                                        })
                                    } else {
                                        attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + OutPDfName, DocInfo, document, function (respath) {
                                            ExportToDrive(document, path.basename(respath), function (res) {
                                                if (fs.existsSync(__dirname + '/../../../uploads/' + pdfFile)) fs.unlinkSync(__dirname + '/../../../uploads/' + pdfFile)
                                                if (fs.existsSync(__dirname + '/../../../uploads/' + PDfName)) fs.unlinkSync(__dirname + '/../../../uploads/' + PDfName)
                                                if (fs.existsSync(__dirname + '/../../../uploads/' + htmlName)) fs.unlinkSync(__dirname + '/../../../uploads/' + htmlName)
                                                CallBacks(path.basename(respath))
                                            });
                                        })
                                    }
                                } else if (document.pdfPin && document.pdfPin.length > 0) {
                                    attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + OutPDfName, DocInfo, document, function (respath) {
                                        if (fs.existsSync(__dirname + '/../../../uploads/' + pdfFile)) fs.unlinkSync(__dirname + '/../../../uploads/' + pdfFile)
                                        if (fs.existsSync(__dirname + '/../../../uploads/' + PDfName)) fs.unlinkSync(__dirname + '/../../../uploads/' + PDfName)
                                        if (fs.existsSync(__dirname + '/../../../uploads/' + htmlName)) fs.unlinkSync(__dirname + '/../../../uploads/' + htmlName)
                                        CallBacks(path.basename(respath));
                                    })
                                } else {
                                    attachDigitalCertificateToPdf(__dirname + '/../../../uploads/' + OutPDfName, DocInfo, document, function (respath) {
                                        if (fs.existsSync(__dirname + '/../../../uploads/' + pdfFile)) fs.unlinkSync(__dirname + '/../../../uploads/' + pdfFile)
                                        if (fs.existsSync(__dirname + '/../../../uploads/' + PDfName)) fs.unlinkSync(__dirname + '/../../../uploads/' + PDfName)
                                        if (fs.existsSync(__dirname + '/../../../uploads/' + htmlName)) fs.unlinkSync(__dirname + '/../../../uploads/' + htmlName)
                                        CallBacks(path.basename(respath));
                                    })
                                }
                            });

                        });

                    });
                }
            });
        });
    }
}

// Download the file from S3 to server --- 
downloadToserver = async function (url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const sendReq = request.get(url);
        // verify response code
        sendReq.on('response', (response) => {
            if (response.statusCode !== 200) {
                return reject('Response status was ' + response.statusCode);
            }
            sendReq.pipe(file);
        });
        // close() is async, call cb after close completes
        file.on('finish', () => {
            file.close();
            resolve()
        });
        // check for request errors
        sendReq.on('error', (err) => {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            return reject(err.message);
        });
        file.on('error', (err) => { // Handle errors
            if (fs.existsSync(dest)) fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
            return reject(err.message);
        });
    });
}
// calculate field left,right,width and height
function getRenderedSize(contains, cWidth, cHeight, width, height, pos) {
    var oRatio = width / height,
        cRatio = cWidth / cHeight;
    return function () {
        if (contains ? (oRatio > cRatio) : (oRatio < cRatio)) {
            this.width = cWidth;
            this.height = cWidth / oRatio;
        } else {
            this.width = cHeight * oRatio;
            this.height = cHeight;
        }
        if (width <= cWidth && height <= cHeight) {
            this.width = width;
            this.height = height
        }
        this.left = (cWidth - this.width) * (pos / 100);
        this.right = this.width + this.left;
        return this;
    }.call({});
}
/**
 * @api {post} /pdfDownload  Dowload pdf 
 * @apiName GeneratePDF
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  path of selcted document for downloading 
 * @apiError 500-InternalServerError SERVER error.
 */
exports.GeneratePDF = function (req, res) {
    var async = require('async');
    //Load PDF Libraries
    const { PDFDocumentFactory, PDFDocumentWriter, StandardFonts, drawLinesOfText, drawText, drawImage, drawRectangle } = require('pdf-lib');
    Document.findById({ _id: req.body.id }).populate('uid').exec(async function (err, document) {
        var PdfPathInServer = __dirname + '/../../../uploads/' + Date.now() + '.pdf';
        await downloadToserver(document.path, PdfPathInServer);
        //PDF Document
        const loadPdf = fs.readFileSync(PdfPathInServer);
        // Here we load the tax voucher PDF file into a PDFDocument object.
        const pdfDoc = PDFDocumentFactory.load(loadPdf);
        if (fs.existsSync(PdfPathInServer)) fs.unlinkSync(PdfPathInServer)
        // If User is downloading without chagnes or orginal file
        let dummyDateNumber = String(Date.now())
        if (req.body.downloadFile == 'withoutchanges') {
            const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
            const filePath = __dirname + '/../../../uploads/' + document.encryptedid + dummyDateNumber + '.pdf';
            fs.writeFileSync(filePath, pdfBytes);

            genrateLogPDf(req.body, document, document.encryptedid + dummyDateNumber + '.pdf', [], async function (pdfPath) {
                var p = await uploadS3(__dirname + '/../../../uploads/' + pdfPath, 'downloads', true, function (awsdownloadpath) {
                    console.log("notWorkinggggggggggggg")
                    if (document.uid.name) var name = document.uid.name
                    if (document.uid.companyname) var name = document.uid.companyname
                    if (req.body.email) {
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            secure: false,
                            port: 25, // use SSL
                            auth: {
                                user: 'noreply@cognitiveinnovations.in',
                                pass: 'Password1234*'
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                        var HelperOptions = {
                            from: '"DOCINTACT" <noreply@cognitiveinnovations.in>',
                            to: req.body.email,
                            subject: name + ' send File Attachment via Docintact',
                            attachments: [{
                                filename: req.body.name,
                                path: awsdownloadpath
                            }]
                        };
                        HelperOptions.html = '<div class="a3s aXjCH msg233836446190015510" id=":q2"><div style="width:100%!important;font-family:Helvetica,sans-serif;margin:0;padding:0;">' +
                            '<div class="m_233836446190015510mailer-layout-background" style="width:100%;padding-bottom:50px;">' +
                            '<table align="center" bgcolor="#eff2f7" border="0" cellpadding="0" cellspacing="0" class="m_233836446190015510layout-wrapper" style="border-collapse:collapse;width:600px!important;margin:30px auto;">' +
                            '<tbody>' +
                            '<tr bgcolor="#2579D0" class="m_233836446190015510header-row" style="color:white!important;height:60px;">' +
                            '<td style="border-collapse:collapse;">' +
                            '<table style="width:100%;border-collapse:collapse;">' +
                            '<tbody>' +
                            '<tr>' +
                            '<td class="m_233836446190015510header-sender-logo" style="border-collapse:collapse;margin:6px;" valign="middle"></td>' +
                            '<td style="width:100%;border-collapse:collapse;">' +
                            '<h2 class="m_233836446190015510header-title-text m_233836446190015510white-text-color" style="display:inline-block;font-weight:300;color:white;margin:17px 10px 13px 15px;">File Attachment</h2><span class="m_233836446190015510dh-white-wordmark" style="padding-right:20px;vertical-align:bottom;float:right;margin:21px 10px 0 0;">&nbsp;<span class="m_233836446190015510via-text m_233836446190015510white-text" style="color:white;">via</span> <a href="' + config.frontendUrl + '"  style="color:white;text-decoration:none;" target="_blank"><strong>DocIntact</strong></a></span></td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '</td>' +
                            '</tr>' +
                            '<tr>' +
                            '<td class="m_233836446190015510body-content" style="border-collapse:collapse;padding:20px 30px 50px;"><span class="im"> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;"></h3> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + name + ' Sent Attachment Via Docintact  Click the below button to  Download the document</h3></span>' +
                            '<table class="m_233836446190015510two-column-preview" style="border-collapse:collapse;width:100%;">' +
                            '<tbody>' +
                            '<tr>' +
                            '<td class="m_233836446190015510no-border m_233836446190015510thumb-content-column" style="border-collapse:collapse;width:180px!important;max-width:180px!important;margin:10px;border:none;" valign="top">' +
                            '<a  href="' + awsdownloadpath + '" style="text-decoration:none;" target="_blank"><img class="m_233836446190015510document-thumbnail-image CToWUd fr-fic fr-dib"  src="https://staging.docintact.com/assets/images/document.png"  alt="test.pdf" style="outline: none; text-decoration: none; border: none; width: 150px !important; max-width: 150px !important;"></a></td>' +
                            '<td class="m_233836446190015510no-border m_233836446190015510body-content-column" style="border-collapse:collapse;width:inherit!important;margin:10px;border:none;" valign="top">' +
                            '<h3><strong></strong></h3><span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary"  href="' + awsdownloadpath + '" style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Download</a><div class="m_233836446190015510sent-by-text" style="font-size:14px;margin-top:16px;"><div class="m_233836446190015510text-muted"><div>Sent  by ' + document.uid.email + '</div><div>Document : ' + req.body.name + '</div></div></div></span></td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '</td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '<div class="yj6qo ajU">' +
                            '<div aria-expanded="false" aria-label="Show trimmed content" class="ajR" data-tooltip="Show trimmed content" id=":qi" tabindex="0"><img class="ajT fr-fic fr-dib" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div></div>' +
                            '<div class="adL">' +
                            '<div class="adm">' +
                            '<div class="ajR h4" id="q_8">' +
                            '<div class="ajT">' +
                            '<br>' +
                            '</div></div></div>' +
                            '<div class="h5">' +
                            '</div></div></div>' +
                            '<div class="adL">' +
                            '<br>' +
                            '</div></div>' +
                            '<div class="adL">' +
                            '<br>' +
                            '</div></div>'
                        transporter.sendMail(HelperOptions, function (err, info) {
                            if (err) { console.log("error occured when sending mail" + err) } else {
                                console.log("Sent successfully")
                                return res.send({ path: awsdownloadpath });
                            }
                        });
                    } else res.send({ path: awsdownloadpath });
                })
            })
        } else {
            const pages = pdfDoc.getPages();
            var result = [];
            fieldOptions.findOne({ $and: [{ active: true }, { versionid: document.versionid }, { documentid: document._id }] }).exec(function (err, fieldoptions) {
                if (err) { return handleError(res, err); } else if (!fieldoptions || !fieldoptions.fields || fieldoptions.fields.length == 0) {
                    const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
                    const filePath = __dirname + '/../../../uploads/' + document.encryptedid + dummyDateNumber + '.pdf';
                    fs.writeFileSync(filePath, pdfBytes);
                    genrateLogPDf(req.body, document, document.encryptedid + dummyDateNumber + '.pdf', [], async function (pdfPath) {
                        if (req.body.sharethisdocument) {
                            var createdFile = await shareThisDocument(document, pdfPath, req.body.filename)
                            console.log(createdFile)
                            return res.send(createdFile)
                        } else if (req.body.createCompDocImg) {
                            var encryptedid = document.encryptedid;
                            var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                            var pdfFile = __dirname + '/../../../uploads/' + pdfPath;
                            if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                            else {
                                fs.readdir(imageFolder, (err, files) => {
                                    if (err) throw err;
                                    for (const file of files) {
                                        fs.unlink(path.join(imageFolder, file), err => {
                                            if (err) throw err;
                                        });
                                    }
                                });
                            }
                            var child1 = childprocess.fork(__dirname + '/childprocess')
                            var sshCommand = 'pdftoppm ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
                            child1.on('message', async function (msg) {
                                fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                    //handling error
                                    if (err) {
                                        return console.log('Unable to scan directory: ' + err);
                                    }
                                    //listing all files using forEach
                                    createCompletedDocImages(files, document, encryptedid)
                                    var p = await uploadS3(__dirname + '/../../../uploads/' + pdfPath, 'downloads', true, function (awsdownloadpath) {
                                        return res.send({ path: awsdownloadpath })
                                    })
                                });
                                child1.kill()
                            })
                            child1.on('close', (code) => {
                                console.log(`child process close all stdio with code ${code}`);
                            });
                            child1.on('exit', (code) => {
                                console.log(`child process exited with code ${code}`);
                            });
                            child1.send({ sshCommand: sshCommand, filepath: pdfFile })
                        } else {
                            var p = await uploadS3(__dirname + '/../../../uploads/' + pdfPath, 'downloads', true, function (awsdownloadpath) {
                                if (document.uid.name) var name = document.uid.name
                                if (document.uid.companyname) var name = document.uid.companyname
                                if (req.body.email) {
                                    var transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        secure: false,
                                        port: 25, // use SSL
                                        auth: {
                                            user: 'noreply@cognitiveinnovations.in',
                                            pass: 'Password1234*'
                                        },
                                        tls: {
                                            rejectUnauthorized: false
                                        }
                                    });
                                    var HelperOptions = {
                                        from: '"DOCINTACT" <noreply@cognitiveinnovations.in>',
                                        to: req.body.email,
                                        subject: name + ' send File Attachment via Docintact',
                                        // text: "Click tht",
                                        attachments: [{
                                            filename: req.body.name,
                                            path: awsdownloadpath
                                        }]
                                    };
                                    HelperOptions.html = '<div class="a3s aXjCH msg233836446190015510" id=":q2"><div style="width:100%!important;font-family:Helvetica,sans-serif;margin:0;padding:0;">' +
                                        '<div class="m_233836446190015510mailer-layout-background" style="width:100%;padding-bottom:50px;">' +
                                        '<table align="center" bgcolor="#eff2f7" border="0" cellpadding="0" cellspacing="0" class="m_233836446190015510layout-wrapper" style="border-collapse:collapse;width:600px!important;margin:30px auto;">' +
                                        '<tbody>' +
                                        '<tr bgcolor="#2579D0" class="m_233836446190015510header-row" style="color:white!important;height:60px;">' +
                                        '<td style="border-collapse:collapse;">' +
                                        '<table style="width:100%;border-collapse:collapse;">' +
                                        '<tbody>' +
                                        '<tr>' +
                                        '<td class="m_233836446190015510header-sender-logo" style="border-collapse:collapse;margin:6px;" valign="middle"></td>' +
                                        '<td style="width:100%;border-collapse:collapse;">' +
                                        '<h2 class="m_233836446190015510header-title-text m_233836446190015510white-text-color" style="display:inline-block;font-weight:300;color:white;margin:17px 10px 13px 15px;">File Attachment</h2><span class="m_233836446190015510dh-white-wordmark" style="padding-right:20px;vertical-align:bottom;float:right;margin:21px 10px 0 0;">&nbsp;<span class="m_233836446190015510via-text m_233836446190015510white-text" style="color:white;">via</span> <a href="' + config.frontendUrl + '"  style="color:white;text-decoration:none;" target="_blank"><strong>DocIntact</strong></a></span></td>' +
                                        '</tr>' +
                                        '</tbody>' +
                                        '</table>' +
                                        '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                        '<td class="m_233836446190015510body-content" style="border-collapse:collapse;padding:20px 30px 50px;"><span class="im"> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;"></h3> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + name + ' Sent Attachment Via Docintact  Click the below button to  Download the document</h3></span>' +
                                        '<table class="m_233836446190015510two-column-preview" style="border-collapse:collapse;width:100%;">' +
                                        '<tbody>' +
                                        '<tr>' +
                                        '<td class="m_233836446190015510no-border m_233836446190015510thumb-content-column" style="border-collapse:collapse;width:180px!important;max-width:180px!important;margin:10px;border:none;" valign="top">' +
                                        '<a  href="' + awsdownloadpath + '" style="text-decoration:none;" target="_blank"><img class="m_233836446190015510document-thumbnail-image CToWUd fr-fic fr-dib"  src="https://staging.docintact.com/assets/images/document.png"  alt="test.pdf" style="outline: none; text-decoration: none; border: none; width: 150px !important; max-width: 150px !important;"></a></td>' +
                                        '<td class="m_233836446190015510no-border m_233836446190015510body-content-column" style="border-collapse:collapse;width:inherit!important;margin:10px;border:none;" valign="top">' +
                                        '<h3><strong></strong></h3><span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary"  href="' + awsdownloadpath + '" style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Download</a><div class="m_233836446190015510sent-by-text" style="font-size:14px;margin-top:16px;"><div class="m_233836446190015510text-muted"><div>Sent  by ' + document.uid.email + '</div><div>Document : ' + req.body.name + '</div></div></div></span></td>' +
                                        '</tr>' +
                                        '</tbody>' +
                                        '</table>' +
                                        '</td>' +
                                        '</tr>' +
                                        '</tbody>' +
                                        '</table>' +
                                        '<div class="yj6qo ajU">' +
                                        '<div aria-expanded="false" aria-label="Show trimmed content" class="ajR" data-tooltip="Show trimmed content" id=":qi" tabindex="0"><img class="ajT fr-fic fr-dib" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div></div>' +
                                        '<div class="adL">' +
                                        '<div class="adm">' +
                                        '<div class="ajR h4" id="q_8">' +
                                        '<div class="ajT">' +
                                        '<br>' +
                                        '</div></div></div>' +
                                        '<div class="h5">' +
                                        '</div></div></div>' +
                                        '<div class="adL">' +
                                        '<br>' +
                                        '</div></div>' +
                                        '<div class="adL">' +
                                        '<br>' +
                                        '</div></div>'
                                    transporter.sendMail(HelperOptions, function (err, info) {
                                        if (err) { console.log("error occured when sending mail" + err) } else {
                                            console.log("Sent successfully")
                                            return res.send({ path: awsdownloadpath });
                                        }
                                    });
                                } else res.send({ path: awsdownloadpath });
                            })
                        }
                    })
                } else {
                    fieldValues.find({ $and: [{ active: true }, { documentid: document._id }] }).exec(function (err, fieldvalue) {
                        if (err) { return handleError(res, err); } else if (!fieldvalue) return result = fieldoptions
                        else {
                            async.eachSeries(fieldoptions.fields, async function (field) {
                                var f = _.filter(fieldvalue, { 'id': field.id })[0];
                                if (f != undefined && f.id) {
                                    var _f = field;
                                    if (f.value) _f.value = f.value;
                                    if (f.path) _f.path = f.path;
                                    if (f.size) _f.size = f.size;
                                    if (f.fontText) _f.fontText = f.fontText;
                                    if (f.fontStyle) _f.fontStyle = f.fontStyle;
                                    if (f.signaturebaseData) _f.signaturebaseData = f.signaturebaseData;
                                    if (f.signatureType) _f.signatureType = f.signatureType;
                                    if (f.photoType) _f.photoType = f.photoType;
                                    if (f.stampType) _f.stampType = f.stampType;
                                    if (f.signatureId) _f.signatureId = f.signatureId;
                                    if (f.photoId) _f.photoId = f.photoId;
                                    if (f.stampId) _f.stampId = f.stampId;
                                    if (f.insertedemail) _f.insertedemail = f.insertedemail;
                                    if (f.created_at) _f.created_at = f.created_at;
                                    if (f.latitude) _f.latitude = f.latitude;
                                    if (f.longitude) _f.longitude = f.longitude;
                                    if(f.fontsize) _f.fontsize = f.fontsize;
                                    result.push(_f);
                                } else {
                                    result.push(field);
                                }
                            }, function () {
                                var { promisify } = require('util');
                                var sizeOf = promisify(require('image-size'));
                                async.eachSeries(result, async function (fild) {
                                    var fontsize = 16
                                    if (fild['fontsize'])
                                        fontsize = parseInt(fild['fontsize'].substring(0, fild['fontsize'].length - 2));
                                    else if (fild['css-font-size'])
                                        fontsize = parseInt(fild['css-font-size'].substring(0, fild['css-font-size'].length - 2));
                                    fild.left += 2
                                    fild.top += 2
                                    fild.width -= 2
                                    fild.height -= 2
                                    fild.pageFieldHeight -= 2
                                    fild.pageFieldHeight +=  + ((fild.pageNo - 1)*10)
                                    var widthPercentage = fild.left / (fild.pageWidth / 100);
                                    var widthP = ((fild.pageWidth - document.pagesInfo[fild.pageNo - 1][2]) / document.pagesInfo[fild.pageNo - 1][2]) * 100
                                    var heightP = ((fild.pageHeight - document.pagesInfo[fild.pageNo - 1][3]) / document.pagesInfo[fild.pageNo - 1][3]) * 100
                                    var left = (document.pagesInfo[fild.pageNo - 1][2] / 100) * widthPercentage;
                                    var heightPercentage = (fild.pageFieldHeight + fild.height) / (fild.pageHeight / 100);
                                    var PDfHeightP = (document.pagesInfo[fild.pageNo - 1][3] / 100) * heightPercentage;
                                    var height = (fild.height / 100) * heightP;
                                    var top = document.pagesInfo[fild.pageNo - 1][3] - PDfHeightP;
                                    var totalpagegap = (((document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (10)) * (fild.pageNo - 1))
                                    top += totalpagegap
                                    var width = (fild.width / 100) * widthP;
                                    let font_family = 'Arial';
                                    let font_family_path = 'Arial';
                                    if (fild['css-font-family']) {
                                        font_family = fild['css-font-family'];
                                        font_family_path = fild['css-font-family'];
                                        if (fild['css-font-weight']) font_family_path = font_family_path + '_Bold'
                                        if (fild['css-font-style']) font_family_path = font_family_path + '_Italic'
                                    } else if (fild['fontStyle']) {
                                        font_family = fild['fontStyle'];
                                        font_family_path = fild['fontStyle'];
                                    }
                                    let pathOfFontFile = __dirname + '/../../../fonts/' + font_family + '/' + font_family_path + '.ttf'
                                    if (!fs.existsSync(pathOfFontFile)) {
                                        console.log(pathOfFontFile);
                                        pathOfFontFile = __dirname + '/../../../fonts/' + font_family + '.ttf';
                                        font_family_path = font_family
                                        console.log("Path is not there==========", pathOfFontFile)
                                    }
                                    let mm = fs.readFileSync(pathOfFontFile);
                                    const [basefontRef, basefontDims] = pdfDoc.embedNonstandardFont(mm);
                                    // Font Family End
                                    // Font Color Start
                                    var font_color_rgb = [0, 0, 0]
                                    var background_color_rgb = [255, 255, 255]
                                    font_color_rgb = colorCodeConvertion(fild['css-color'], '#000000') // Default Font color =>Black
                                    background_color_rgb = colorCodeConvertion(fild['css-background-color'], '#ffffff') // Default Backgroung color =>White
                                    function colorCodeConvertion(colorCode, defaultHexColor) {
                                        let color_rgb
                                        if (colorCode && colorCode.charAt(0) == "#") {
                                            defaultHexColor = colorCode;
                                            color_rgb = [hexToR(defaultHexColor) / 255, hexToG(defaultHexColor) / 255, hexToB(defaultHexColor) / 255];
                                        } else if (colorCode && colorCode.substring(0, 4) == "rgba") {
                                            let font_color_rgba = colorCode;
                                            color_rgb = rgba2rgb(font_color_rgba)
                                        } else color_rgb = [hexToR(defaultHexColor) / 255, hexToG(defaultHexColor) / 255, hexToB(defaultHexColor) / 255];
                                        return color_rgb;
                                    }
                                    // Font hex code to rgb start
                                    function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }

                                    function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }

                                    function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }

                                    function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }
                                    // Font hex code to rgb end
                                    // Font rgba  to rgb start
                                    function cutRgb(h) { return ((h.substring(0, 4) == "rgba") ? h.substring(5, h.length - 1) : h).split(',') }

                                    function rgba2rgb(RGBA_color) {
                                        var colorval = (cutRgb(RGBA_color))
                                        var alpha = parseFloat(colorval[3], 10)
                                        return [
                                            ((1 - alpha) * 255 + alpha * parseInt(colorval[0], 10)) / 255,
                                            ((1 - alpha) * 255 + alpha * parseInt(colorval[1], 10)) / 255,
                                            ((1 - alpha) * 255 + alpha * parseInt(colorval[2], 10)) / 255
                                        ];
                                    }
                                    // Font rgba  to rgb end
                                    // Font Color End
                                    switch (fild.type) {
                                        case 'signature':
                                        case 'initial':
                                            let ImagePathInServer
                                            if (fild.signaturebaseData && fild.signatureType == 'signaturepad') {
                                                let data = fild.signaturebaseData.substring(22);
                                                ImagePathInServer = __dirname + '/../../../uploads/' + fild.id + '.png'
                                                fs.writeFileSync(ImagePathInServer, data, { encoding: 'base64' });
                                            } else if (fild.path && fild.signatureType == 'fileupload') {
                                                ImagePathInServer = __dirname + '/../../../uploads/' + path.basename(fild.path);
                                                await downloadToserver(fild.path, ImagePathInServer);
                                            } else if (fild.fontStyle && fild.fontText && fild.signatureType == 'font') {
                                                console.log(fild.fontText.length,'hghgghgh')
                                                let Fontwidth = basefontDims.widthOfTextAtSize(fild.fontText, fontsize);
                                                let Fontheight = basefontDims.heightOfFontAtSize(fontsize);
                                                let errfieldheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (fild.height)
                                                let errfieldwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fild.width)
                                                let errwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (Fontwidth)
                                                let errheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (Fontheight)
                                                let erraligngapwidth = 0
                                                if ((fild.align && fild.align == 'center') || (!fild.align)) {
                                                    erraligngapwidth = (errfieldwidth - errwidth) / 2
                                                } else if (fild.align && fild.align == 'right') {
                                                    erraligngapwidth = (errfieldwidth - errwidth)
                                                }
                                                fontsize = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fontsize)
                                                let finalLeft, finalTop
                                                let x, y, cx, cy
                                                x = finalLeft = left + erraligngapwidth
                                                y = finalTop = top + (errfieldheight - errheight)
                                                cx = x + (errwidth / 2)
                                                cy = y + (errheight / 2)
                                                if (fild['css-transform']) {
                                                    let tempX, tempY
                                                    tempX = x - cx
                                                    tempY = y - cy
                                                    let rotateX, rotateY
                                                    rotateX = (tempX * Math.cos((360 - fild['css-transform']) * Math.PI / 180)) - (tempY * Math.sin((360 - fild['css-transform']) * Math.PI / 180))
                                                    rotateY = (tempX * Math.sin((360 - fild['css-transform']) * Math.PI / 180)) + (tempY * Math.cos((360 - fild['css-transform']) * Math.PI / 180))
                                                    finalLeft = Math.abs(rotateX + cx)
                                                    finalTop = Math.abs(rotateY + cy)
                                                }
                                                pages[fild.pageNo - 1].addFontDictionary(font_family_path, basefontRef);
                                                pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                    // Now let's draw 2 lines of red Courier text near the bottom of the page.
                                                    drawLinesOfText([fild.fontText].map(basefontDims.encodeText), {
                                                        x: finalLeft,
                                                        y: finalTop,
                                                        width: errwidth,
                                                        height: errheight,
                                                        font: font_family_path,
                                                        size: fontsize,
                                                        // colorRgb: [1, 0, 0],
                                                        rotateDegrees: fild['css-transform'] ? (360 - fild['css-transform']) : 0
                                                    }))));
                                            }
                                            if ((fild.signaturebaseData && fild.signatureType == 'signaturepad') ||
                                                (fild.path && fild.signatureType == 'fileupload')) {
                                                let dimensions
                                                try {
                                                    dimensions = await sizeOf(ImagePathInServer);
                                                } catch (err) { }
                                                let imgpos = getRenderedSize(true, fild.width, fild.height, dimensions.width, dimensions.height,
                                                    fild.align == 'left' ? 0 : fild.align == 'right' ? 100 : 50);
                                                let errleft = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (imgpos.left)
                                                let errright = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (imgpos.right)
                                                let errwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (imgpos.width)
                                                let errheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (imgpos.height)
                                                let errfieldheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (fild.height)
                                                let errfieldwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fild.width)
                                                let erroriginalimgheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (dimensions.height)
                                                let erroriginalimgwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (dimensions.width)
                                                let errgapheight = 0;
                                                let erraligngapwidth = 0;
                                                if (fild.width >= dimensions.width && fild.height >= dimensions.height) {
                                                    errgapheight = errfieldheight - errheight
                                                    if (fild.align == 'left') erraligngapwidth = 0
                                                    else if (fild.align == 'right') erraligngapwidth = errfieldwidth - errwidth
                                                    else erraligngapwidth = (errfieldwidth - errwidth) / 2
                                                } else if (fild.width <= dimensions.width && fild.height >= dimensions.height) {
                                                    errgapheight = errfieldheight - erroriginalimgheight + (erroriginalimgheight - errheight) / 2
                                                } else if (fild.width >= dimensions.width && fild.height <= dimensions.height) {
                                                    let orgimggapwidth = (erroriginalimgwidth - errwidth) / 2
                                                    if (fild.align == 'left') erraligngapwidth = orgimggapwidth
                                                    else if (fild.align == 'right') erraligngapwidth = errfieldwidth - erroriginalimgwidth + orgimggapwidth
                                                    else erraligngapwidth = ((errfieldwidth - erroriginalimgwidth) / 2) + orgimggapwidth
                                                } else if (fild.width <= dimensions.width && fild.height <= dimensions.height) {
                                                    erraligngapwidth = (errfieldwidth - errwidth) / 2
                                                }
                                                if (fild.signatureType == 'signaturepad' || path.extname(fild.path) == '.png')
                                                    var [basepngRef, basePngDims] = pdfDoc.embedPNG(fs.readFileSync(ImagePathInServer));
                                                else
                                                    var [basepngRef, basePngDims] = pdfDoc.embedJPG(fs.readFileSync(ImagePathInServer));
                                                const REF_PNG = 'Refernace' + Math.floor((Math.random() * 100) + 1);
                                                let finalLeft, finalTop
                                                let x, y, cx, cy
                                                x = finalLeft = left + erraligngapwidth
                                                y = finalTop = top + errgapheight
                                                cx = x + (errwidth / 2)
                                                cy = y + (errheight / 2)
                                                if (fild['css-transform']) {
                                                    let tempX, tempY
                                                    tempX = x - cx
                                                    tempY = y - cy
                                                    let rotateX, rotateY
                                                    rotateX = (tempX * Math.cos((360 - fild['css-transform']) * Math.PI / 180)) - (tempY * Math.sin((360 - fild['css-transform']) * Math.PI / 180))
                                                    rotateY = (tempX * Math.sin((360 - fild['css-transform']) * Math.PI / 180)) + (tempY * Math.cos((360 - fild['css-transform']) * Math.PI / 180))
                                                    finalLeft = Math.abs(rotateX + cx)
                                                    finalTop = Math.abs(rotateY + cy)
                                                }
                                                let Fcx = left + (errfieldwidth / 2)
                                                let Fcy = top + (errfieldheight / 2)
                                                let FfinalLeft = left
                                                let FfinalTop = top
                                                if (fild['css-transform']) {
                                                    let tempX, tempY
                                                    tempX = left - Fcx
                                                    tempY = top - Fcy
                                                    let rotateX, rotateY
                                                    rotateX = (tempX * Math.cos((360 - fild['css-transform']) * Math.PI / 180)) - (tempY * Math.sin((360 - fild['css-transform']) * Math.PI / 180))
                                                    rotateY = (tempX * Math.sin((360 - fild['css-transform']) * Math.PI / 180)) + (tempY * Math.cos((360 - fild['css-transform']) * Math.PI / 180))
                                                    FfinalLeft = Math.abs(rotateX + Fcx)
                                                    FfinalTop = Math.abs(rotateY + Fcy)
                                                }
                                                if ((fild.align == 'right' || fild.align == 'left' || fild.align == 'center' || !fild.align) && fild['css-transform']) {
                                                    finalLeft = FfinalLeft + ((erraligngapwidth) * Math.cos((fild['css-transform']) * Math.PI / 180)) +
                                                        ((errgapheight) * Math.cos((90 - fild['css-transform']) * Math.PI / 180))
                                                    finalTop = FfinalTop + ((erraligngapwidth) * Math.sin((-fild['css-transform']) * Math.PI / 180)) +
                                                        ((errgapheight) * Math.sin((90 - fild['css-transform']) * Math.PI / 180))
                                                }
                                                if (fs.existsSync(ImagePathInServer)) fs.unlinkSync(ImagePathInServer)
                                                pages[fild.pageNo - 1].addImageObject(REF_PNG, basepngRef);
                                                pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                    // `drawImage` is a "composite" PDF operator that lets us easily draw an image
                                                    // him centered horizontally in the top half of the page.
                                                    drawImage(REF_PNG, {
                                                        x: finalLeft,
                                                        y: finalTop,
                                                        width: errwidth,
                                                        height: errheight,
                                                        rotateDegrees: fild['css-transform'] ? (360 - fild['css-transform']) : 0
                                                    }),
                                                )));
                                            }
                                            break;
                                        case 'Photo':
                                        case 'Stamp':
                                            if (fild.path) {
                                                let ImagePathInServer = __dirname + '/../../../uploads/' + path.basename(fild.path);
                                                await downloadToserver(fild.path, ImagePathInServer);
                                                let dimensions
                                                try {
                                                    dimensions = await sizeOf(ImagePathInServer);
                                                    console.log(dimensions.width, dimensions.height);
                                                } catch (err) {
                                                    console.error(err);
                                                }
                                                let imgpos = getRenderedSize(true, fild.width, fild.height, dimensions.width, dimensions.height,
                                                    fild.align == 'left' ? 0 : fild.align == 'right' ? 100 : 50);
                                                let errleft = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (imgpos.left)
                                                let errright = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (imgpos.right)
                                                let errwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (imgpos.width)
                                                let errheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (imgpos.height)
                                                let errfieldheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (fild.height)
                                                let errfieldwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fild.width)
                                                let erroriginalimgheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (dimensions.height)
                                                let erroriginalimgwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (dimensions.width)
                                                let errgapheight = 0;
                                                let erraligngapwidth = 0;
                                                if (fild.width >= dimensions.width && fild.height >= dimensions.height) {
                                                    errgapheight = errfieldheight - errheight
                                                    if (fild.align == 'left') erraligngapwidth = 0
                                                    else if (fild.align == 'right') erraligngapwidth = errfieldwidth - errwidth
                                                    else erraligngapwidth = (errfieldwidth - errwidth) / 2
                                                } else if (fild.width <= dimensions.width && fild.height >= dimensions.height) {
                                                    errgapheight = errfieldheight - erroriginalimgheight + (erroriginalimgheight - errheight) / 2
                                                } else if (fild.width >= dimensions.width && fild.height <= dimensions.height) {
                                                    let orgimggapwidth = (erroriginalimgwidth - errwidth) / 2
                                                    if (fild.align == 'left') erraligngapwidth = orgimggapwidth
                                                    else if (fild.align == 'right') erraligngapwidth = errfieldwidth - erroriginalimgwidth + orgimggapwidth
                                                    else erraligngapwidth = ((errfieldwidth - erroriginalimgwidth) / 2) + orgimggapwidth
                                                } else if (fild.width <= dimensions.width && fild.height <= dimensions.height) {
                                                    erraligngapwidth = (errfieldwidth - errwidth) / 2
                                                }

                                                if (path.extname(fild.path) == '.png')
                                                    var [basepngRef, basePngDims] = pdfDoc.embedPNG(fs.readFileSync(ImagePathInServer));
                                                else
                                                    var [basepngRef, basePngDims] = pdfDoc.embedJPG(fs.readFileSync(ImagePathInServer));
                                                const REF_PNG = 'Refernace' + Math.floor((Math.random() * 100) + 1);
                                                if (fs.existsSync(ImagePathInServer)) fs.unlinkSync(ImagePathInServer)
                                                pages[fild.pageNo - 1].addImageObject(REF_PNG, basepngRef);
                                                pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                    // `drawImage` is a "composite" PDF operator that lets us easily draw an image
                                                    // him centered horizontally in the top half of the page.
                                                    drawImage(REF_PNG, {
                                                        x: left + erraligngapwidth,
                                                        y: top + errgapheight,
                                                        width: errwidth,
                                                        height: errheight,
                                                    }),
                                                )));
                                            }
                                            break;
                                            case 'label':
                                                if (fild.value) {
                                                    var newlines = fild.value.split(/\n/);
                                                    console.log(newlines.length);
                                                    for(i = 0; i < newlines.length; i++){
                                                        console.log(newlines[i])
                                                        var fontsize = 16
                                                        if (fild['fontsize']) fontsize = parseInt(fild['fontsize'].substring(0, fild['fontsize'].length - 2));
                                                   else if (fild['css-font-size']) fontsize = parseInt(fild['css-font-size'].substring(0, fild['css-font-size'].length - 2));
                                                   

                                                            let fildvalue = newlines[i]
                                                            let Fontwidth = basefontDims.widthOfTextAtSize(fildvalue, fontsize);
                                                            let Fontheight = basefontDims.heightOfFontAtSize(fontsize);
                                                            let errfieldheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (fild.height)
                                                            let errfieldwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fild.width)
                                                            let errwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (Fontwidth)
                                                            let errheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (Fontheight)
                                                            errwidth = (errwidth < errfieldwidth) ? errwidth : errfieldwidth
                                                            errheight = (errheight < errfieldheight) ? errheight : errfieldheight
                                                            let erraligngapwidth = 0
                                                            if (fild.align && fild.align == 'center') {
                                                                erraligngapwidth = ((errfieldwidth - errwidth) / 2) > 0 ? ((errfieldwidth - errwidth) / 2) : 0
                                                            } else if (fild.align && fild.align == 'right') {
                                                                erraligngapwidth = (errfieldwidth - errwidth) > 0 ? (errfieldwidth - errwidth) : 0
                                                            }
                                                            fontsize = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fontsize)
                                                            let finalLeft, finalTop
                                                            let x, y, cx, cy, err_gap_height
                                                            x = finalLeft = left + erraligngapwidth
                                                            err_gap_height = ((errfieldheight - errheight))
                                                            y = finalTop = top + err_gap_height
                                                            cx = x + (errwidth / 2)
                                                            cy = y + (errheight / 2)
                                                            if (fild['css-transform']) {
                                                                let tempX, tempY
                                                                tempX = x - cx
                                                                tempY = y - cy
                                                                let rotateX, rotateY
                                                                rotateX = (tempX * Math.cos((360 - fild['css-transform']) * Math.PI / 180)) - (tempY * Math.sin((360 - fild['css-transform']) * Math.PI / 180))
                                                                rotateY = (tempX * Math.sin((360 - fild['css-transform']) * Math.PI / 180)) + (tempY * Math.cos((360 - fild['css-transform']) * Math.PI / 180))
                                                                finalLeft = Math.abs(rotateX + cx)
                                                                finalTop = Math.abs(rotateY + cy)
                                                            }
                                                            let Fcx = left + (errfieldwidth / 2)
                                                            let Fcy = top + (errfieldheight / 2)
                                                            let FfinalLeft = left
                                                            console.log('top',top)
                                                            let FfinalTop = top 
                                                            if (fild['css-transform']) {
                                                                let tempX, tempY
                                                                tempX = left - Fcx
                                                                tempY = top - Fcy
                                                                let rotateX, rotateY
                                                                rotateX = (tempX * Math.cos((360 - fild['css-transform']) * Math.PI / 180)) - (tempY * Math.sin((360 - fild['css-transform']) * Math.PI / 180))
                                                                rotateY = (tempX * Math.sin((360 - fild['css-transform']) * Math.PI / 180)) + (tempY * Math.cos((360 - fild['css-transform']) * Math.PI / 180))
                                                                FfinalLeft = Math.abs(rotateX + Fcx)
                                                                FfinalTop = Math.abs(rotateY + Fcy)
                                                            }
                                                            if ((fild.align == 'right' || fild.align == 'left' || fild.align == 'center' || !fild.align) && fild['css-transform']) {
                                                                finalLeft = FfinalLeft + ((erraligngapwidth) * Math.cos((fild['css-transform']) * Math.PI / 180)) +
                                                                    ((err_gap_height) * Math.cos((90 - fild['css-transform']) * Math.PI / 180))
                                                                finalTop = FfinalTop + ((erraligngapwidth) * Math.sin((-fild['css-transform']) * Math.PI / 180)) +
                                                                    ((err_gap_height) * Math.sin((90 - fild['css-transform']) * Math.PI / 180))
                                                            }
                                                            pages[fild.pageNo - 1].addFontDictionary(font_family_path, basefontRef);
                                                            if(i > 0) finalTop = finalTop - (i*errheight);
                                                            
                                                            if ((!(background_color_rgb[0] == 1 && background_color_rgb[1] == 1 && background_color_rgb[2] == 1) || fild['css-background-color'] == '#ffffff' )&& i == 0)
                                                            {
                                                                console.log(FfinalTop,'$$$$$$$',FfinalTop+50)
                                                                pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                                    // Now let's draw 2 lines of red Courier text near the bottom of the page.
                                                                    drawRectangle({
                                                                        x: (fild['css-background-color']) ? FfinalLeft : 0,
                                                                        y: (fild['css-background-color']) ? FfinalTop  : 0,
                                                                        width: (fild['css-background-color']) ? errfieldwidth : 0,
                                                                        height: (fild['css-background-color']) ? errfieldheight : 0,
                                                                        colorRgb: background_color_rgb,
                                                                        rotateDegrees: fild['css-transform'] ? (360 - fild['css-transform']) : 0
                                                                    })    
                                                                )));    
                                                            }
                                                            //return false;
                                                            pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                                // Now let's draw 2 lines of red Courier text near the bottom of the page.
                                                                drawLinesOfText([fildvalue].map(basefontDims.encodeText), {
                                                                    x: finalLeft,
                                                                    y: finalTop,
                                                                    width: errwidth,
                                                                    height: errheight,
                                                                    font: font_family_path,
                                                                    size: fontsize,
                                                                    colorRgb: font_color_rgb,
                                                                    rotateDegrees: fild['css-transform'] ? (360 - fild['css-transform']) : 0
                                                                })
    
                                                            )));
                                                        }
                                                  }
                                                break;
                                        case 'text':
                                        case 'name':
                                        case 'email':
                                        case 'mobilenumber':
                                        case 'company':
                                        case 'date':
                                        case 'dropdown':
                                            if (fild.value) {
                                                let fildvalue = fild.value
                                                if (fild.type == 'date')
                                                    if (fild.pickerT == 'calendar' && fild.pickerType == 'date') {
                                                        fildvalue = moment(fild.value).utcOffset(330).format(fild.dateformats.toUpperCase())
                                                    } else if (fild.pickerT == 'both' && fild.pickerType == 'both') {
                                                        let datetimeformat = fild.dateTimeformats.substr(0, 10).toUpperCase().concat(fild.dateTimeformats.substr(10, fild.dateTimeformats.length));
                                                        if (datetimeformat.charAt(datetimeformat.length - 1) == 'a') datetimeformat = (datetimeformat.substr(0, datetimeformat.length - 1)).concat('A');
                                                        fildvalue = moment(fild.value).utcOffset(330).format(datetimeformat)
                                                    } else if (fild.pickerT == 'timer' && fild.pickerType == 'time') {
                                                        if (fild.timeformats.charAt(fild.timeformats.length - 1) == 'a') fild.timeformats = (fild.timeformats.substr(0, fild.timeformats.length - 1)).concat('A');
                                                        fildvalue = moment(fild.value).utcOffset(330).format(fild.timeformats)
                                                    }
                                                let Fontwidth = basefontDims.widthOfTextAtSize(fildvalue, fontsize);
                                                let Fontheight = basefontDims.heightOfFontAtSize(fontsize);
                                                let errfieldheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (fild.height)
                                                let errfieldwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fild.width)
                                                let errwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (Fontwidth)
                                                let errheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (Fontheight)
                                                errwidth = (errwidth < errfieldwidth) ? errwidth : errfieldwidth
                                                errheight = (errheight < errfieldheight) ? errheight : errfieldheight
                                                let erraligngapwidth = 0
                                                if (fild.align && fild.align == 'center') {
                                                    erraligngapwidth = ((errfieldwidth - errwidth) / 2) > 0 ? ((errfieldwidth - errwidth) / 2) : 0
                                                } else if (fild.align && fild.align == 'right') {
                                                    erraligngapwidth = (errfieldwidth - errwidth) > 0 ? (errfieldwidth - errwidth) : 0
                                                }
                                                fontsize = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fontsize)
                                                let finalLeft, finalTop
                                                let x, y, cx, cy, err_gap_height
                                                x = finalLeft = left + erraligngapwidth
                                                if (fild.type == 'label') {
                                                    err_gap_height = ((errfieldheight - errheight))
                                                    y = finalTop = top + err_gap_height
                                                } else {
                                                    err_gap_height = ((errfieldheight / 2) - (errheight / 4))
                                                    y = finalTop = top + err_gap_height
                                                }
                                                cx = x + (errwidth / 2)
                                                cy = y + (errheight / 2)
                                                if (fild['css-transform']) {
                                                    let tempX, tempY
                                                    tempX = x - cx
                                                    tempY = y - cy
                                                    let rotateX, rotateY
                                                    rotateX = (tempX * Math.cos((360 - fild['css-transform']) * Math.PI / 180)) - (tempY * Math.sin((360 - fild['css-transform']) * Math.PI / 180))
                                                    rotateY = (tempX * Math.sin((360 - fild['css-transform']) * Math.PI / 180)) + (tempY * Math.cos((360 - fild['css-transform']) * Math.PI / 180))
                                                    finalLeft = Math.abs(rotateX + cx)
                                                    finalTop = Math.abs(rotateY + cy)
                                                }
                                                let Fcx = left + (errfieldwidth / 2)
                                                let Fcy = top + (errfieldheight / 2)
                                                let FfinalLeft = left
                                                let FfinalTop = top
                                                if (fild['css-transform']) {
                                                    let tempX, tempY
                                                    tempX = left - Fcx
                                                    tempY = top - Fcy
                                                    let rotateX, rotateY
                                                    rotateX = (tempX * Math.cos((360 - fild['css-transform']) * Math.PI / 180)) - (tempY * Math.sin((360 - fild['css-transform']) * Math.PI / 180))
                                                    rotateY = (tempX * Math.sin((360 - fild['css-transform']) * Math.PI / 180)) + (tempY * Math.cos((360 - fild['css-transform']) * Math.PI / 180))
                                                    FfinalLeft = Math.abs(rotateX + Fcx)
                                                    FfinalTop = Math.abs(rotateY + Fcy)
                                                }
                                                if ((fild.align == 'right' || fild.align == 'left' || fild.align == 'center' || !fild.align) && fild['css-transform']) {
                                                    finalLeft = FfinalLeft + ((erraligngapwidth) * Math.cos((fild['css-transform']) * Math.PI / 180)) +
                                                        ((err_gap_height) * Math.cos((90 - fild['css-transform']) * Math.PI / 180))
                                                    finalTop = FfinalTop + ((erraligngapwidth) * Math.sin((-fild['css-transform']) * Math.PI / 180)) +
                                                        ((err_gap_height) * Math.sin((90 - fild['css-transform']) * Math.PI / 180))
                                                }
                                                let isTransparent = true
                                                console.log(background_color_rgb,'ooo',background_color_rgb[2])
                                                pages[fild.pageNo - 1].addFontDictionary(font_family_path, basefontRef);

                                                if (!(background_color_rgb[0] == 1 && background_color_rgb[1] == 1 && background_color_rgb[2] == 1)) {isTransparent = false
                                                    console.log("&&&&&&&&&&&&&&&&&&&")
                                                    pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                    drawRectangle({
                                                        x: (fild['css-background-color'] && !isTransparent) ? FfinalLeft : 0,
                                                        y: (fild['css-background-color'] && !isTransparent) ? FfinalTop : 0,
                                                        width: (fild['css-background-color'] && !isTransparent) ? errfieldwidth : 0,
                                                        height: (fild['css-background-color'] && !isTransparent) ? errfieldheight : 0,
                                                        colorRgb: background_color_rgb,
                                                        rotateDegrees: fild['css-transform'] ? (360 - fild['css-transform']) : 0
                                                    })    
                                                    )));    
                                                }
                                                pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                    // Now let's draw 2 lines of red Courier text near the bottom of the page.
                                                   
                                                    drawLinesOfText([fildvalue].map(basefontDims.encodeText), {
                                                        x: finalLeft,
                                                        y: finalTop,
                                                        width: errwidth,
                                                        height: errheight,
                                                        font: font_family_path,
                                                        size: fontsize,
                                                        colorRgb: font_color_rgb,
                                                        rotateDegrees: fild['css-transform'] ? (360 - fild['css-transform']) : 0
                                                    })

                                                )));
                                            }
                                            break;
                                        case 'checkbox':
                                            if (fild && fild.value) {
                                                let check = fild.value ? fild.value : false
                                                let ImagePathInServer = __dirname + '/../../../fonts/' + fild.type + '-' + check + '.png'
                                                const [basepngRef, basePngDims] = pdfDoc.embedPNG(fs.readFileSync(ImagePathInServer));
                                                const REF_PNG = 'Refernace' + Math.floor((Math.random() * 100) + 1);
                                                let resWH = (fild.height > fild.width) ? (fild.width) : (fild.height)
                                                let errfieldheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (fild.height)
                                                let errfieldwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fild.width)
                                                let errheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (resWH)
                                                let errwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (resWH)
                                                pages[fild.pageNo - 1].addImageObject(REF_PNG, basepngRef);
                                                pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                    drawImage(REF_PNG, {
                                                        x: left + ((errfieldwidth - errwidth) / 2),
                                                        y: top + ((errfieldheight - errheight) / 2),
                                                        width: errwidth,
                                                        height: errheight,
                                                    }),
                                                )));
                                            }
                                            break;
                                        case 'radiobutton':
                                            if (fild.optionvalue && fild.value) {
                                                let contentlength = 0
                                                left = left + ((document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (23))
                                                let errfieldheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (fild.height)
                                                let errfieldwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fild.width)
                                                let radiobtnwidth = ((13 / 16) * (fontsize))
                                                let erroriginalimgheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (radiobtnwidth)
                                                let erroriginalimgwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (radiobtnwidth)
                                                fild.optionvalue.forEach(async (element, index) => {
                                                    let check = fild.value == element ? true : false
                                                    let ImagePathInServer = __dirname + '/../../../fonts/' + fild.type + '-' + check + '.png'
                                                    const [basepngRef, basePngDims] = pdfDoc.embedPNG(fs.readFileSync(ImagePathInServer));
                                                    const REF_PNG = 'Refernace' + Math.floor((Math.random() * 100) + 1);
                                                    let Fontwidth = basefontDims.widthOfTextAtSize(element + ' ', fontsize);
                                                    let Fontheight = basefontDims.heightOfFontAtSize(fontsize);
                                                    let errwidth = (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (Fontwidth)
                                                    let errheight = (document.pagesInfo[fild.pageNo - 1][3] / fild.pageHeight) * (Fontheight)
                                                    let newlinedistance = 0,
                                                        radioBtnCenter = 0
                                                    if (fild.radiobuttondisplay == 'newline') {
                                                        newlinedistance = -(index * errheight) - (((2 * (index - 1)) + 1) * 4)
                                                    } else newlinedistance = -4
                                                    radioBtnCenter = (errheight - erroriginalimgheight) / 2
                                                    pages[fild.pageNo - 1].addImageObject(REF_PNG, basepngRef);
                                                    pages[fild.pageNo - 1].addFontDictionary(font_family_path, basefontRef);
                                                    pages[fild.pageNo - 1].addContentStreams(pdfDoc.register(pdfDoc.createContentStream(
                                                        drawImage(REF_PNG, {
                                                            x: left + contentlength,
                                                            y: top + errfieldheight + newlinedistance + (-errheight) + radioBtnCenter,
                                                            width: erroriginalimgwidth,
                                                            height: erroriginalimgheight,
                                                        }),
                                                        drawLinesOfText([element + ' '].map(basefontDims.encodeText), {
                                                            x: left + contentlength + erroriginalimgwidth,
                                                            y: top + errfieldheight + newlinedistance + (-errheight),
                                                            width: errwidth,
                                                            height: errheight,
                                                            font: font_family_path,
                                                            size: (document.pagesInfo[fild.pageNo - 1][2] / fild.pageWidth) * (fontsize),
                                                            colorRgb: font_color_rgb,
                                                        })
                                                    )));
                                                    if (fild.radiobuttondisplay && fild.radiobuttondisplay == 'newline') contentlength = 0
                                                    else {
                                                        contentlength += errwidth + erroriginalimgwidth;
                                                    }
                                                })
                                            }
                                            break;
                                        default:
                                            console.log("Failed Please check it");
                                    }
                                }, function () {
                                    const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
                                    const filePath = __dirname + '/../../../uploads/' + document.encryptedid + dummyDateNumber + '.pdf';
                                    fs.writeFileSync(filePath, pdfBytes);
                                    genrateLogPDf(req.body, document, document.encryptedid + dummyDateNumber + '.pdf', result, async function (pdfPath) {
                                        if (req.body.createCompDocImg) {
                                            var encryptedid = document.encryptedid;
                                            var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                                            var pdfFile = __dirname + '/../../../uploads/' + pdfPath;
                                            if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                                            else {
                                                fs.readdir(imageFolder, (err, files) => {
                                                    if (err) throw err;
                                                    for (const file of files) {
                                                        fs.unlink(path.join(imageFolder, file), err => {
                                                            if (err) throw err;
                                                        });
                                                    }
                                                });
                                            }
                                            var child1 = childprocess.fork(__dirname + '/childprocess')
                                            var sshCommand = 'pdftoppm ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
                                            child1.on('message', async function (msg) {
                                                fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                                    //handling error
                                                    if (err) {
                                                        return console.log('Unable to scan directory: ' + err);
                                                    }
                                                    //listing all files using forEach
                                                    createCompletedDocImages(files, document, encryptedid)
                                                    var p = await uploadS3(__dirname + '/../../../uploads/' + pdfPath, 'downloads', true, function (awsdownloadpath) {
                                                        return res.send({ path: awsdownloadpath })
                                                    })
                                                });
                                                child1.kill()
                                            })
                                            child1.on('close', (code) => {
                                                console.log(`child process close all stdio with code ${code}`);
                                            });

                                            child1.on('exit', (code) => {
                                                console.log(`child process exited with code ${code}`);
                                            });
                                            child1.send({ sshCommand: sshCommand, filepath: pdfFile })
                                        } else if (req.body.sharethisdocument) {
                                            var createdFile = await shareThisDocument(document, pdfPath, req.body.filename)
                                            console.log(createdFile)
                                            return res.send(createdFile)
                                        } else
                                            var p = await uploadS3(__dirname + '/../../../uploads/' + pdfPath, 'downloads', true, function (awsdownloadpath) {
                                                if (document.uid.name) var name = document.uid.name
                                                if (document.uid.companyname) var name = document.uid.companyname
                                                if (req.body.email) {
                                                    var transporter = nodemailer.createTransport({
                                                        service: 'gmail',
                                                        secure: false,
                                                        port: 25, // use SSL
                                                        auth: {
                                                            user: 'noreply@cognitiveinnovations.in',
                                                            pass: 'Password1234*'
                                                        },
                                                        tls: {
                                                            rejectUnauthorized: false
                                                        }
                                                    });
                                                    var HelperOptions = {
                                                        from: '"DOCINTACT" <noreply@cognitiveinnovations.in>',
                                                        to: req.body.email,
                                                        subject: name + ' send File Attachment via Docintact',
                                                        attachments: [{
                                                            filename: req.body.name,
                                                            path: awsdownloadpath
                                                        }]
                                                    };
                                                    HelperOptions.html = '<div class="a3s aXjCH msg233836446190015510" id=":q2"><div style="width:100%!important;font-family:Helvetica,sans-serif;margin:0;padding:0;">' +
                                                        '<div class="m_233836446190015510mailer-layout-background" style="width:100%;padding-bottom:50px;">' +
                                                        '<table align="center" bgcolor="#eff2f7" border="0" cellpadding="0" cellspacing="0" class="m_233836446190015510layout-wrapper" style="border-collapse:collapse;width:600px!important;margin:30px auto;">' +
                                                        '<tbody>' +
                                                        '<tr bgcolor="#2579D0" class="m_233836446190015510header-row" style="color:white!important;height:60px;">' +
                                                        '<td style="border-collapse:collapse;">' +
                                                        '<table style="width:100%;border-collapse:collapse;">' +
                                                        '<tbody>' +
                                                        '<tr>' +
                                                        '<td class="m_233836446190015510header-sender-logo" style="border-collapse:collapse;margin:6px;" valign="middle"></td>' +
                                                        '<td style="width:100%;border-collapse:collapse;">' +
                                                        '<h2 class="m_233836446190015510header-title-text m_233836446190015510white-text-color" style="display:inline-block;font-weight:300;color:white;margin:17px 10px 13px 15px;">File Attachment</h2><span class="m_233836446190015510dh-white-wordmark" style="padding-right:20px;vertical-align:bottom;float:right;margin:21px 10px 0 0;">&nbsp;<span class="m_233836446190015510via-text m_233836446190015510white-text" style="color:white;">via</span> <a href="' + config.frontendUrl + '"  style="color:white;text-decoration:none;" target="_blank"><strong>DocIntact</strong></a></span></td>' +
                                                        '</tr>' +
                                                        '</tbody>' +
                                                        '</table>' +
                                                        '</td>' +
                                                        '</tr>' +
                                                        '<tr>' +
                                                        '<td class="m_233836446190015510body-content" style="border-collapse:collapse;padding:20px 30px 50px;"><span class="im"> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;"></h3> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + name + ' Sent Attachment Via Docintact  Click the below button to  Download the document</h3></span>' +
                                                        '<table class="m_233836446190015510two-column-preview" style="border-collapse:collapse;width:100%;">' +
                                                        '<tbody>' +
                                                        '<tr>' +
                                                        '<td class="m_233836446190015510no-border m_233836446190015510thumb-content-column" style="border-collapse:collapse;width:180px!important;max-width:180px!important;margin:10px;border:none;" valign="top">' +
                                                        '<a  href="' + awsdownloadpath + '" style="text-decoration:none;" target="_blank"><img class="m_233836446190015510document-thumbnail-image CToWUd fr-fic fr-dib" src="https://staging.docintact.com/assets/images/document.png" alt="test.pdf" style="outline: none; text-decoration: none; border: none; width: 150px !important; max-width: 150px !important;"></a></td>' +
                                                        '<td class="m_233836446190015510no-border m_233836446190015510body-content-column" style="border-collapse:collapse;width:inherit!important;margin:10px;border:none;" valign="top">' +
                                                        '<h3><strong></strong></h3><span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary"  href="' + awsdownloadpath + '" style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Download</a><div class="m_233836446190015510sent-by-text" style="font-size:14px;margin-top:16px;"><div class="m_233836446190015510text-muted"> <div>Sent  by ' + document.uid.email + '</div><div>Document : ' + req.body.name + '</div></div></div></span></td>' +
                                                        '</tr>' +
                                                        '</tbody>' +
                                                        '</table>' +
                                                        '</td>' +
                                                        '</tr>' +
                                                        '</tbody>' +
                                                        '</table>' +
                                                        '<div class="yj6qo ajU">' +
                                                        '<div aria-expanded="false" aria-label="Show trimmed content" class="ajR" data-tooltip="Show trimmed content" id=":qi" tabindex="0"><img class="ajT fr-fic fr-dib" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif"></div></div>' +
                                                        '<div class="adL">' +
                                                        '<div class="adm">' +
                                                        '<div class="ajR h4" id="q_8">' +
                                                        '<div class="ajT">' +
                                                        '<br>' +
                                                        '</div></div></div>' +
                                                        '<div class="h5">' +
                                                        '</div></div></div>' +
                                                        '<div class="adL">' +
                                                        '<br>' +
                                                        '</div></div>' +
                                                        '<div class="adL">' +
                                                        '<br>' +
                                                        '</div></div>'
                                                    transporter.sendMail(HelperOptions, function (err, info) {
                                                        if (err) { console.log("error occured when sending mail" + err) } else {
                                                            console.log("sent successfully")
                                                            return res.send({ path: awsdownloadpath });
                                                        }
                                                    });
                                                } else res.send({ path: awsdownloadpath });
                                            })
                                    })
                                })
                            });
                        }
                    });
                }
            });
        }
    });
}
// save as new document from downloaded pdf
async function shareThisDocument(refdocument, pdfpath, filename) {
    return new Promise((resolve, reject) => {
        Document.findOne({ _id: refdocument.id }, async function (err, document) {
            if (err) { return handleError(res, err); }
            if (!document) { return res.status(404).send('Not Found'); }
            var PdfPathInServer = __dirname + '/../../../uploads/' + pdfpath;
            var copdocument = {}
            document.copycount = document.copycount + 1;
            document.updated_at = Date.now();
            document.save(function (err) { });
            if (document.name) copdocument.name = document.name;
            if (document.originalfilename) copdocument.originalfilename = document.originalfilename;
            if (document.path) copdocument.path = document.path;
            if (document.size) copdocument.size = document.size;
            if (document.copycount) copdocument.copycount = 0;
            if (document.type) copdocument.type = document.type;
            if (document.parentid) copdocument.parentid = document.parentid;
            if (document.uid) copdocument.uid = refdocument.uid._id;
            if (document.organizationid) copdocument.organizationid = document.organizationid;
            if (document.folderid) copdocument.folderid = document.folderid;
            if (document.isFile) copdocument.isFile = document.isFile;
            if (document.value) copdocument.value = document.value;
            if (document.waterMark) copdocument.waterMark = document.waterMark;
            if (document.pagesInfo) copdocument.pagesInfo = document.pagesInfo;
            copdocument.parentid = document._id;
            delete copdocument._id
            if (filename) copdocument.name = filename + '.pdf';
            else copdocument.name = 'Copy of ' + document.name
            var encryptedid = encrypt(key, String(Date.now()));
            copdocument.encryptedid = encryptedid;
            Document.find({ uid: copdocument.uid, active: true, folderid: copdocument.folderid }).exec(async function (err, document_name) {
                if (document_name.length) {
                    if(document_name.some( x=>String(x.name)==String(copdocument.name)))
                    {
                        copdocument.name = await removeNameDuplication(document_name,copdocument.name, 1)

                    }
                }
           
            if (copdocument.type == 'application/pdf') {
                var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                var pdfFile = PdfPathInServer;
                if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                var child1 = childprocess.fork(__dirname + '/childprocess')
                var sshCommand = 'pdftoppm ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
                child1.on('message', async function (msg) {
                    var p = await uploadS3(PdfPathInServer, 'uploads', true, function (p) {
                        copdocument.path = p;
                        Document.create(copdocument, function (err, copydocument) {
                            if (err) { return res.status(500).send(err); }
                            if (!copydocument) { return console.log('Not Found'); }
                            fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                //handling error
                                if (err) {
                                    return console.log('Unable to scan directory: ' + err);
                                }
                                //listing all files using forEach
                                await createDocImages(files, copydocument, encryptedid)
                            });
                            return resolve(copydocument);
                        });
                    })
                    child1.kill()
                })
                child1.on('close', (code) => {
                    console.log(`child process close all stdio with code ${code}`);
                });

                child1.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                });
                child1.send({ sshCommand: sshCommand, filepath: pdfFile })
            }
        });
    })
})
};

/**
 * @api {post} /url  uploading file via url 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName urldata
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  Get a document 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.urldata = async function (req, res) {
    var url = require("url");
    var path = require("path");
    const download = require('download');
    if (req.body.value && req.body.value.name && req.body.value.id && req.body.value.link) {
        var filename = req.body.value.name
        var Extension = (path.extname(filename))
        var filepath = req.body.value.link
        var parsed = url.parse(req.body.value.link);
    } else {
        var parsed = url.parse(req.body.value);
        var filename = (path.basename(parsed.path));
        var Extension = (path.extname(filename))
        var originalFilename = filename.split('%')[0];
        var filepath = req.body.value
    }
    var fileNameWithoutExtension = encrypt(key, filename + Date.now());
    var encryptedname = fileNameWithoutExtension + Extension;
    var stats
    var file = {};
    var newfile
    if (Extension == '.pdf' || Extension == '.doc' || Extension == '.docx') {
        download(filepath).then(async data => {
            fs.writeFileSync('./uploads/' + encryptedname, data);
            if (Extension == '.doc' || Extension == '.docx') {
                var m = __dirname + '/../../../' + 'uploads/' + encryptedname;
                let shellcmd = require('shelljs')
                shellcmd.cd('uploads');
                if (!shellcmd.exec('lowriter --convert-to pdf ' + m).code) { console.log("Doc To PDf convertions is done"); }
                shellcmd.cd('..');
            }
            if (Extension == '.doc' || Extension == '.docx') {
                stats = fs.statSync('./uploads/' + fileNameWithoutExtension + '.pdf')
            } else stats = fs.statSync('./uploads/' + encryptedname)
            if (req.body.value && req.body.value.name && req.body.value.id && req.body.value.link) {
                newfile = req.body.value.name;
                if (Extension == '.doc' || Extension == '.docx') {
                    newfile = req.body.value.name.substring(0, req.body.value.name.length - Extension.length) + '.pdf'
                }
            } else {
                newfile = path.basename(parsed.path);
                if (Extension == '.doc' || Extension == '.docx') {
                    newfile = (path.basename(parsed.path)).substring(0, path.basename(parsed.path).length - Extension.length) + '.pdf'
                }
            }
            const pdf = await pdfjs.getDocument(__dirname + '/../../../' + 'uploads/' + fileNameWithoutExtension + '.pdf'); // PDF Path
            const numPages = pdf.numPages;
            const pageNumbers = Array.from(bereich(1, numPages));
            // Start reading all pages 1...numPages
            const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
            // Wait until all pages have been read
            const pages = await Promise.all(promises);
            var pagesInfo = []
            for (i = 0; i < numPages; i++) {
                pagesInfo[i] = pages[i]._pageInfo.view
            }
            file.pagesInfo = pagesInfo
            file.originalFilename = originalFilename;
            file.path = 'uploads/' + fileNameWithoutExtension + '.pdf';
            file.path = file.path.replace("../", "");
            file.path = file.path.replace("backend/", "");
            file.size = stats.size;
            file.type = 'application/pdf';
            file.name = newfile;
            file.copycount = 0;
            if (req.body.parentid) {
                file.folderid = req.body.parentid;
            }
            var encryptedid = encrypt(key, String(Date.now()));
            file.encryptedid = encryptedid,
                file.uid = req.user.id;
            if (file.type == 'application/pdf') {
                var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                var pdfFile = __dirname + '/../../../' + file.path;
                if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                if (numPages > 100) var c = '-f 1 -l 4';
                else var c = ''
                var sshCommand = 'pdftoppm ' + c + ' ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
                var child1 = childprocess.fork(__dirname + '/childprocess')
                child1.on('message', async function (msg) {
                    var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
                        file.path = p;
                        console.log("===================", req.user.id, file.folderid)
                        Document.find({ uid: req.user.id, active: true, folderid: file.folderid }).exec(async function (err, document_name) {
                            if (document_name.length) {
                                if(document_name.some( x=>String(x.name)==String(file.name)))
                                {
                                    file.name = await removeNameDuplication(document_name,file.name, 1)

                                }
                            }
                            Document.create(file, function (err, document) {
                                if (err) { return handleError(res, err); }
                                if (!document) { return res.status(404).send('Not Found'); }
                                fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                    //handling error
                                    if (err) {
                                        return console.log('Unable to scan directory: ' + err);
                                    }
                                    //listing all files using forEach
                                    await createDocImages(files, document, encryptedid)
                                    if (document && document.pagesInfo.length > 100) {
                                        req.params.id = document._id
                                        _this.createImages(req)
                                    }
                                });
                                return res.status(201).json(document);
                            });
                        })
                    });
                    child1.kill()
                })
                child1.on('close', (code) => {
                    console.log(`child process close all stdio with code ${code}`);
                });
                child1.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                });
                child1.send({ sshCommand: sshCommand, filepath: pdfFile })
            }

        }, (err) => {
            console.log(err.statusMessage)
            return res.status(404).json({ message: 'Invalid' });
        });
    } else {
        return res.status(400).json({ message: 'Invalid' });
    }
}
// To remove duplicate file names
  function removeNameDuplication(document,name, j) {
    return new Promise((resolve, reject) => {
        var search = name.split('.')[0];
        setTimeout(async () => {
            if (document.some( x=>String(x.name)==String(search + ' (' + j + ').pdf'))) {
                j++;
                resolve(await removeNameDuplication(document,search, j));
            } else {
                search = search + ' (' + j + ').pdf'
                resolve(search);
            }        });
          
        
    })

}


/**
 * @api {get} /createimages/:id  create a images for selected document 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName createImages
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json}  Get a document record
 * @apiError 500-InternalServerError SERVER error.
 */
exports.createImages = function (req, res) {
    console.log("*********************")
    Document.findById(req.params.id, async function (err, document) {
        var PdfPathInServer = __dirname + '/../../../uploads/' + Date.now() + '.pdf';
        await downloadToserver(document.path, PdfPathInServer);
        var dummyencryptedid = document.encryptedid + Date.now();
        var imageFolder = __dirname + '/../../../convertimages/' + dummyencryptedid;
        if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
        var child1 = childprocess.fork(__dirname + '/childprocess')
        var sshCommand = 'pdftoppm -f 5 ' + PdfPathInServer + ' convertimages/' + dummyencryptedid + '/pages -png'
        child1.send({ sshCommand: sshCommand, filepath: PdfPathInServer })
        child1.on('message', async function (msg) {
            fs.readdir(__dirname + '/../../../' + 'convertimages/' + dummyencryptedid, async function (err, files) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                //listing all files using forEach
                await createRemainingDocImages(files, document, document.encryptedid, dummyencryptedid)
                if (fs.existsSync(PdfPathInServer)) fs.unlinkSync(PdfPathInServer)
            });
            child1.kill()
            return res.status(201).json(document);
        })
        child1.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
        });

        child1.on('exit', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    });
}
// To create a images for selected document 
async function createRemainingDocImages(files, document, encryptedid, dummyencryptedid) {
    var index = 0;
    async.eachSeries(files, function (file, callback) {
        console.log('file', file)
        uploadS3(__dirname + '/../../../' + 'convertimages/' + dummyencryptedid + '/' + file, 'convertimages/' + encryptedid, true, function (p) {
            index++;
            var data = { documentid: document._id, pageNo: index + 4, path: p }
            Docimage.create(data, function (err, docimage) {
                if (err) { return handleError(res, err); }
                callback();
            });
        });
    });
}

/**
 * @api {post} /  Creates a new document in the document collection 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  Get a  document 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.create = async function (req, res) {
    var type = req.body.type;
    var pat = req.files.uploads[0].path;
    if (type == 'application/pdf') {
        var test = await _this.PasswordCheck(req);
    }
    if ((type == 'application/msword' || type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') || (type == 'application/pdf' && test == 'no password')) {
        console.log(type)
        if (type == 'application/pdf') {
            var hummus = require('hummus');
            var path = __dirname + '/../../../' + pat;
            var pdfReader = await hummus.createReader(path);

            if (pdfReader.isEncrypted()) {
                var Newpath = __dirname + '/../../../uploads/' + Math.floor((Math.random() * 100) + 1) + '.pdf';
                if (shell.exec('pdftk ' + path + ' output ' + Newpath).code) { }

                if (fs.existsSync(path)) fs.unlinkSync(path)
                fs.renameSync(Newpath, path);
            }
        }
        var file = {};
        if (type == 'application/msword' || type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            if (pat.length - (pat.lastIndexOf(".") + 1) == 3) {
                var newpat = pat.substring(0, pat.length - 3);
            } else if (pat.length - (pat.lastIndexOf(".") + 1) == 4) {
                var newpat = pat.substring(0, pat.length - 4);
            }
            var m = __dirname + '/../../../' + pat;
            var n = __dirname + '/../../../' + newpat + 'pdf';
            let shellcmd = require('shelljs')
            shellcmd.cd('uploads');
            if (!shellcmd.exec('lowriter --convert-to pdf ' + m).code) { console.log("Doc To PDf convertions is done"); }
            shellcmd.cd('..');
            if (pat.length - (pat.lastIndexOf(".") + 1) == 3) {
                pat = newpat + 'pdf'
                var name = req.files.uploads[0].originalFilename.substring(0, req.files.uploads[0].originalFilename.length - 3);
                var filename = name + 'pdf'
                req.files.uploads[0].type = 'application/pdf'
                req.files.uploads[0].originalFilename = filename;
                req.files.uploads[0].name = filename;
            } else if (pat.length - (pat.lastIndexOf(".") + 1) == 4) {
                pat = newpat + 'pdf'
                var name = req.files.uploads[0].originalFilename.substring(0, req.files.uploads[0].originalFilename.length - 4);
                var filename = name + 'pdf'
                req.files.uploads[0].type = 'application/pdf'
                req.files.uploads[0].originalFilename = filename;
                req.files.uploads[0].name = filename;
            }
        }
        const pdf = await pdfjs.getDocument(__dirname + '/../../../' + pat); // PDF Path
        const numPages = pdf.numPages;
        const pageNumbers = Array.from(bereich(1, numPages));
        // Start reading all pages 1...numPages
        const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
        // Wait until all pages have been read
        const pages = await Promise.all(promises);
        var pagesInfo = []
        for (i = 0; i < numPages; i++) {
            //   console.log(pages[i]._pageInfo.view);
            pagesInfo[i] = pages[i]._pageInfo.view
        }
        file.pagesInfo = pagesInfo
        file.originalFilename = req.files.uploads[0].originalFilename;
        file.path = pat;
        file.path = file.path.replace("../", "");
        file.path = file.path.replace("backend/", "");
        file.size = req.files.uploads[0].size;
        file.type = req.files.uploads[0].type;
        file.name = req.files.uploads[0].name;
        if (req.body.folderid) file.folderid = req.body.folderid;
        var encryptedid = encrypt(key, String(Date.now()));
        file.encryptedid = encryptedid,
            file.uid = req.user.id;
        file.copycount = 0;
        Document.find({uid: req.user.id, active: true, folderid: file.folderid }).exec(async function (err, document_name) {
            if (document_name.length) {
                if(document_name.some( x=>String(x.name)==String(file.name)))
                {
                    file.name = await removeNameDuplication(document_name,file.name, 1)

                }
            }
        if (file.type == 'application/pdf') {
            var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
            var pdfFile = __dirname + '/../../../' + file.path;
            if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
            if (numPages > 100) var c = '-f 1 -l 4';
            else var c = ''
            var sshCommand = 'pdftoppm ' + c + ' ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
            var child1 = childprocess.fork(__dirname + '/childprocess')
            child1.on('message', async function (msg) {
                var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
                    file.path = p;
                    Document.create(file, function (err, document) {
                        if (err) { return handleError(res, err); }
                        if (!document) { return res.status(404).send('Not Found'); }
                        fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                            //handling error
                            if (err) {
                                return console.log('Unable to scan directory: ' + err);
                            }
                            if (req.files && req.files.uploads[0] && req.files.uploads[0].path && fs.existsSync(req.files.uploads[0].path)) fs.unlinkSync(req.files.uploads[0].path)
                            //listing all files using forEach
                            await createDocImages(files, document, encryptedid)
                            if (document && document.pagesInfo.length > 100) {
                                req.params.id = document._id
                                _this.createImages(req)
                            }
                        });
                        return res.status(201).json(document);
                    });
                });
                child1.kill()
            })

            child1.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);
            });

            child1.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
            });
            child1.send({ sshCommand: sshCommand, filepath: pdfFile })
        }

    })
    } else if (test == 'protected') {
        res.status(200).json({ "Message": "PDF is password protected, please enter password", "files": req.files })
    }
};
/**
 * @api {post} /verifydocument  verification of document 
 * @apiName verifydocument
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {String}  
 * @apiError 500-InternalServerError SERVER error.
 */
exports.verifydocument = async function (req, res) {
    if (req.files && req.files.uploads && req.files.uploads.path) {
        var filepath = __dirname + '/../../../' + req.files.uploads.path;
        const signer = require('node-signpdf');
        const resultbuffer = fs.readFileSync(filepath);
        const signObj = new signer.SignPdf();
        const verifyResult = signObj.verify(resultbuffer);
        console.log(verifyResult)
        if (verifyResult && verifyResult.verified) {
            res.status(200).json(verifyResult)
        } else res.status(200).json(verifyResult)
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    } else {
        res.status(200).json({ "Message": "File not uploaded" })
    }
}
/**
 * @api {get} /revokeFile/:docId  Revoking a document
 * @apiName RevokeFile
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {String}  
 */
exports.RevokeFile = function (req, res) {
    var uploads = __dirname + '/../../../uploads/' + req.params.docId + '/';
    if (!shell.exec("cd " + uploads + ";openssl ca -config " + uploads + "crl_openssl.conf -revoke " + uploads +
        "certificat.crt -crl_reason keyCompromise;openssl ca -gencrl -config " + uploads +
        "crl_openssl.conf -out " + uploads + "certificate.crl").code) {
        return res.status(200).json({ data: "Revoked" });
    } else {
        return res.status(200).json({ data: "Not revoked successfully" })
    }
}
/**
 * @api {get} /checkRevokeFileStatus/:docId  To check the revocation status of document
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName checkRevokeFileStatus
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {String}  
 */
exports.checkRevokeFileStatus = function (req, res) {
    var uploads = __dirname + '/../../../uploads/' + req.params.docId + '/';
    let serial = shell.exec("openssl x509 -in " + uploads + "certificat.crt -noout -serial").stdout;
    if (serial) {
        if (!shell.exec("cd " + uploads + ";openssl crl -inform pem -text -in " + uploads + "certificate.crl | grep " + serial.split('=')[1]).code) {
            return res.status(200).json({ data: "Revoked" });
        } else {
            return res.status(200).json({ data: "Unrevoked" });
        }
    } else {
        return res.status(200).json({ data: "No serial Number" });
    }
}
// For storing document images in docimage collection
async function createDocImages(files, document, encryptedid) {
    console.log('#########################################')
    console.log('file', files.length)
    var index = 0;
    if (files && files.length == 0) return false;
    else
        async.eachSeries(files, function (file, callback) {
            uploadS3(__dirname + '/../../../' + 'convertimages/' + encryptedid + '/' + file, 'convertimages/' + encryptedid, true, function (p) {
                index++;
                Document.count({}, function (err, dCount) {
                    if (index == 1) {
                        var crlurl = 'https://nodestage.docintact.com/uploads/' + document._id + '/certificate.crl';
                        document.thumbnail = p
                        var expirydate = new Date(moment().add(365, 'days').format())
                        const certDetails = selfCert({
                            attrs: {
                                commonName: 'CognitiveInnovations.in',
                                countryName: 'IN',
                                stateName: 'AP',
                                locality: 'VSP',
                                orgName: 'Cognitive Innovations',
                                shortName: document._id
                            },
                            bits: 2048,
                            SerialNo: "'" + dCount + "'",
                            CRLURL: "'" + crlurl + "'",
                            expires: expirydate
                        })
                        document.privateKey = certDetails.privateKey;
                        document.publicKey = certDetails.publicKey;
                        document.certificate = certDetails.certificate;
                        document.expirydate = expirydate;
                        document.SerialNo = dCount;
                        var uploads = __dirname + '/../../../uploads/';
                        var path = uploads + document._id;
                        fs.mkdirSync(path)
                        fs.writeFileSync(path + '/certificat.crt', certDetails.certificate);
                        fs.writeFileSync(path + '/private_key.key', certDetails.privateKey);
                        if (!shell.exec("cd " + path + "; cp " + uploads + "crl_openssl.conf " + path + "/; touch index.txt index.txt.attr; echo 00 > pulp_crl_number.txt; openssl ca -gencrl -config crl_openssl.conf -out certificate.crl;").code) { }
                        document.save(function (err, updatedocument) {
                            if (err) { return handleError(res, err); }
                        });
                    }
                    Docimage.create({ documentid: document._id, pageNo: index, path: p }, function (err, docimage) {
                        if (err) { return handleError(res, err); }
                        callback();
                    });
                });
            });
        });
}
// For storing document complete images in docimage collection
async function createCompletedDocImages(files, document, encryptedid) {
    var index = 0;
    async.eachSeries(files, function (file, callback) {
        uploadS3(__dirname + '/../../../' + 'convertimages/' + encryptedid + '/' + file, 'convertimages/' + encryptedid, true, function (p) {
            index++;
            if (index == 1) {
                Document.findById(document._id, function (err, currentdocument) {
                    currentdocument.completedDocPreview = p
                    currentdocument.save(function (err, updatedocument) {
                        if (err) { return handleError(res, err); }
                    });
                })
            }
            var data = { documentid: document._id, versionid: document.versionid, pageNo: index, path: p, originalImg: false }
            Docimage.create(data, function (err, docimage) {
                if (err) { return handleError(res, err); }
                callback();
            });
        });
    });
}
// To create certificate keys
async function createDocCertificateKeys(document) {
    var expirydate = new Date(moment().add(365, 'days').format())
    const certDetails = selfCert({
        attrs: {
            commonName: 'CognitiveInnovations.in',
            countryName: 'IN',
            stateName: 'AP',
            locality: 'VSP',
            orgName: 'Cognitive Innovations',
            shortName: document._id
        },
        bits: 2048,
        expires: expirydate
    })
    document.privateKey = certDetails.privateKey;
    document.publicKey = certDetails.publicKey;
    document.certificate = certDetails.certificate;
    document.expirydate = expirydate;
    document.save(function (err, updatedocument) {
        if (err) { return handleError(res, err); }
        return updatedocument
    });
}
// To attach digital certificate to pdf
async function attachDigitalCertificateToPdf(filePath, document, DownloadDetails, callback) {
    if (document && document._id) {
        const signer = require('node-signpdf');
        const { DEFAULT_BYTE_RANGE_PLACEHOLDER } = require('node-signpdf');
        const PDFDocumentFactory = require('pdf-lib').PDFDocumentFactory;
        const PDFDocumentWriter = require('pdf-lib').PDFDocumentWriter;
        const PDFDictionary = require('pdf-lib').PDFDictionary;
        const PDFName = require('pdf-lib').PDFName;
        const PDFArray = require('pdf-lib').PDFArray;
        const PDFNumber = require('pdf-lib').PDFNumber;
        const PDFHexString = require('pdf-lib').PDFHexString;
        const PDFString = require('pdf-lib').PDFString;
        const PDFArrayCustom = require('./PDFArrayCustom');
        var pdfRandomNo = String(Date.now())
        if (document && document._id && !(document.privateKey && document.publicKey && document.certificate && document.expirydate)) {
            await createDocCertificateKeys(document)
        }
        // console.log('----',document)
        fs.writeFile('./uploads/' + document._id + pdfRandomNo + '.crt', document.certificate, async function (err) {
            fs.writeFile('./uploads/' + document._id + pdfRandomNo + '.key', document.privateKey, async function (err) {
                if (!shell.exec('openssl pkcs12 -export -out ' + './uploads/' + document._id + pdfRandomNo + '.pfx -inkey ' + './uploads/' + document._id + pdfRandomNo + '.key -in ' + './uploads/' + document._id + pdfRandomNo + '.crt' + ' -passout pass: ').code) {
                    // This length can be derived from the following `node-signpdf` error message:
                    //   ./node_modules/node-signpdf/dist/signpdf.js:155:19
                    console.log('========After create pfx file============')
                    //pdf buffer need to be sign
                    const pdfBuffer = fs.readFileSync(filePath);
                    const SIGNATURE_LENGTH = 4322;
                    const d = moment(new Date()).add(-1, 'days').format("YYYYMMDD")
                    const pdfBytes = new Uint8Array(pdfBuffer);
                    const pdfDoc = PDFDocumentFactory.load(pdfBytes);
                    const signatureDict = PDFDictionary.from({
                        Type: PDFName.from('Sig'),
                        Filter: PDFName.from('Adobe.PPKLite'),
                        SubFilter: PDFName.from('adbe.pkcs7.detached'),
                        ByteRange: new PDFArrayCustom(
                            [
                                PDFNumber.fromNumber(0),
                                PDFName.from(DEFAULT_BYTE_RANGE_PLACEHOLDER),
                                PDFName.from(DEFAULT_BYTE_RANGE_PLACEHOLDER),
                                PDFName.from(DEFAULT_BYTE_RANGE_PLACEHOLDER),
                            ],
                            pdfDoc.index,
                        ),
                        Contents: PDFHexString.fromString('A'.repeat(SIGNATURE_LENGTH)),
                        Reason: PDFString.fromString('We need your signature for reasons...'),
                        M: PDFString.fromString('D:' + d + '091657Z'),
                    },
                        pdfDoc.index,
                    );
                    const signatureDictRef = pdfDoc.register(signatureDict);
                    const widgetDict = PDFDictionary.from({
                        Type: PDFName.from('Annot'),
                        Subtype: PDFName.from('Widget'),
                        FT: PDFName.from('Sig'),
                        Rect: PDFArray.fromArray(
                            [
                                PDFNumber.fromNumber(0),
                                PDFNumber.fromNumber(0),
                                PDFNumber.fromNumber(0),
                                PDFNumber.fromNumber(0),
                            ],
                            pdfDoc.index,
                        ),
                        V: signatureDictRef,
                        T: PDFString.fromString('Signature1'),
                        F: PDFNumber.fromNumber(4),
                        P: pdfDoc.catalog.Pages.get('Kids').get(0),
                    },
                        pdfDoc.index,
                    );
                    const widgetDictRef = pdfDoc.register(widgetDict);
                    // Add our signature widget to the first page
                    const pages = pdfDoc.getPages();
                    pages[0].set('Annots', PDFArray.fromArray([widgetDictRef], pdfDoc.index));
                    // Create an AcroForm object containing our signature widget
                    const formDict = PDFDictionary.from({
                        SigFlags: PDFNumber.fromNumber(3),
                        Fields: PDFArray.fromArray([widgetDictRef], pdfDoc.index),
                    },
                        pdfDoc.index,
                    );
                    pdfDoc.catalog.set('AcroForm', formDict);
                    const modifiedPdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc, {
                        useObjectStreams: false,
                    });

                    const modifiedPdfBuffer = Buffer.from(modifiedPdfBytes);
                    const p12Buffer = fs.readFileSync('./uploads/' + document._id + pdfRandomNo + '.pfx');
                    const signObj = new signer.SignPdf();
                    // let password=''
                    // if (document && document.DownloadDetails && document.DownloadDetails.pdfPin && document.DownloadDetails.pdfPin.length > 0) password=document.DownloadDetails.pdfPin
                    const signedPdfBuffer = signObj.sign(modifiedPdfBuffer, p12Buffer, {
                        passphrase: '',
                    });
                    if (fs.existsSync('./uploads/' + document._id + pdfRandomNo + '.crt')) fs.unlinkSync('./uploads/' + document._id + pdfRandomNo + '.crt')
                    if (fs.existsSync('./uploads/' + document._id + pdfRandomNo + '.key')) fs.unlinkSync('./uploads/' + document._id + pdfRandomNo + '.key')
                    if (fs.existsSync('./uploads/' + document._id + pdfRandomNo + '.pfx')) fs.unlinkSync('./uploads/' + document._id + pdfRandomNo + '.pfx')
                    var tempFile = fs.createWriteStream(filePath);
                    tempFile.on('open', function (fd) {
                        tempFile.write(signedPdfBuffer, function (err) {
                            callback(filePath)
                        });
                    });
                }
            })
        })
    } else callback(filePath)
}

// Upload files to S3
async function uploadS3(filePath, folderName, deleteFile, callback) {

    var s3 = new AWS.S3({useAccelerateEndpoint: true});
    var params = {
        Bucket: 'docintact',
        Body: fs.createReadStream(filePath),
        Key: folderName + "/" + Date.now() + "_" + path.basename(filePath)
    };
    s3.upload(params, function (err, data) {
        //handle error
        if (err) {
            console.log("Error", err);
        }
        //success
        if (data) {
            if (deleteFile)
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
            console.log("Uploaded in:", data.Location);
            if (callback) callback(data.Location);
            else return data.Location;
        }
    });
}
// Delete  from S3
async function removeS3(filePath, folderName) {

    var s3 = new AWS.S3({useAccelerateEndpoint: true});
    //configuring parameters
    var params = {
        Bucket: 'docintact',
        Key: folderName + '/' + path.basename(filePath)
    };
    try {
        s3.deleteObject(params, function (err, deldata) {
            if (err) console.log(err, err.stack); // error
            else console.log(filePath + '- file Deleted'); // deleted
        });
    } catch (err) {
        console.log("File not Found ERROR : " + err.code)
    }
}
// Delete folder from S3 
function removeS3folder(awspath, callback) {

    var s3 = new AWS.S3({useAccelerateEndpoint: true});
    var params = {
        Bucket: 'docintact',
        Prefix: awspath
    };
    s3.listObjects(params, function (err, data) {
        if (err) return callback(err);
        if (data.Contents.length == 0) return callback(awspath + '- Empty Folder');
        params = { Bucket: 'docintact' };
        params.Delete = { Objects: [] };
        data.Contents.forEach(function (content) {
            params.Delete.Objects.push({ Key: content.Key });
        });
        s3.deleteObjects(params, function (err, deldata) {
            if (err) return callback(err);
            if (data.Contents.length > 1000) removeS3folder(awspath, callback);
            else return callback(awspath + '- Folder Deleted');
        });
    });
}
// Copy file from S3
async function copyS3(awssrcpath, awsdestpath, callback) {

    var s3 = new AWS.S3({useAccelerateEndpoint: true});
    var params = {
        Bucket: "docintact",
        CopySource: 'docintact/' + awssrcpath,
        Key: awsdestpath
    };
    s3.copyObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        if (data) {
            console.log("Copied in:", data.Location);
            if (callback) callback(data.Location);
            else return data.Location;
        }
    });
}
// ============================== download function =================================
/**
 * @api {get} /downloadfiles/:id  To extract the files from zip 
 * @apiName downloadfiles
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {array}  get files from zip
 */
exports.downloadfiles = function (req, res) {
    var archiver = require('archiver');
    Document.findById(req.params.id, function (err, document) {
        var fileData = document;
        if (fileData) {
            var output = fs.createWriteStream(__dirname + '/../../../' + 'uploads/' + fileData.name + '.zip');
            var archive = archiver('zip');
            output.on('close', function () {
                res.download(__dirname + '/../../../' + 'uploads/' + fileData.name + '.zip', fileData.name + '.zip')
            });
            archive.on('error', function (err) {
                throw err;
            });
            archive.pipe(output);
            var file = fileData.path;
            archive.append(fs.createReadStream(file), { name: fileData.name })
            archive.finalize();
        } else {
            Folder.findById(req.params.id, function (err, folder) {
                var folderData = folder;
                var output = fs.createWriteStream(__dirname + '/../../../' + 'uploads/' + folderData.name + '.zip');
                var archive = archiver('zip');
                output.on('close', function () {
                    res.download(__dirname + '/../../../' + 'uploads/' + folderData.name + '.zip', folderData.name + '.zip')
                });
                var directory = 'uploads/' + folderData.name;
                fs.mkdir(directory, function (err, res) { })
                Document.find({ folderid: folderData._id }).exec(function (err, file) {
                    file.forEach(fileInfo => {
                        var oldpath = __dirname + '/../../../' + fileInfo.path;
                        var newpath = __dirname + '/../../../' + directory + '/' + fileInfo.name;
                        fs.copyFile(oldpath, newpath, (err) => { });
                    })
                    makedirectory(folderData, directory, function (results) {
                        archive.on('error', function (err) {
                            throw err;
                        });
                        archive.pipe(output);
                        var file1 = directory;
                        archive.directory(file1, folderData.name)
                        archive.finalize();
                    });
                })
            });
        }
    });
}
// To create directory for nested folder
function makedirectory(folderData, directory, callback_one) {
    Folder.find({ parentid: folderData._id }).exec(function (err, folders) {
        if (folders && folders.length) {
            async.each(folders, function (elementss, elementssCB) {
                elementss.dir = directory + '/' + elementss.name;
                fs.mkdir(elementss.dir, function (err, res) { });
                Document.find({ folderid: elementss._id }).exec(function (err, file) {
                    if (err) return elementssCB(err)
                    else {
                        async.each(file, function (fileInfo, fileInfoCB) {
                            var old = __dirname + '/../../../' + fileInfo.path;
                            var news = __dirname + '/../../../' + elementss.dir + '/' + fileInfo.name;
                            fs.copyFile(old, news, (err) => { });
                            fileInfoCB();
                        }, function (err) {
                            if ((folders.length - 1) == folders.indexOf(elementss)) {
                                async.each(folders, function (elementss, elementsssCB) {
                                    return makedirectory(elementss, elementss.dir, callback_one)
                                }, function (err) { })
                            }
                        })
                    }
                })
            }, function (err) { })
        } else {
            return callback_one()
        }
    })
}
/**
 * @api {post} /extractzipfiles  extract Zip 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName extractzipfiles
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {array}  extract zip
 */
exports.extractzipfiles = function (req, res) {
    var config = require('../../config/environment');
    var timeStamp = Math.round((new Date()).getTime() / 1000);
    var newfolder = 'uploads/' + timeStamp;
    var zfilePath = req.body.path;
    var parentreslut = 0
    var parentid
    // reading archives
    var zip = new AdmZip(zfilePath);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
    zipEntries.forEach(function (zipEntry) {
        // console.log(zipEntry.toString()); // outputs zip entries information
        var patharray = zipEntry.entryName.split('/')
        extractfolder(patharray, parentreslut, req, zipEntry, zfilePath)
    });
}
// to extract files from zip and create documents
async function extractfolder(patharray, parentreslut, req, entry, zfilePath) {
    var zip = new AdmZip(zfilePath);
    var parentid
    var index = 0
    return new Promise(async (resolve, reject) => {
        for (const element of patharray) {
            if (index != patharray.length - 1) {
                await Folder.findOne({ $and: [{ userid: req.user._id }, { name: element }] }, { parentid: parentreslut }).exec(function (err, folder) {
                    if (entry.isDirectory) patharray.pop()
                    if (!folder) {
                        if (parentreslut) parentid = parentreslut
                        var foldercreate = {
                            name: element,
                            userid: req.user._id,
                            parentid: parentid
                        }
                        Folder.create(foldercreate, function (err, folders) {
                            parentreslut = folders._id;
                            resolve(true)

                        });
                    } else {
                        resolve(true)
                    }
                });
            }
            if (index == patharray.length - 1) {
                if (!entry.isDirectory) console.log('sssssssssssss')
                zip.extractEntryTo(entry, __dirname + '/../../../uploads/', false, true);
                var file = {};
                //FOR PAGE INFO
                const pdfjs = require('pdfjs-dist');
                const bereich = require('bereich');
                const pdf = await pdfjs.getDocument(__dirname + '/../../../' + 'uploads/' + entry.name); // PDF Path
                const numPages = pdf.numPages;
                const pageNumbers = Array.from(bereich(1, numPages));
                // Start reading all pages 1...numPages
                const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
                // Wait until all pages have been read
                const pages = await Promise.all(promises);
                var pagesInfo = []
                for (i = 0; i < numPages; i++) {
                    console.log(pages[i]._pageInfo.view);
                    pagesInfo[i] = pages[i]._pageInfo.view
                }
                file.pagesInfo = pagesInfo
                // for page info
                file.path = "uploads/" + entry.name
                file.type = 'application/pdf';
                file.name = entry.name;
                if (parentreslut) file.folderid = parentreslut
                // file.zipfileid = req.body._id;
                var encryptedid = encrypt(key, String(Date.now()));
                // file.link = "http://localhost:4200/document/:" + encryptedid,
                file.encryptedid = encryptedid,
                    file.uid = req.user.id;
                file.copycount = 0;
                Document.create(file, function (err, document) {
                    resolve(true)

                });
            }
            index++;
        }
    })


}
/**
 * @api {post} /zipuploads  upload a zip file
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getCurrFieldVal
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.zipuploads = async function (req, res) {
    var AdmZip = require('adm-zip');
    var config = require('../../config/environment');
    var timeStamp = Math.round((new Date()).getTime() / 1000);
    var newfolder = 'uploads/' + timeStamp;
    var notpdf = true;
    var fileempty = true
    var file = {};
    var total = 0;
    console.log(req.files.uploads[0])
    var zip = new AdmZip(req.files.uploads[0].path);
    var zipEntries = zip.getEntries();
    var result = [];
    zipEntries.forEach(function (zipEntry) {
        if (zipEntry.isDirectory == false) {
            total = total + 1;
        }
        var filename = zipEntry.name;
        var filepath = zipEntry.entryName;
        var fileContent = zip.readAsText(filepath)
        var file = path.extname(filepath.toLowerCase())
        if (file == '.pdf') {
            result.push(filepath)
        }
    });
    if (result.length < total && result.length != 0) {
        console.log("contains other types of files")
        return res.status(500).json("contains other types of files");
    } else if (result.length == total) {
        //FOR PAGE INFO
        const pdfjs = require('pdfjs-dist');
        const bereich = require('bereich');
        const pdf = await pdfjs.getDocument(__dirname + '/../../../' + req.files.uploads[0].path); // PDF Path
        const numPages = pdf.numPages;
        const pageNumbers = Array.from(bereich(1, numPages));
        // Start reading all pages 1...numPages
        const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
        // Wait until all pages have been read
        const pages = await Promise.all(promises);
        var pagesInfo = []
        for (i = 0; i < numPages; i++) {
            console.log(pages[i]._pageInfo.view);
            pagesInfo[i] = pages[i]._pageInfo.view
        }
        file.pagesInfo = pagesInfo
        file.originalFilename = req.files.uploads[0].originalFilename;
        file.path = req.files.uploads[0].path;
        file.path = file.path.replace("../", "");
        file.path = file.path.replace("backend/", "");
        file.size = req.files.uploads[0].size;
        file.type = req.files.uploads[0].type;
        file.name = req.files.uploads[0].name;
        if (req.body.folderid) file.folderid = req.body.folderid;
        var encryptedid = encrypt(key, String(Date.now()));
        file.encryptedid = encryptedid,
            file.uid = req.user.id;
        file.copycount = 0;
        var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
            file.path = p;
            console.log(file);
            Document.create(file, function (err, document) {
                if (err) { return handleError(res, err); }
                if (!document) { return res.status(404).send('Not Found'); }
                fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                    //handling error
                    if (err) {
                        return console.log('Unable to scan directory: ' + err);
                    }
                    //listing all files using forEach
                    await createDocImages(files, document, encryptedid)
                });
                return res.status(201).json(document);
            });
        });
    } else if (result.length == 0) {
        console.log("zip file contains empty directory")
        return res.status(500).json("zip file contains empty directory")
    }
};

// =============================================================================
/**
 * @api {post} /multimakecopy  copy multiple documents
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multimakecopy
 * @apiParam {array}
 * @apiGroup document
 * @apiSuccess {String}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
// ======================= Make A Copy =================================
exports.multimakecopy = function (req, res) {
    async.each(req.body.files, function (eachFile, eachFileCB) {
        Document.findOne({ _id: eachFile._id }, async function (err, document) {
            if (err) { return handleError(res, err); }
            if (!document) { return res.status(404).send('Not Found'); }
            var PdfPathInServer = __dirname + '/../../../uploads/' + Date.now() + '.pdf';
            await downloadToserver(document.path, PdfPathInServer);
            var copdocument = {}
            document.copycount = document.copycount + 1;
            document.updated_at = Date.now();
            document.save(function (err,doc) { 
            });
            if (document.name) copdocument.name = document.name;
            if (document.originalfilename) copdocument.originalfilename = document.originalfilename;
            if (document.size) copdocument.size = document.size;
            if (document.copycount) copdocument.copycount = 0;
            if (document.type) copdocument.type = document.type;
            if (document.uid) copdocument.uid = req.user._id;
            if (document.organizationid) copdocument.organizationid = document.organizationid;
            if (document.folderid) copdocument.folderid = document.folderid;
            if (document.isFile) copdocument.isFile = document.isFile;
            if (document.value) copdocument.value = document.value;
            if (document.waterMark) copdocument.waterMark = document.waterMark;
            if (document.pagesInfo) copdocument.pagesInfo = document.pagesInfo;
            if(document.thumbnail) copdocument.thumbnail= document.thumbnail
            copdocument.parentid = document._id;
            delete copdocument._id
            copdocument.name = 'Copy of ' + document.name
            var encryptedid = encrypt(key, String(Date.now()));
            copdocument.encryptedid = encryptedid;
            if (copdocument.type == 'application/pdf') {
                var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                    var p = await uploadS3(PdfPathInServer, 'uploads', true, function (p) {
                        copdocument.path = p;
                        Document.create(copdocument, async function (err, copydocument) {
                        // console.log(copdocument,'aftercreate')
                            if (err) { return handleError(res, err); }
                            if (!copydocument) { return res.status(404).send('Not Found'); }
                            Docimage.find({documentid:copydocument.parentid}, async function (err, docsimages) {
                                // console.log(,docsimages)
                                async.each(docsimages, function (element, callback) {
                                    var data ={}
                                    data.pageNo =  docsimages.indexOf(element)+1,
                                    data.documentid = copydocument._id
                                    data.path = element.path
                                    Docimage.create(data, function (err, docimage) {
                                        console.log("{{{{{",docimage)
                                        if (err) { return handleError(res, err); }
                                    });
                                  
                            });
                            })
                            eachFileCB();
                        });
                    })
                
            } 
        });
    }, function (err) {
        if (err) {
            return res.status(200).json(err)
        } else return res.status(200).json("success")
    })

};
/**
 * @api {post} /makeacopy copy single document 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName makeacopy
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}   
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.makeacopy = function (req, res) {
    Document.findOne({ _id: req.body.id }, async function (err, document) {
        if (err) { return handleError(res, err); }
        if (!document) { return res.status(404).send('Not Found'); }
        var PdfPathInServer = __dirname + '/../../../uploads/' + Date.now() + '.pdf';
        await downloadToserver(document.path, PdfPathInServer);
        var copdocument = {}
        document.copycount = document.copycount + 1;
        document.updated_at = Date.now();
        document.save(function (err) { });
        if (document.name) copdocument.name = document.name;
        if (document.originalfilename) copdocument.originalfilename = document.originalfilename;
        if (document.path) copdocument.path = document.path;
        if (document.size) copdocument.size = document.size;
        if (document.copycount) copdocument.copycount = 0;
        if (document.type) copdocument.type = document.type;
        if (document.parentid) copdocument.parentid = document.parentid;
        if (document.uid) copdocument.uid = req.user._id;
        if (document.organizationid) copdocument.organizationid = document.organizationid;
        if (document.folderid) copdocument.folderid = document.folderid;
        if (document.isFile) copdocument.isFile = document.isFile;
        if (document.value) copdocument.value = document.value;
        if (document.waterMark) copdocument.waterMark = document.waterMark;
        if (document.pagesInfo) copdocument.pagesInfo = document.pagesInfo;
        if (document.name) copdocument.name = document.name;
        copdocument.parentid = document._id;
        delete copdocument._id
        copdocument.name = 'Copy of ' + document.name
        var encryptedid = encrypt(key, String(Date.now()));
        copdocument.encryptedid = encryptedid;
        if (copdocument.type == 'application/pdf') {
            var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
            var pdfFile = PdfPathInServer;
            if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
            var child1 = childprocess.fork(__dirname + '/childprocess')
            var sshCommand = 'pdftoppm ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
            child1.send({ sshCommand: sshCommand, filepath: PdfPathInServer })
            child1.on('message', async function (msg) {
                var p = await uploadS3(PdfPathInServer, 'uploads', true, function (p) {
                    copdocument.path = p;
                    Document.find({uid: req.user.id, active: true, folderid: copdocument.folderid }).exec(async function (err, document_name) {
                        if (document_name.length) {
                            if(document_name.some( x=>String(x.name)==String(copdocument.name)))
                            {
                                copdocument.name = await removeNameDuplication(document_name,copdocument.name, 1)

                            }
                        }
                    Document.create(copdocument, function (err, copydocument) {
                        if (err) { return handleError(res, err); }
                        if (!copydocument) { return res.status(404).send('Not Found'); }
                        fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                            //handling error
                            if (err) {
                                return console.log('Unable to scan directory: ' + err);
                            }
                            //listing all files using forEach
                            await createDocImages(files, copydocument, encryptedid)
                        });
                        return res.status(201).json(copydocument);
                    });
                })
                })
                child1.kill()
            })
            child1.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);
            });

            child1.on('exit', (code) => {
                console.log(`child process exited with code ${code}`);
            });
        }
    });
};
/**
 * @api {get} /getcontent/:fileid (or) /getfilecontent/:fileid  Getting the HTML file content. 
 * @apiName getContent
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  
 */
exports.getContent = function (req, res) {
    var t = fs.readFileSync(__dirname + '/../../../convertedhtml/' + req.params.fileid + '.html', "utf8")
    var t = t + '<style> #page-container { background-color: #fff !important; background-image: none !important; overflow: unset !important}</style>';
    console.log(data)
    res.send({ data: t });
};
/**
 * @api {put} /:id   Updates an existing document in the DB 
 * @apiName update
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    console.log(req.body)
    Document.findById(req.params.id, function (err, document) {
        if (err) { return handleError(res, err); }
        if (!document) { return res.status(404).send('Not Found'); }
        var updated = _.merge(document, req.body);
        updated.updated_at = Date.now();
        if (req.body.favoriteid) {
            console.log(req.body.favoriteid)
            updated.favoriteid = req.body.favoriteid;
        }
        if (req.body.waterMark) {
            updated.waterMark = null
            updated.waterMark = req.body.waterMark
        }
        updated.save(function (err, updatedocument) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(updatedocument);
        });
    });
};
/**
 * @api {put} /move/update/:id  move document 
 * @apiName MOveOnupdate
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json}  updated document 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.MOveOnupdate = function (req, res) {
    if (req.body.element._id) { delete req.body.element_id; }
    console.log(req.body)
    Document.findById(req.params.id, function (err, document) {
        if (err) { return handleError(res, err); }
        if (!document) { return res.status(404).send('Not Found'); }
        var updated = _.merge(document, req.body.element);
        updated.updated_at = Date.now();
        if (req.body.MoveTo == 'root') updated.folderid = undefined;
        if (req.body.favoriteid) {
            console.log(req.body.favoriteid)
            updated.favoriteid = req.body.favoriteid;
        }
        if (req.body.waterMark) {
            updated.waterMark = null
            updated.waterMark = req.body.waterMark
        }
        updated.save(function (err, updatedocument) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(updatedocument);
        });
    });
};
/**
 * @api {post} /restore  restore deleted document 
 * @apiName getCurrFieldVal
 * @apiParam {array}
 * @apiGroup document
 * @apiSuccess {String}  
 * @apiError 500-InternalServerError SERVER error.
 */
exports.restore = function (req, res) {
    var files = req.body
    async.each(files, function (element, callback) {
        SharingPeople.update({ $and: [{ fromid: element.uid }, { fileid: element._id },{active:false},{fileDelete : true}] }, { $set: { active : true ,fileDelete : false} },{multi: true}).exec(function (err, sharingpeople) {
            SharingPeople.find({ fileid: element._id }).exec(async function (err, sharingPeoples) {
                var sent
                if (sharingPeoples.length > 0) sent = true
                else sent = false
                Document.update({ _id: element._id }, { active: true, updated_at: Date.now(), isSent: sent,name:element.name }).exec(function (err, document) {
                })
            })
            socketio.emit('Document:Delete', element)
            Favorite.update({ $and: [{ uid: req.user._id }, { fileid: element._id }] }, { $set: { active: true } }, { multi: true }).exec(function (err, favorite) {
                callback();
            })
        })
    }, function (err) {
        return res.status(201).json({ message: 'success' });
    })
};
/**
 * @api {put} /removeSentFile/:id delete single file from sentfile 
 * @apiName removeSentFile
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json}   
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.removeSentFile = function (req, res) {
    Document.findById(req.params.id).exec(function (err, file) {
        if (err) { return handleError(res, err); }
        if (!file) { return res.status(404).send('Not Found'); }
        file.isSent = false
        file.updated_at = Date.now();
        var updated = _.merge(file, file)
        updated.save(function (err, res1) {
            if (err) { return handleError(res, err); } else {
                return res.status(200).json(res1);
            }
        })
    })
}
/**
 * @api {put} /multiple/remove/sentfiles  delete multiple files from sentfile 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName RemoveMUltipleSentFiles
 * @apiParam {array}
 * @apiGroup document
 * @apiSuccess {String}  
 */
exports.RemoveMUltipleSentFiles = function (req, res) {
    var folders = req.body.folders
    var files = req.body.files
    console.log(req.body)
    async.each(folders, function (element, callback) {
        Folder.update({ _id: element._id }, { isSent: false }).exec(function (err, sharingpeople) {
            callback()
        })
    }, function (err) {
        async.each(files, function (element, callback) {
            Document.update({ _id: element._id }, { isSent: false }).exec(function (err, Document) {
                callback()
            })
        }, function (err) {
            return res.status(200).json("sucess");
        })
    });
};
/**
 * @api {delete} /:id  Deletes a document from the DB.
 * @apiName destroy
 * @apiParam {String}
 * @apiGroup document
 * @apiSuccess {String}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.destroy = function (req, res) {
    Document.findById(req.params.id, function (err, document) {
        if (err) { return handleError(res, err); }
        if (!document) { return res.status(404).send('Not Found'); }
        if (fs.existsSync(document.path)) fs.unlinkSync(document.path, (err) => {
            if (err) throw err;
        });;
        document.remove(function (err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};
//not used
exports.starredfiles = function (req, res) {
    Document.find({ $and: [{ uid: req.user._id }, { active: true }] }).sort({ created_at: 'desc' }).limit(5).exec(function (err, documents) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(documents);
    });
}
//not used
exports.chekingpdf = function (req, res) {
    var filePath = __dirname + '/td.pdf'
    var extract = require('pdf-text-extract')
    var options = {
        cwd: "/home/dell/Documents/workspace/docIntact/backend/server/api/document/"
    }
    extract(filePath, options, function (err, pages) {
        if (err) {
            console.dir(err)
            return
        }
    })
}
/**
 * @api {put} /deletefile/:id change active status in sharingpeople 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName deletefile
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.deletefile = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    Document.findById(req.params.id, function (err, document) {
        if (err) { return handleError(res, err); }
        if (!document) { return res.status(404).send('Not Found'); }
        SharingPeople.find({ $and: [{ fromid: req.user._id }, { fileid: req.params.id }] }).exec(function (err, sharingpeople) {
            async.each(sharingpeople, function (element, callback) {
                element.active = false
                element.updated_at = Date.now();
                element.save(function (err) {
                    callback();
                });
            })
        });
        var updated = _.merge(document, req.body);
        updated.updated_at = Date.now();
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(document);
        });
    });
};
/**
 * @api {post} /googledrive  upload file from google drive
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName googledrive
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.googledrive = async function (req, res) {
    var request = require('request')
    var downloadurl
    var headers = { "Authorization": 'Bearer ' + req.body.access }
    //Get file complete data
    request.get({
        url: 'https://www.googleapis.com/drive/v2/files/' + req.body.id,
        headers: headers
    }, function (error, response, filedata) {
        var downParse = JSON.parse(filedata);
        if (downParse.mimeType == 'application/pdf') downloadurl = downParse.downloadUrl
        if (downParse.mimeType == 'application/msword' || downParse.mimeType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            downloadurl = downParse.downloadUrl
        }
        if (downParse.mimeType == 'application/vnd.google-apps.document') {
            downloadurl = downParse.exportLinks['application/pdf']
        }
        //download url
        request.get({
            url: downloadurl,
            encoding: null // Force Request to return the data as Buffer
            ,
            headers: headers
        }, function done(err, response, downloadedFile) {
            var encryptfilename = encrypt(key, String(Date.now()));
            var fileName
            if (downParse.mimeType == 'application/pdf') fileName = encryptfilename + '.pdf'
            if (downParse.mimeType == 'application/msword' || downParse.mimeType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                fileName = encryptfilename + '.doc'
            }
            fs.writeFile('./uploads/' + fileName, downloadedFile, async function (err) {
                var file = {};
                var filenamedata = req.body.name.split('.')
                if (filenamedata[filenamedata.length - 1] != 'pdf') {
                    var Extension = (path.extname(req.body.name))
                    if (Extension == '.doc' || Extension == '.docx') {
                        req.body.name = (path.basename(req.body.name)).substring(0, path.basename(req.body.name).length - Extension.length) + '.pdf'
                    }
                }
                const pdfjs = require('pdfjs-dist');
                const bereich = require('bereich');
                if (downParse.mimeType == 'application/pdf') {
                    var hummus = require('hummus');
                    var pathOfFile = __dirname + '/../../../uploads/' + fileName;
                    var pdfReader = hummus.createReader(pathOfFile);
                    if (pdfReader.isEncrypted()) {
                        console.log("writepermissons")
                        var Newpath = __dirname + '/../../../uploads/' + Math.floor((Math.random() * 100) + 1) + '.pdf';
                        if (shell.exec('pdftk ' + pathOfFile + ' output ' + Newpath).code) { }
                        if (fs.existsSync(pathOfFile)) fs.unlinkSync(pathOfFile)
                        fs.renameSync(Newpath, pathOfFile);
                    }
                }
                if (downParse.mimeType == 'application/msword' || downParse.mimeType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    fileName = encryptfilename + '.pdf';
                    var m = __dirname + '/../../../' + 'uploads/' + encryptfilename + '.doc';
                    let shellcmd = require('shelljs')
                    shellcmd.cd('uploads');
                    if (!shellcmd.exec('lowriter --convert-to pdf ' + m).code) { console.log("Doc To PDf convertions is done"); }
                    shellcmd.cd('..');
                }
                const pdf = await pdfjs.getDocument(__dirname + '/../../../' + 'uploads/' + fileName); // PDF Path
                const numPages = pdf.numPages;
                const pageNumbers = Array.from(bereich(1, numPages));
                // Start reading all pages 1...numPages
                const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
                // Wait until all pages have been read
                const pages = await Promise.all(promises);
                var pagesInfo = []
                console.log(req.body.name)
                for (i = 0; i < numPages; i++) {
                    // console.log(pages[i]._pageInfo.view);
                    pagesInfo[i] = pages[i]._pageInfo.view
                }
                file.pagesInfo = pagesInfo
                file.originalFilename = req.body.name;
                file.path = 'uploads/' + fileName;
                file.path = file.path.replace("../", "");
                file.path = file.path.replace("backend/", "");
                file.size = req.body.sizeBytes;
                file.name = req.body.name;
                file.type = 'application/pdf';
                file.copycount = 0;
                if (req.body.parentid) {
                    file.folderid = req.body.parentid;
                }
                var encryptedid = encrypt(key, String(Date.now()));
                file.encryptedid = encryptedid,
                    file.uid = req.user.id;
                if (file.type == 'application/pdf') {
                    var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                    var pdfFile = __dirname + '/../../../' + file.path;
                    if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                    if (numPages > 100) var c = '-f 1 -l 4';
                    else var c = ''
                    var sshCommand = 'pdftoppm ' + c + ' ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
                    var child1 = childprocess.fork(__dirname + '/childprocess')
                    child1.on('message', async function (msg) {
                        var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
                            file.path = p;
                            console.log(file);

                            Document.find({uid: req.user.id, active: true, folderid: file.folderid }).exec(async function (err, document_name) {
                                if (document_name.length) {
                                    if(document_name.some( x=>String(x.name)==String(file.name)))
                                    {
                                        file.name = await removeNameDuplication(document_name,file.name, 1)
        
                                    }                                }
                            Document.create(file, function (err, document) {
                                if (err) { return handleError(res, err); }
                                if (!document) { return res.status(404).send('Not Found'); }
                                fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                    //handling error
                                    if (err) {
                                        return console.log('Unable to scan directory: ' + err);
                                    }
                                    //listing all files using forEach
                                    await createDocImages(files, document, encryptedid)
                                    if (document && document.pagesInfo.length > 100) {
                                        req.params.id = document._id
                                        _this.createImages(req)
                                    }
                                });
                                return res.status(201).json(document);
                            });
                        });


                        });
                        child1.kill()
                    })
                    child1.on('close', (code) => {
                        console.log(`child process close all stdio with code ${code}`);
                    });

                    child1.on('exit', (code) => {
                        console.log(`child process exited with code ${code}`);
                    });
                    child1.send({ sshCommand: sshCommand, filepath: pdfFile })
                }

            });

        })
    });
}
//not used
exports.testingGoogle = function (req, res) {
    const readline = require('readline');
    const { google } = require('googleapis');

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), listFiles);
    });
}
//not used
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}
//not used
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
// not used
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}

/**
 * @api {put} /check/:id  update document in DB
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update1
 * @apiParam {String} documentid
 * @apiGroup document
 * @apiSuccess {json}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404- Not Found.
 */
exports.update1 = function (req, res) {
    if (req.body._id) { delete req.body._id; }
    Document.findById(req.params.id, function (err, file) {
        if (err) { return handleError(res, err); }
        if (!file) { return res.status(404).send('Not Found'); }
        if (file.parentid) file.parentid = null
        var updated = _.merge(file, req.body);
        updated.updated_at = Date.now();
        Document.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(folder);
        });
    });
};
/**
 * @api {post} /onedrive  file upload from one drive 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName onedrive
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.onedrive = function (req, res) {
    const download = require('download');
    var filename = req.body.name
    var Extension = (path.extname(req.body.name))
    var fileNameWithoutExtension = req.body.name.substring(0, req.body.name.lastIndexOf('.'));
    if (Extension == '.doc' || Extension == '.docx' || Extension == '.pdf') {
        download(req.body.url).then(async data => {
            var filenameWithoutExtension = encrypt(key, filename + Date.now());
            var encryptedname = filenameWithoutExtension + Extension;
            fs.writeFileSync('./uploads/' + encryptedname, data);
            if (Extension == '.doc' || Extension == '.docx') {
                var m = __dirname + '/../../../' + 'uploads/' + encryptedname;
                let shellcmd = require('shelljs')
                shellcmd.cd('uploads');
                if (!shellcmd.exec('lowriter --convert-to pdf ' + m).code) { console.log("Doc To PDf convertions is done"); }
                // if (!shellcmd.exec('mv -f ' + __dirname + '/../../../*.pdf ' + __dirname + '/../../../' + 'uploads').code) { console.log("Moved To Uploads is done"); }
                shellcmd.cd('..');
            }
            if (Extension == '.doc' || Extension == '.docx') {
                var stats = fs.statSync('./uploads/' + filenameWithoutExtension + '.pdf')
                console.log(stats)
            } else var stats = fs.statSync('./uploads/' + encryptedname)
            var file = {};
            var newfile = encryptedname;
            if (Extension == '.doc' || Extension == '.docx') {
                var newfile = filenameWithoutExtension + '.pdf'
            }
            var file = {};
            //FOR PAGE INFO
            const pdfjs = require('pdfjs-dist');
            const bereich = require('bereich');
            const pdf = await pdfjs.getDocument(__dirname + '/../../../' + 'uploads/' + newfile); // PDF Path
            const numPages = pdf.numPages;
            const pageNumbers = Array.from(bereich(1, numPages));
            // Start reading all pages 1...numPages
            const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
            // Wait until all pages have been read
            const pages = await Promise.all(promises);
            var pagesInfo = []
            for (i = 0; i < numPages; i++) {
                console.log(pages[i]._pageInfo.view);
                pagesInfo[i] = pages[i]._pageInfo.view
            }
            file.pagesInfo = pagesInfo
            file.originalFilename = fileNameWithoutExtension + '.pdf';
            file.path = 'uploads/' + newfile;
            file.path = file.path.replace("../", "");
            file.path = file.path.replace("backend/", "");
            file.size = stats.size;
            file.type = 'application/pdf';
            file.name = fileNameWithoutExtension + '.pdf';
            file.copycount = 0;
            if (req.body.parentid) {
                file.folderid = req.body.parentid;
            }
            var encryptedid = encrypt(key, String(Date.now()));
            file.encryptedid = encryptedid,
                file.uid = req.user.id;
            if (file.type == 'application/pdf') {
                var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                var pdfFile = __dirname + '/../../../' + file.path;
                if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                if (numPages > 100) var c = '-f 1 -l 4';
                else var c = ''
                var sshCommand = 'pdftoppm ' + c + ' ' + pdfFile + ' convertimages/' + encryptedid + '/pages -png'
                var child1 = childprocess.fork(__dirname + '/childprocess')
                child1.on('message', async function (msg) {
                    var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
                        file.path = p;
                        console.log(file);
                        Document.find({ uid: req.user.id, active: true, folderid: file.folderid }).exec(async function (err, document_name) {
                            if (document_name.length) {
                                if(document_name.some( x=>String(x.name)==String(file.name)))
                                {
                                    file.name = await removeNameDuplication(document_name,file.name, 1)
    
                                }                             }

                        Document.create(file, function (err, document) {
                            if (err) { return handleError(res, err); }
                            if (!document) { return res.status(404).send('Not Found'); }
                            fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                //handling error
                                if (err) {
                                    return console.log('Unable to scan directory: ' + err);
                                }
                                //listing all files using forEach
                                await createDocImages(files, document, encryptedid)
                                if (document && document.pagesInfo.length > 100) {
                                    req.params.id = document._id
                                    _this.createImages(req)
                                }
                            });
                            return res.status(201).json(document);
                        });
                    });

                    });

                    child1.kill()
                })
                child1.on('close', (code) => {
                    console.log(`child process close all stdio with code ${code}`);
                });

                child1.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                });
                child1.send({ sshCommand: sshCommand, filepath: pdfFile })
            }
        });
    } else {
        var message = "invalid url"
        return res.status(404).json(messag);
    }


}
/**
 * @api {post} /searchdocuments  search a file or folder from given text 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName searchdocuments
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}   
 */
exports.searchdocuments = function (req, res) {
    if (req.body.menu) {
        if (req.body.menu == 'Myfiles') {
            Document.find({ $and: [{ uid: req.user.id }, { name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { active: true }] }).exec(function (err, document) {
                Folder.find({ $and: [{ userid: req.user.id }, { name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { active: true }] }).exec(function (err, folders) {
                    if (folders) {
                        folders.forEach(element => {
                            document.push(element)
                        })
                        return res.status(201).json(document);
                    }
                })
            });
        }
        else if (req.body.menu == 'Favourites') {
            var fetchedDocs = []
            var stream = Favorite.aggregate([
                {
                    $lookup: //to join files to favorite documents
                    {
                        from: 'documents',
                        let: { fileid: "$fileid" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$fileid"] },
                                    active: true,
                                    name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
                                }
                            },
                        ],  
                        as: 'files'
                    }
                },
                {
                    $lookup: //to join folders to favorite documents
                    {
                        from: 'folders',
                        let: { folderid: "$folderid" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$folderid"] },
                                    active: true,
                                    name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
                                }
                            },
                        ],  
                        as: 'folders'
                    }
                },
                {
                    $match: {
                        active: true,
                        uid: req.user._id
                    }
                },

            ]).
                cursor({}).exec().stream();
            stream.on('data', function (doc) {
                if (doc.files.length || doc.folders.length) fetchedDocs.push(doc)
            });
            stream.on("end", function () {
                return res.status(201).json(fetchedDocs);

            });
        }
        else if (req.body.menu == 'Sent Files') {
            Document.find({ $and: [{ uid: req.user.id }, { name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { active: true }, { isSent: true }] }).exec(function (err, document) {
                Folder.find({ $and: [{ userid: req.user.id }, { name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { active: true }, { isSent: true }] }).exec(function (err, folders) {
                    if (folders) {
                        folders.forEach(element => {
                            document.push(element)
                        })
                        return res.status(201).json(document);
                    }
                })
            });
        }
        else if (req.body.menu == 'Shared With Me') {
            var fetchedDocs = []
            var stream = SharingPeople.aggregate([
                {
                    $lookup: //to join files to SharingPeople documents
                    {
                        from: 'documents', 
                        let: { fileid: "$fileid" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$fileid"] },
                                    active: true,
                                    name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
                                }
                            },
                        ],
                        as: 'files'
                    }
                },
                {
                    $lookup: //to join folders to SharingPeople documents
                    {
                        from: 'folders',
                        let: { folderid: "$folderid" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$folderid"] },
                                    active: true,
                                    name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
                                }
                            },
                        ],
                        as: 'folders'
                    }
                },
                {
                    $match: {
                        active: true,
                        toid: req.user._id
                    }
                },

            ]).
                cursor({}).exec().stream();
            stream.on('data', function (doc) {
                if (doc.files.length || doc.folders.length) fetchedDocs.push(doc)
            });
            stream.on("end", function () {
                return res.status(201).json(fetchedDocs);

            });
        }
    }
    else {
        Document.find({ $and: [{ uid: req.user.id }, { name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { active: true }] }).exec(function (err, document) {
            Folder.find({ $and: [{ userid: req.user.id }, { name: { $regex: req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }, { active: true }] }).exec(function (err, folders) {
                if (folders) {
                    folders.forEach(element => {
                        document.push(element)
                    })
                    return res.status(201).json(document);
                }
            })
        });
    }

};
/**
 * @api {post} /multiFileDelete  update multiple files active status
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multiFileDelete
 * @apiParam {array}
 * @apiGroup document
 * @apiSuccess {String}   
 */
exports.multiFileDelete = function (req, res) {
    var files = req.body
    async.each(files, function (element, callback) {
        Document.update({ _id: element._id }, { active: false, updated_at: Date.now(),isSent:false }).exec(function (err, document) {
            SharingPeople.update({ $and: [{ fromid: req.user._id }, { fileid: element._id },{active:true}] }, { $set: { active : false ,fileDelete : true} },{multi: true}).exec(function (err, sharingpeople) {
                socketio.emit('Document:Delete',element)
                Favorite.update({ $and: [{ uid: req.user._id }, { fileid: element._id }] }, { $set: { active: false } },{multi: true}).exec(function (err, favorite) {
                    callback();
                })
            })
        })
    }, function (err) {
        return res.status(201).json({ message: 'success' });
    })
};
/**
 * @api {post} /encrypt  encrypt url
 * @apiName encryptauditlogvalue
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}   
 */
exports.encryptauditlogvalue = function (req, res) {
    if (req.body.id && req.body.type && req.body.docid) {
        var id = encrypturl(key, req.body.id);
        var docid = encrypturl(key, req.body.docid)
        var type = encrypturl(key, req.body.type)
        return res.send({ "type": type, "id": id, "docid": docid })
    } else if (req.body.fileid && !req.body.sharedid) {
        var encryptdata = encrypturl(key, req.body.fileid)
        return res.send({ encryptdata })
    } else if (req.body.fileid && req.body.sharedid) {
        var fileid = encrypturl(key, req.body.fileid)
        var sharedid = encrypturl(key, req.body.sharedid)
        return res.send({ "fileid": fileid, "sharedid": sharedid })
    }
}
/**
 * @api {post} /decrypt decrypt url 
 * @apiName decryptauditlogvalue
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  
 */
exports.decryptauditlogvalue = function (req, res) {
    console.log(req.body,"|||||||||||||||")
    if (req.body.id && req.body.type && req.body.docid) {
        var id = decrypturl(key, req.body.id);
        var docid = decrypturl(key, req.body.docid)
        var type = decrypturl(key, req.body.type)
        return res.send({ "type": type, "id": id, "docid": docid })
    } else if (req.body.fileid && !req.body.sharedid) {
        var decryptdata = decrypturl(key, req.body.fileid)
        return res.send({ decryptdata })
    } else if (req.body.fileid && req.body.sharedid) {
        var fileid = decrypturl(key, String(req.body.fileid))
        var sharedid = decrypturl(key, req.body.sharedid)
        return res.send({ "fileid": fileid, "sharedid": sharedid })
    }
}
/**
 * @api {post} /editTemplateDoc 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName editTemplateDoc
 * @apiParam {json}
 * @apiGroup document
 * @apiSuccess {json}  
 */
exports.editTemplateDoc = async function (req, res) {
    const HummusRecipe = require('hummus-recipe');
    // console.log(__dirname + '/../../../' +'uploads/temp8.pdf')
    const pdfDoc = new HummusRecipe('new', __dirname + '/../../../' +'uploads/'+req.body.templatename+'.pdf');
    for(var i = 0; i < req.body.pageNo-1; i++){
        await  pdfDoc
        .appendPage(__dirname + '/../../../' +'uploads/temp.pdf', 1)
    }
    pdfDoc.createPage('letter-size')
    pdfDoc.endPage()
    pdfDoc.endPDF();
    req.files = { uploads:
        [ { fieldName: 'uploads[]',
            originalFilename: req.body.templatename,
            path: 'uploads/'+req.body.templatename+'.pdf',
            name: req.body.templatename,
            type: 'application/pdf' } ] }
        var type = 'application/pdf';
        console.log(req.files)
        var pat = req.files.uploads[0].path;
              
        if (type == 'application/pdf' ) {
            var hummus = require('hummus');
            var path = __dirname + '/../../../' + pat;
            var pdfReader = await hummus.createReader(path);

            if (pdfReader.isEncrypted()) {

                var Newpath = __dirname + '/../../../uploads/' + Math.floor((Math.random() * 100) + 1) + '.pdf';
                if (shell.exec('pdftk ' + path + ' output ' + Newpath).code) { }

                if (fs.existsSync(path)) fs.unlinkSync(path)
                fs.renameSync(Newpath, path);
            }
         var file = {};
            const pdf = await pdfjs.getDocument(__dirname + '/../../../' + pat); // PDF Path
            const numPages = pdf.numPages;
            const pageNumbers = Array.from(bereich(1, numPages));
            // Start reading all pages 1...numPages
            const promises = pageNumbers.map(pageNo => pdf.getPage(pageNo));
            // Wait until all pages have been read
            const pages = await Promise.all(promises);
            var pagesInfo = []
            for (i = 0; i < numPages; i++) {
                //   console.log(pages[i]._pageInfo.view);
                pagesInfo[i] = pages[i]._pageInfo.view
            }
            file.pagesInfo = pagesInfo
            file.originalFilename = req.files.uploads[0].originalFilename;
            file.path = pat;
            file.path = file.path.replace("../", "");
            file.path = file.path.replace("backend/", "");
            file.type = req.files.uploads[0].type;
            file.name = req.files.uploads[0].name;
            var encryptedid = encrypt(key, String(Date.now()));
            file.encryptedid = encryptedid,
                file.uid = req.user.id;
            file.copycount = 0;
            if (file.type == 'application/pdf') {
                var imageFolder = __dirname + '/../../../convertimages/' + encryptedid;
                var pdfFile = __dirname + '/../../../' + file.path;
                console.log(pdfFile)
                if (!fs.existsSync(imageFolder)) fs.mkdirSync(imageFolder);
                if (numPages > 100) var c = '-f 1 -l 4';
                else var c = ''
                    var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
                        file.path = p;
                        file.active = null;
                        Document.create(file, function (err, document) {
                            if (err) { return handleError(res, err); }
                            if (!document) { return res.status(404).send('Not Found'); }
                            fs.readdir(__dirname + '/../../../' + 'convertimages/' + encryptedid, async function (err, files) {
                                //handling error
                                if (err) {
                                    return console.log('Unable to scan directory: ' + err);
                                }
                                if (req.files && req.files.uploads[0] && req.files.uploads[0].path && fs.existsSync(req.files.uploads[0].path)) fs.unlinkSync(req.files.uploads[0].path)
                                if (document && document.pagesInfo.length > 100) {
                                    req.params.id = document._id
                                    _this.createImages(req)
                                }
                            });
                            return res.status(201).json(document);
                        });
                    });
            }
    
    
        } 
    // };
}
// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}