'use strict';

var _ = require('lodash');
var Folder = require('./folder.model');
var async = require('async');
var key = "secretkey";
var crypto = require("crypto")
var Document = require('../document/document.model')
var SharingPeople = require('../sharingpeople/sharingpeople.model')
var Favorite = require('../favorite/favorite.model')
var fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
var Docimage = require('../docimage/docimage.model');

function encrypt(key, data) {
  var cipher = crypto.createCipher('aes-256-cbc', key);
  var crypted = cipher.update(data, 'utf-8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

/**
 * @api {get} /folders/ Request folder  Document  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup Folder
 *
 * @apiSuccess {array} ALL_Fields Result of folderRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get list of folders
exports.index = function (req, res) {
  Folder.find({ $and: [{ userid: req.user._id }, { active: true }] }).sort({ createdAt: 'desc' }).exec(function (err, folders) {
    if (err) { return handleError(res, err); }
    else {
      folders.forEach(element => {
        element.encryptedId = encrypt(key, element._id.toString());
        if (element.parentid) {
          element.parentencryptedId = encrypt(key, element.parentid.toString());
        }
      })
      return res.status(200).json(folders);
    }
  });
};

/**
 * @api {get} /folders/:id Request folder  Documents  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName show
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {array} ALL_Fields Result of Particular sub folders Document.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get a single folder
exports.show = function (req, res) {
  Folder.find({ $and: [{ parentid: req.params.id }, { active: true }] }).sort({ created_at: 'desc' }).exec(function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    return res.json(folder);
  });
};

/**
 * @api {get} /folders/folder/info/:id Request folder  Documents  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName folderInfo
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {json} ALL_Fields Result of Particular folder Document.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get a single folder Info
exports.folderInfo = function (req, res) {
  Folder.findOne({ $and: [{ _id: req.params.id }, { active: true }] }).sort({ created_at: 'desc' }).exec(function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    return res.json(folder);
  });
};

/**
 * @api {get} /folders/getnavigationfolder/:id Request folder  Documents  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getnavigationfolder
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {json} ALL_Fields Result of Particular folder Document.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getnavigationfolder = function (req, res) {
  Folder.findById(req.params.id, function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    return res.json(folder);
  });
};

/**
 * @api {get} /folders/getparentfolders/:id Request folder  Documents  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getparentfolders
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {json} ALL_Fields Result of  folderd and files of particular folder Document.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getparentfolders = function (req, res) {
  Folder.find({ $and: [{ active: true },{ parentid: req.params.id }]}).sort({ created_at: 'desc' }).populate('toid').populate('fromid')
    .populate('fileid').populate('folderid').exec(function (err, folders) {
      if (err) { return handleError(res, err); }
      if (!folders) { return res.status(404).send('Not Found'); }

      Document.find({ $and: [{ active: true }, { folderid: req.params.id }]}).populate('toid').populate('fromid')
        .populate('fileid').exec(function (err, files) {
          if (err) { return handleError(res, err); }
          if (!files) { return res.status(404).send('Not Found'); }
          return res.json({ "folders": folders, "files": files });
        });

    });

}

/**
 * @api {Post} /folders/  create Folder Douments
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup Folder
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} All_fields of  Folder Douments.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Creates a new folder in the DB.
exports.create = function (req, res) {
  req.body.userid = req.user._id;
  if (!req.body.parentid) req.body.parentid = undefined;
  Folder.find({ userid: req.user._id, active: true, parentid: req.body.parentid }).exec(async function (err, folder_name) {
    if (folder_name && folder_name.length) {
      if (folder_name.some(x => String(x.name).toLowerCase() == String(req.body.name).toLowerCase())) {
        req.body.name = await removeNameDuplication(folder_name, req.body.name, 1)
      }
    }
    if (!req.body.parentid) delete req.body.parentid;
    Folder.create(req.body, function (err, folder) {
      if (err) { return handleError(res, err); }
      return res.status(201).json(folder);
    });
  });
};

/**
 * @api {put} /folders/:id  Update  particular folder document
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName FolderUpdate
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {json} All_fields of   Folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Updates an existing folder in the DB.
exports.FolderUpdate = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Folder.findById(req.params.id, function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    if (folder.parentid) folder.parentid = null
    var updated = _.merge(folder, req.body);
    updated.updated_at = Date.now();
    updated.save(function (err) {
      if (req.body.delete) {
        folder.first = true;
        Document.update({ folderid: folder._id }, { active: true }, { multi: true }).exec(function (err, document) { });
        updateall(folder, req.user.id, true)
      }
      if (err) { return handleError(res, err); }
      return res.status(200).json(folder);
    });
  });
};

/**
 * @api {put} /folders/move/update/:id  Update  particular folder document
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName MoveOnupdate
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {json} All_fields of   Folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Updates an existing folder in the DB on move folder.
exports.MoveOnupdate = function (req, res) {
  if (req.body.element._id) { delete req.body.element_id; }
  Folder.findById(req.params.id, function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    if (folder.parentid) folder.parentid = null
    var updated = _.merge(folder, req.body.element);
    if (req.body.MoveTo == 'root') updated.parentid = undefined;
    updated.updated_at = Date.now();
    updated.save(function (err) {
      if (req.body.delete) {
        folder.first = true;
        Document.update({ folderid: folder._id }, { active: true }, { multi: true }).exec(function (err, document) { });
        updateall(folder, req.user.id, true)
      }
      if (err) { return handleError(res, err); }
      return res.status(200).json(folder);
    });
  });
};

/**
 * @api {put} /folders/isEmptyfolder/:id  Update  particular folder document
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName isEmptyfolder
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {json} True or false
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.isEmptyfolder = function (req, res) {
  Folder.find({ userid: req.user._id, active: true }, function (err, folders) {
    Document.find({ uid: req.user._id, active: true }, function (err, documents) {
    var filePresent=false;
    var checkarray=[req.params.id] 
    while(checkarray.length!=0 && !filePresent)   
    {
      if(documents.some(x=>String(x.folderid)==String(checkarray[0])))
       {
         filePresent=true;
      }
      else{
       var subfolders= folders.filter(x=>String(x.parentid)==String(checkarray[0]));
       if(!subfolders.length){filePresent=false; checkarray.shift(); }
       else{
             subfolders.forEach(x=>{checkarray.push(x._id)})
             checkarray.shift();
       }
      }
     }  
     return res.status(200).json(filePresent);
    })
  })
};


/**
 * @api {post} /folders/restore  Update  folder documents to restore
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName restore
 * @apiGroup Folder
 *
 * @apiParam {json} data will sent through request body.
 * @apiSuccess {json} All_fields of   Folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.restore = function (req, res) {
  var foldersarr = req.body.folderarray
  async.each(foldersarr, function (element, callback) {
   Folder.findById(element._id, function (err, folder) {
    SharingPeople.update({ $and: [{ fromid: folder.userid }, { folderid: folder._id },{active:false},{fileDelete : true }] }, { $set: { active: true,fileDelete : false } }).exec(function (err, sharingpeople) {
      if (err) { return handleError(res, err); }
      if (!folder) { return res.status(404).send('Not Found'); }
      if (folder.parentid) folder.parentid = null
      var updated = _.merge(folder, element);
      updated.updated_at = Date.now();
      updated.save(function (err) {
        if (req.body.delete) {
          folder.first = true;
          Document.update({ folderid: folder._id }, { active: true }, { multi: true }).exec(function (err, document) { });
          updateall(folder, req.user.id, true)
          Favorite.update({ $and: [{ uid: req.user._id }, { folderid: element._id }] }, { $set: { active: true } }).exec(function (err, favorite) {
          })
          callback()
        }
      });
    })
    });
  }, function (err) {
    return res.status(201).json({ message: 'success' });

  })

};

/**
 * @api {delete} /folders/:id  remove  folder document 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {string} 'No Content' statement.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Deletes a folder from the DB.
exports.destroy = function (req, res) {
  Folder.findById(req.params.id, function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    Document.find({ folderid: folder._id }).exec(function (err, document) {
      if (document) {
        async.each(document, function (element, callback) {
          fs.unlink(element.path, function (err) {
            callback();

          });
        })
      }
      folder.remove(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(204).send('No Content');
      });
    });

    Folder.find({ folderid: req.params.id }).sort({ created_at: 'desc' }).exec(function (err, folderdetails) {
    });
  });
}

/**
 * @api {post} /folders/isFolderIsExist to check whether folder exists or not
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName isFolderIsExist
 * @apiGroup Folder
 *
 * @apiParam {json} data will sent through request body.
 * @apiSuccess {object} All_fields of   Folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//isFolder exits 
exports.isFolderIsExist = function (req, res) {
  let query
  if (req.body.parentid != 0) query = { $and: [{ userid: req.user._id }, { active: true }, { name: req.body.name }, { parentid: req.body.parentid }] };
  else query = { $and: [{ userid: req.user._id }, { active: true }, { name: req.body.name }, { parentid: { $exists: false } }] };
  Folder.findOne(query).exec(function (err, folders) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(folders);
  });
};

/**
 * @api {get} /folders/getallfolders Request  All folder  Documents  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getallfolders
 * @apiGroup Folder
 *
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//get folders for moveto
exports.getallfolders = function (req, res) {
  var folder;
  Folder.find({ $and: [{ userid: req.user._id }, { active: true }, { parentid: { $exists: false } }] }).exec(function (err, folders) {
    if (err) { return handleError(res, err); }
    else {
      // getchildrens(folders)
      return res.status(200).json(folders);
    }
  });
}

/**
 * @api {post} /folders/permanentFolderDeletion Request to delete folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroyfolder
 * @apiGroup Folder
 *
 * @apiParam {json} data will sent through request body.
 * @apiSuccess {String} No Content' statement.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.destroyfolder = function (req, res) {
  if (req.body.value.isFile) {
    Document.findById(req.body.id, function (err, document) {
      if (err) { return handleError(res, err); }
      if (!document) { return res.status(404).send('Not Found'); }
      removeS3folder('convertimages/' + document.encryptedid + '/', function (resp) { console.log(resp) })
      removeS3(document.path, 'uploads')
      Docimage.remove({ $and: [{ documentid: document._id }, { active: true }] }).exec(function (err) { console.log(err) });
      document.remove(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(204).send('No Content');
      });
    });
  }
  if (req.body.value.isFolder) {
    Folder.findById(req.body.id, function (err, folder) {
      if (err) { return handleError(res, err); }
      if (!folder) { return res.status(404).send('Not Found'); }
      folder.first = true;
      Document.find({ folderid: folder._id, active: false }).exec(function (err, documents) {
        documents.forEach(element => {
          removeS3folder('convertimages/' + element.encryptedid + '/', function (resp) { console.log(resp) })
          removeS3(element.path, 'uploads')
          Docimage.remove({ $and: [{ documentid: element._id }, { active: true }] }).exec(function (err) { console.log(err) });
          element.remove(function (err) {
            if (err) { return handleError(res, err); }
          })
        })
      });
      deleteall(folder);
      folder.remove(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(204).send('No Content');
      });
    });
  }
};


/**
 * @api {put} /folders/deletefolder/:id Request to update folders status
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName deletefolder
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//delete folder(changes the status)
exports.deletefolder = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Folder.findById(req.params.id, function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    //Change status for selected folder
    SharingPeople.update({ $and: [{ fromid: req.user._id }, { folderid: req.params.id }] }, { active: false }, { multi: true }).exec(function (err, sharingpeople) {
      Favorite.update({ $and: [{ uid: req.user._id }, { folderid: req.params.id }] }, { $set: { active: false } }).exec(function (err, favorite) {
        Document.update({ folderid: req.params.id }, { active: false }, { multi: true }).exec(function (err, document) {
          Document.find({ folderid: req.params.id }).exec(function (err, documents) {
            documents.forEach(filedata => {
              SharingPeople.update({ $and: [{ fromid: req.user._id }, { fileid: filedata._id }] }, { active: false }, { multi: true }).exec(function (err, sharingpeople) {
              })
              Favorite.update({ $and: [{ uid: req.user._id }, { fileid: filedata._id }] }, { $set: { active: false } }).exec(function (err, sharingpeople) {
              })
            })
          })
        });
      })
    })

    var updated = _.merge(folder, req.body);
    updated.updated_at = Date.now();
    updated.save(function (err) {
      updateall(updated, req.user.id, false)
      if (err) { return handleError(res, err); }
      return res.status(200).json(updated);
    });
  });
};


/**
 * @api {post} /folders/searchfiles Request to search the deleted files and folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName searchfiles
 * @apiGroup Folder
 *
 * @apiParam {json} data will sent through request parameter.
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// search folder & files if it is deleted
exports.searchdeletedfiles = function (req, res) {
  Folder.find({ $and: [req.body.where, { $and: [{ userid: req.user._id }, { active: false }] }] }).sort({ updated_at: 'desc' }).populate('uid').exec(function (err, folders) {
    Document.find({ $and: [req.body.where, { $and: [{ uid: req.user._id }, { active: false }] }] }).sort({ updated_at: 'desc' }).populate('uid').exec(function (err, documents) {
      if (err) { return handleError(res, err); }
      else {
        documents = JSON.parse(JSON.stringify(documents));
        folders = JSON.parse(JSON.stringify(folders));
        // gets all deleted documents
        documents.forEach(element => {
          element.show = true;
          if (element.folderid)
            if (folders.some(x => x._id == element.folderid)) element.show = false;
          if (documents.length - 1 == documents.indexOf(element)) documents = documents.filter(x => x.show);
        })
        // gets all deleted folders
        folders.forEach(element => {
          element.show = true;
          element.child = folders.filter(x => x.parentid && x.parentid == element._id)
          if (element.parentid) if (folders.some(x => x._id == element.parentid)) element.show = false;
          if (folders.length - 1 == folders.indexOf(element)) folders = folders.filter(x => x.show);
        })
        return res.status(200).json({ 'documents': documents, 'folders': folders });
      }
    });
  });
};

/**
 * @api {get} /folders/trashbin Request to search the deleted files and folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName trashfolders
 * @apiGroup Folder
 *
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//get Trash Bin folders and files
exports.trashfolders = function (req, res) {
  Folder.find({ $and: [{ userid: req.user._id }, { active: false }] }).sort({ updated_at: 'desc' }).exec(function (err, folders) {
    Document.find({ $and: [{ uid: req.user._id }, { active: false }] }).sort({ updated_at: 'desc' }).exec(function (err, documents) {
      if (err) { return handleError(res, err); }
      else {
        documents = JSON.parse(JSON.stringify(documents));
        folders = JSON.parse(JSON.stringify(folders));
        // gets all deleted documents
        documents.forEach(element => {
          element.show = true;
          if (element.folderid)
            if (folders.some(x => x._id == element.folderid)) element.show = false;
          if (documents.length - 1 == documents.indexOf(element)) documents = documents.filter(x => x.show);
        })
        // gets all deleted folders
        folders.forEach(element => {
          element.show = true;
          element.child = folders.filter(x => x.parentid && x.parentid == element._id)
          if (element.parentid)
            if (folders.some(x => x._id == element.parentid)) element.show = false;
          if (folders.length - 1 == folders.indexOf(element)) folders = folders.filter(x => x.show);
        })
        return res.status(200).json({ 'documents': documents, 'folders': folders });
      }
    });
  });
};

/**
 * @api {get} /folders/user_folders_files/:id Request files and folders for admin
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName user_folders_files
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.user_folders_files = function (req, res) {
  Folder.find({ $and: [{ userid: req.params.id }, { active: true }, { parentid: { $exists: false } }] }).exec(function (err, folders) {
    if (err) { return handleError(res, err); }
    else {
      Document.find({ $and: [{ uid: req.params.id }, { active: true }, { folderid: { $exists: false } }] }).exec(function (err, documents) {
        if (documents && documents.length > 0) {
          for (let document of documents) {
            folders.push(document)
            if (documents.length - 1 == documents.indexOf(document)) return res.status(200).json(folders);
          }
        }
        else {
          return res.status(200).json(folders);
        }
      });
    }
  });
}

/**
 * @api {get} /folders/adminfolderdetails/:id Request files and folders for admin
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName adminfolderdetails
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.adminfolderdetails = function (req, res) {
  Folder.find({ $and: [{ active: true }, { parentid: req.params.id }] }).exec(function (err, folders) {
    if (err) { return handleError(res, err); }
    else {
      Document.find({ $and: [{ active: true }, { folderid: req.params.id }] }).exec(function (err, documents) {
        if (documents && documents.length > 0) {
          for (let document of documents) {
            folders.push(document)
            if (documents.length - 1 == documents.indexOf(document)) return res.status(200).json(folders);
          }
        }
        else {
          return res.status(200).json(folders);
        }
      });
    }
  })
}

/**
 * @api {put} /folders/removeSentFolder/:id Request to delete folders in sent items 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName removesentfolder
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//update folder status isSent File=false
exports.removesentfolder = function (req, res) {
  Folder.findById(req.params.id).exec(function (err, folder) {
    if (err) { return handleError(res, err); }
    if (!folder) { return res.status(404).send('Not Found'); }
    folder.isSent = false
    folder.updated_at = Date.now();
    var updated = _.merge(folder, folder)
    updated.save(function (err, res1) {
      if (err) { return handleError(res, err); }
      else {
        return res.status(200).json(res1);
      }
    })
  })
}

/**
 * @api {put} /folders/getSentDocs/sent Request all sent folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getSentDoc
 * @apiGroup Folder
 *
 * @apiSuccess {object} ALL_Fields Result of folder Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getSentDoc = function (req, res) {
  var arr = [];
  Folder.find({ $and: [{ active: true }, { isSent: true }, { userid: req.user._id }] }).sort({ createdAt: 'desc' }).exec(function (err, folders) {
    async.each(folders, function (element, callback) {
      arr.push(element);
      callback();
    }, function (err) {
      Document.find({ $and: [{ active: true }, { isSent: true }, { uid: req.user._id }] }).sort({ createdAt: 'desc' }).exec(function (err, documents) {
        if (err) { return handleError(res, err); }
        if (documents.length > 0) {
          async.each(documents, function (element, callback) {
            arr.push(element);
            callback();

          }, function (err) {
            return res.status(200).json(arr);
          });
        }
        else
          return res.status(200).json(arr);
      });
    });
  })
};

/**
 * @api {delete} /folders/filesFolder/delete Removing Deocument and Folder data
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName deleteAllFolderFile
 * @apiGroup Folder
 *
 * @apiSuccess {String} 'Success' statement
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.deleteAllFolderFile = function (req, res) {
  Folder.remove({ userid: req.user._id, active: false }).exec(function (err, result) {
    Document.remove({ uid: req.user._id, active: false }).exec(function (err, resultFile) {
      return res.json({ message: 'Success' });
    })
  })
}

/**
 * @api {post} /folders/multiFolderDelete Request delete selected folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multiFolderDelete
 * @apiGroup Folder
 *
 * @apiParam {json} data will sent through request parameter.
 * @apiSuccess {String} 'Success' statement
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//multi select folder delete
exports.multiFolderDelete = function (req, res) {
  var folders = req.body
  async.each(folders, function (element, callback) {
    Folder.update({ _id: element._id, }, { active: false, updated_at: Date.now() }).exec(function (err, fol) {
      //Change status for selected folder
      SharingPeople.update({ $and: [{ fromid: req.user._id }, { folderid: element._id },{active:true}] }, { active: false ,fileDelete : true}, { multi: true }).exec(function (err, sharingpeople) {
        Favorite.update({ $and: [{ uid: req.user._id }, { folderid: element._id }] }, { $set: { active: false } }).exec(function (err, favorite) {
          Document.update({ folderid: element._id }, { active: false,isSent: false }, { multi: true }).exec(function (err, document) {
            Document.find({ folderid: element._id }).exec(function (err, documents) {
              documents.forEach(filedata => {
                SharingPeople.update({ $and: [{ fromid: req.user._id }, { fileid: filedata._id },{active:true}] }, { active: false,fileDelete : true }, { multi: true }).exec(function (err, sharingpeople) {
                })
                Favorite.update({ $and: [{ uid: req.user._id }, { fileid: filedata._id }] }, { $set: { active: false } }).exec(function (err, sharingpeople) {
                })
              })
            })
          });
        })
      })
      updateall(element, req.user.id, false)
      callback()
    })
  }, function (err) {
    return res.status(201).json({ message: 'success' });
  });
};

/**
 * @api {post} /folders/multiselectmove Request update selected folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multiselectmove
 * @apiGroup Folder
 *
 * @apiParam {json} data will sent through request parameter.
 * @apiSuccess {String} 'Success' statement
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//multi select folder and file move
exports.multiselectmove = function (req, res) {
  var folders = req.body.folders
  var files = req.body.files
  var moveto = req.body.moveto
  if (moveto == 'root') var parentid = undefined
  else var parentid = moveto._id
  async.each(folders, function (element, callback) {
    Folder.update({ _id: element._id, }, { parentid: parentid }).exec(function (err, fol) {
      callback()
    })
  }, function (err) {
    async.each(files, function (element1, callback) {
      Document.update({ _id: element1._id, }, { folderid: parentid }).exec(function (err, fol) {
        callback()
      })
    }, function (err) {
      return res.status(201).json({ message: 'success' });

    })
  })
}

/**
 * @api {post} /folders/multiselect_Permenant_Delete Request delete selected folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multiselect_Permenant_Delete
 * @apiGroup Folder
 *
 * @apiParam {json} data will sent through request parameter.
 * @apiSuccess {String} 'Success' statement
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.multiselect_Permenant_Delete = function (req, res) {
  var folders = req.body.folders
  var files = req.body.files
  async.each(files, function (element, callback) {
    Document.findById(element._id, function (err, document) {
      if (err) { return handleError(res, err); }
      if (!document) { return res.status(404).send('Not Found'); }
      removeS3folder('convertimages/' + document.encryptedid + '/', function (resp) { console.log(resp) })
      removeS3(document.path, 'uploads')
      Docimage.remove({ $and: [{ documentid: document._id }, { active: true }] }).exec(function (err) { console.log(err) });
      document.remove(function (err) {
        if (err) { return handleError(res, err); }
        callback()
      });
    });
  }, function (err) {
    async.each(folders, function (element1, callback) {
      Folder.findById(element1, function (err, folder) {
        if (err) { return handleError(res, err); }
        if (!folder) { return res.status(404).send('Not Found'); }
        folder.first = true;
        Document.find({ folderid: folder._id, active: false }).exec(function (err, documents) {
          documents.forEach(element => {
            removeS3folder('convertimages/' + element.encryptedid + '/', function (resp) { console.log(resp) })
            removeS3(element.path, 'uploads')
            Docimage.remove({ $and: [{ documentid: element._id }, { active: true }] }).exec(function (err) { console.log(err) });
            element.remove(function (err) {
              if (err) { return handleError(res, err); }
            })
          })
        });
        deleteall(folder);
        folder.remove(function (err) {
          if (err) { return handleError(res, err); }
          callback()
        });
      })
    }, function (err) {
      return res.status(201).json({ message: 'success' });
    })
  })

}

/**
 * @api {post} /folders/getFoldersAndFiles/:id Request All files and folders
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getFoldersAndFiles
 * @apiGroup Folder
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {object} ALL_Fields Result of folder and files Documents.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//To get all the files and folders
exports.getFoldersAndFiles = function (req, res) {
  Folder.find({ $and: [{ userid: req.params.id }, { active: true }, { parentid: { $exists: false } }] }).exec(function (err, folders) {
    if (err) { return handleError(res, err); }
    else {
      Document.find({ $and: [{ uid: req.params.id }, { active: true }, { folderid: { $exists: false } }] }).exec(function (err, documents) {
        if (err) { return handleError(res, err); }
        else {
          return res.status(200).json({ folders: folders, files: documents });
        }
      });
    }
  });
}


//update Folder documents status
function updateall(folder, userid, activeStatus) {
  Folder.find({ parentid: folder._id }).exec(function (err, folders) {
    if (folders.length > 0) {  //for inside folder ,documents (RESTORE/DELETE);
      Folder.update({ parentid: folder._id, active: !activeStatus }, { active: activeStatus }, { multi: true }).exec(function (err, fol) { });
      folders.forEach(element => {
        if (!activeStatus) {   //change status for folder childerns (DELETE)
          SharingPeople.update({ $and: [{ fromid: userid }, { folderid: element._id },{active:true}] }, { $set: { active: false,fileDelete : true } }).exec(function (err, sharingpeople) {
            Favorite.update({ $and: [{ uid: userid }, { folderid: element._id }] }, { $set: { active: false } }).exec(function (err, sharingpeople) {
              Document.update({ folderid: element._id }, { $set: { active: false } }, { multi: true }).exec(function (err, document) {
                Document.find({ folderid: element._id }).exec(function (err, documents) {
                  if (documents && documents.length > 0) {
                    documents.forEach(filedata => {
                      SharingPeople.update({ $and: [{ fromid: userid }, { fileid: filedata._id },{active:true}] }, { $set: { active: false,} }).exec(function (err, sharingpeople) {
                      })
                      Favorite.update({ $and: [{ uid: userid }, { fileid: filedata._id }] }, { $set: { active: false } }).exec(function (err, sharingpeople) {
                      })
                      if ((documents.length - 1) == documents.indexOf(filedata)) updateall(element, userid, false);
                    })
                  }
                  else {
                    updateall(element, userid, false);
                  }
                })
              })
            })
          })
        }
        else   //changes the status (RESTORE)
        {
          Document.update({ folderid: element._id }, { active: true }, { multi: true }).exec(function (err, document) { });
          Document.find({ folderid: element._id }).exec(function (err, documents) {
            if (documents && documents.length > 0) {
              documents.forEach(filedata => {
                SharingPeople.update({ $and: [{ fromid: userid }, { fileid: filedata._id },{active:false},{fileDelete:true}] }, { $set: { active: true,fileDelete:false} }).exec(function (err, sharingpeople) {
                })
              })
            }
            
          })
          updateall(element, userid, true);
        }
      });
    }
    else {
      if (activeStatus && folder.first) // RESTORE documents in Parent Folder.
      {
        Document.update({ folderid: folder._id }, { active: true }, { multi: true }).exec(function (err, document) { });
        folder.first = false;
        updateall(folder, userid, true);
      }
    }
  });
}
//Delete from S3
async function removeS3(filePath, folderName) {

  var s3 = new AWS.S3({useAccelerateEndpoint: true});
  //configuring parameters
  var params = {
    Bucket: 'docintact',
    Key: folderName + '/' + path.basename(filePath)
  };
  try {
    s3.deleteObject(params, function (err, deldata) {
      if (err) console.log(err, err.stack);  // error
    });
  }
  catch (err) {
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


function deleteall(folder) {
  Folder.find({ parentid: folder._id }).exec(function (err, folders) {
    if (folders.length > 0) {  ////////for inside folder ,documents (DESTROY)
      Folder.remove({ parentid: folder._id, active: false }).exec(function (err, folder) { });
      Document.find({ folderid: folder._id, active: false }).exec(function (err, documents) {
        documents.forEach(element => {
          removeS3folder('convertimages/' + element.encryptedid + '/', function (resp) { console.log(resp) })
          removeS3(element.path, 'uploads')
          Docimage.remove({ $and: [{ documentid: element._id }, { active: true }] }).exec(function (err) { console.log(err) });
          element.remove(function (err) {
            if (err) { return handleError(res, err); }
          })
        })
      });
      folders.forEach(element => {
        deleteall(element);
      });
    }
    else {
      Document.find({ folderid: folder._id, active: false }).exec(function (err, documents) {
        documents.forEach(element => {
          removeS3folder('convertimages/' + element.encryptedid + '/', function (resp) { console.log(resp) })
          removeS3(element.path, 'uploads')
          Docimage.remove({ $and: [{ documentid: element._id }, { active: true }] }).exec(function (err) { console.log(err) });
          element.remove(function (err) {
            if (err) { return handleError(res, err); }
          })
        })
      });
    }
  });
}

function getchildrens(folders) {
  var childerdata = [];
  folders = JSON.parse(JSON.stringify(folders))
  async.each(folders, function (element, callback) {
    element.children = []
    Folder.find({ $and: [{ active: true }, { parentid: element._id }] }).exec(function (err, childfolders) {
      if (err) { return handleError(res, err); }
      else {
        childfolders.forEach(child => {
          element.children.push(child);
          if (childfolders.length - 1 == childfolders.indexOf(child)) {
            getchildrens(childfolders);
          }
        });
        callback();
        // getchildrens(folders)
      }
    });
  }, function (err) {
  })
}
// To remove duplicate file names
function removeNameDuplication(document,name, j) {
  return new Promise((resolve, reject) => {
      var search = name.split('.')[0];
      setTimeout(async () => {
          if (document.some( x=>String(x.name).toLowerCase()==String(search + ' (' + j + ')').toLowerCase())) {
              j++;
              resolve(await removeNameDuplication(document,search, j));
          } else {
              search = search + ' (' + j + ')'
              resolve(search);
          }        });
        
      
  })

}

function handleError(res, err) {
  return res.status(500).send(err);
}



