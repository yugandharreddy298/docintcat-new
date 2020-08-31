'use strict';

var _ = require('lodash');
var Sharingpeople = require('./sharingpeople.model');
var User = require('../user/user.model');
const nodemailer = require('nodemailer');
var async = require('async');
var Folder = require('../folder/folder.model')
var Document = require('../document/document.model')
var config = require('../../config/environment');
var key = "secretkey";
var crypto = require("crypto")
var Links = require('../links/links.model')
var filedValues = require('../fieldvalue/fieldvalue.model');

//to encrypt 
function encrypt(key, data) {
  var cipher = crypto.createCipher('aes-256-cbc', key);
  var crypted = cipher.update(data, 'utf-8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}
//to decrypt
function decrypt(key, data) {
  var decipher = crypto.createDecipher('aes-256-cbc', key);
  var decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

//to encrypt url 
function encrypturl(key, data) {
  var cipher = crypto.createCipher('aes-128-cbc', key);
  var crypted = cipher.update(data, 'utf-8', 'base64');
  crypted += cipher.final('base64');
  return crypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, 'cFcFc');
}
//to decrypturl url 
function decrypturl(key, data) {
  if (data != undefined) {
    var decode = data.replace('-', '+').replace('_', '/').replace('cFcFc', '=');
    var decipher = crypto.createDecipher('aes-128-cbc', key);
    var decrypted = decipher.update(decode, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
  else return false;

}
/**
 * @api {get} /sharingpeoples/checkpassword/:id/:password/:title Request Password information
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName checkpassword
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} /:id/:password/:title Will send through the url parameter.
 * @apiSuccess {Json}  Result of particular SharedRecord Password.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.checkpassword = function (req, res) {
  Sharingpeople.findById(req.params.id).exec(function (err, sharingpeoples) {
    if (err) { return handleError(res, err); }
    if (sharingpeoples && sharingpeoples.filepassword) {
      if (sharingpeoples.filepassword) sharingpeoples.filepassword = decrypt(key, sharingpeoples.filepassword.toString());
      if (req.params.title == 'passwordchecking') {
        if (sharingpeoples.filepassword == req.params.password) return res.status(200).send(true);
        else return res.status(200).send(false);
      }
      else if (req.params.title == 'getpassword') {
        res.status(200).send({ password: sharingpeoples.filepassword })
      }
    }
    else return res.status(200).send(false);
  })
}

/**
 * @api {get} /sharingpeoples/getsharingpeople/:id Request Shared Document information
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getsharingpeople
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} id Will send through the url parameter.
 * @apiSuccess {Json} ALL_Fields Result of All SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get list of sharingpeoples
exports.getsharingpeople = function (req, res) {
  Sharingpeople.find({ $and: [{ $or: [{ folderid: req.params.id }, { fileid: req.params.id }] }, { active: true }] })
  .populate('toid').populate('fromid').populate('fileid').populate('uid').populate('departmentid')
  .exec(function (err, sharingpeoples) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(sharingpeoples);
  });
}


/**
 * @api {get} /sgetfoldersharingpeople:id Request Shared record of folder  
 * @apiName getorgsharingpeople
 * @apiGroup sharingpeople
 * @apiParam {Sring/Number} id Will send through the url parameter.
 * @apiSuccess {Array} ALL_Fields Result of All SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getfoldersharingdata = function (req, res) {
  Sharingpeople.find({ $and: [{ _id: req.params.id }] }).populate('toid').populate('fromid').populate('folderid').exec(function (err, sharingpeoples) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(sharingpeoples)
  })
}
/**
 * @api {get} /sharingpeoples/getsharingpeople/auditlog/:id Request Shared Document audit log information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getsharingpeopleInauditLog
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} id Will send through the url parameter.
 * @apiSuccess {Array} ALL_Fields Result of All SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Audit log 
exports.getsharingpeopleInauditLog = function (req, res) {
  var FieldOptions = {}
  Sharingpeople.find({ $and: [{ $or: [{ fileid: req.params.id }, { folderid: req.params.id }] }, { active: true }] }).populate('toid').populate('fromid').exec(function (err, sharingpeoples) {
    if (err) { return handleError(res, err); }
    filedValues.find({ documentid: req.params.id }).sort({ _id: 'desc' }).exec(function (err, fieldOption) {
      if (err) { return handleError(res, err); }
      FieldOptions.fieldOption = fieldOption;
      FieldOptions.sharingpeoples = sharingpeoples;
      return res.status(200).json(FieldOptions);
    });
  });
}

/**
 * @api {get} /sharingpeoples/getorgsharingpeople/:id Request Shared Document  in Organization information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getorgsharingpeople
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} id Will send through the url parameter.
 * @apiSuccess {Array} ALL_Fields Result of All SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getorgsharingpeople = function (req, res) {
  Sharingpeople.find({ $and: [{ fromid: req.params.id }] }).exec(function (err, sharingpeoples) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(sharingpeoples)
  })
}

/**
 * @api {get} /sharingpeoples/getempbygroup/:id Request Shared Group Document  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getempbygroup
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} id Will send through the url parameter.
 * @apiSuccess {Array} ALL_Fields Result of particular Group SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getempbygroup = function (req, res) {
  Sharingpeople.find({ groupid: req.params.id }).exec(function (err, sharingpeoples) {
    if (err) {
      return handleError(res, err);
    }
    else {
      return res.status(200).json(sharingpeoples);
    }
  })
}

/**
 * @api {get} /sharingpeoples/getSharedDoc/:id Request Shared  Document  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getSharedDoc
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} id Will send through the url parameter.
 * @apiSuccess {Json} ALL_Fields Result of particular  SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get Shared Document record
exports.getSharedDoc = function (req, res) {
  Sharingpeople.findById({ _id: req.params.id }).populate('toid').populate('fromid').populate('fileid').exec(function (err, sharingpeoples) {
    if (err) {
      return handleError(res, err);
    }
    if (!sharingpeoples) { return res.status(404).send('Not Found'); }
    else {
      if (sharingpeoples.access_expirydate) {
        if (sharingpeoples.access_expirydate >= new Date()) return res.status(200).json(sharingpeoples);
        else return res.status(400).json({ message: 'Expired' });
      }
      return res.status(200).json(sharingpeoples);
    }
  });
}

/**
 * @api {get} /sharingpeoples/getshareDocbasedemp/:id Request Shared Group Document  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getshareDocbasedemp
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} id Will send through the url parameter.
 * @apiSuccess {Array} ALL_Fields Result of particular Group SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getshareDocbasedemp = function (req, res) {
  Sharingpeople.find({ groupid: req.params.id }).populate('fileid').populate('toid').exec(function (err, sharingpeoples) {
    if (err) { return handleError(res, err) }
    else { return res.status(200).json(sharingpeoples); }
  })
}

/**
 * @api {Post} /sharingpeoples/getCurVerSharedPeopleList/ Request Shared  Document  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName CurVerSharedPeopleList
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body .
 * @apiSuccess {Array} ALL_Fields Result of particular  SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get Current Version Shared People List
exports.CurVerSharedPeopleList = function (req, res) {
  Sharingpeople.find({ $and: [{ fileid: req.body.documentid }, { active: true }] }).exec(function (err, sharingpeoples) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(sharingpeoples);
  });
}

/**
 * @api {Post} /sharingpeoples/updateCurVerSharedPeopleList/  Update Current Version Shared People List 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName updateCurVerSharedPeopleList
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body .
 * @apiSuccess {Array} ALL_Fields Result of particular  SharedRecord.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Update Current Version Shared People List
exports.updateCurVerSharedPeopleList = function (req, res) {
  Sharingpeople.find({ $and: [{ fileid: req.body.documentid }, { active: true }] }).exec(function (err, sharingpeoples) {
    if (err) { return handleError(res, err); }
    if (!sharingpeoples) { return res.status(404).send('Not Found'); }
    async.each(sharingpeoples, function (element, call) {
      var updated = JSON.parse(JSON.stringify(element));
      updated = _.merge(element, updated);
      updated.updated_at = Date.now();
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        call();
      });
    });
    return res.status(201).json({ res: "Success" });
  });
}

/**
 * @api {get} /sharingpeoples/shared/sharedDocuments Request Shared  Document  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName sharedDocuments
 * @apiGroup sharingpeople
 *
 * @apiSuccess {Array} ALL_Fields Result of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// get loged in users shared documents
exports.sharedDocuments = function (req, res) {
  Sharingpeople.find({ $and: [{ toemail: req.user.email }, { active: true }, { revoke: false }] }).sort({ created_at: 'desc' }).populate('toid').populate('fromid')
    .populate('fileid').populate('folderid').exec(function (err, sharingpeoples) {
      if (err) { return handleError(res, err); }
      if (sharingpeoples) {
        return res.status(200).json(sharingpeoples);
      }
    });
};

/**
 * @api {get} /sharingpeoples/ Request Shared  Document  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup sharingpeople
 *
 * @apiSuccess {Array} ALL_Fields Result of SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get list of sharingpeoples documents
exports.index = function (req, res) {
  Sharingpeople.find({ $and: [{ toid: req.user.id }, { active: true }] }).populate('toid').populate('fromid')
    .populate('fileid').populate('folderid').exec(function (err, sharingpeoples) {
      if (err) { return handleError(res, err); }
      else return res.status(200).json(sharingpeoples);
    });
};

/**
 * @api {get} /sharingpeoples/getSharePeopleEmails Request emails of shared  information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getSharePeopleEmails
 * @apiGroup sharingpeople
 *
 * @apiSuccess {Array} ALL_emails of  SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get list of shared peoples 
exports.getSharePeopleEmails = function (req, res) {
  Sharingpeople.find({ $or: [{ fromid: req.user.id }] }).populate('toid').populate('fromid')
    .populate('fileid').populate('folderid').exec(function (err, sharingpeoples) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(sharingpeoples);
    });
};

/**
 * @api {get} /sharingpeoples/:id Request  shared  Record Password information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getpass
 * @apiGroup sharingpeople
 *
 * @apiSuccess {Json} Password  SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getpass = function (req, res) {
  var query = decrypturl(key, req.params.id);
  Links.findById(query).populate('shareddocumentid').populate('toid').exec(function (err, link) {
    if (err) {
      res.status(200).json({ "error": "error" })
    }
    else if (!link) res.status(200).json({ "error": "not found" })
    else if (link && link.active == true) {
      var sharingpeoples = link.shareddocumentid
      if (link.shareddocumentid) {
        Sharingpeople.findOne({ $and: [{ active: true }, { _id: link.shareddocumentid._id }] }).populate('toid').exec(function (err, sharingpeoples) {
          if (err) {
            res.status(200).json({ "error": "error" })
          }
          else if (sharingpeoples) {
            sharingpeoples.validity = 'notexpired'

            if (sharingpeoples.filepassword) var decryptid = decrypt(key, sharingpeoples.filepassword.toString());
            sharingpeoples.filepassword = decryptid;
            return res.json(sharingpeoples);
          }
          else {
            return res.json(sharingpeoples);
          }
        })
      }
      else {
        var sharingpeoples = { validity: 'not exists' }
        return res.json(sharingpeoples);
      }
    }
    else {
      var sharingpeoples = { validity: 'expired' }
      return res.json(sharingpeoples);
    }
  });
}

/**
 * @api {Post} /sharingpeoples/ create SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Json} All_fields of  SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.create = function (req, res) {
  var userArray = []
  var sharedData = []
  userArray = req.body.user
  async.each(userArray, function (element, call) {
    var sharingData = {}
    sharingData.pin = req.body.pin
    sharingData.toemail = element.email
    sharingData.toid = element._id;
    sharingData.fromid = req.user.id;
    if (req.body.fileid) { sharingData.fileid = req.body.fileid; }
    if (req.body.folderid) sharingData.folderid = req.body.folderid
    sharingData.accesstype = req.body.access;

    if (req.body.filepassword) {
      var encryptedid = encrypt(key, req.body.filepassword.toString());
      sharingData.filepassword = encryptedid
    }
    if (req.body.title == 'Signature') { sharingData.view = false; sharingData.edit = true; }
    if (req.body.title == 'Review') { sharingData.view = true; sharingData.edit = false; }
    if (req.body.Download) sharingData.Download = true;
    if (req.body.Copy) sharingData.Copy = true;
    if (req.body.Comment) sharingData.comment = true;
    if (req.body.VersionAccess) sharingData.VersionAccess = true;
    if (req.body.Chat) sharingData.Chat = true;
    if (req.body.heatmaps) sharingData.heatmaps = true;
    if (req.body.VideoRecord) sharingData.VideoRecord = true;
    if (req.body.message) { sharingData.message = req.body.message }
    if (req.body.access_expirydate) { sharingData.access_expirydate = req.body.access_expirydate }
    Sharingpeople.findOne({ $and: [{ fromid: req.user.id, toemail: element.email, active: true }, { $or: [{ fileid: req.body.fileid, folderid: req.body.folderid }] }] }).exec(function (err, sharingsamepeople) {

      if (sharingsamepeople) { //if already exits update
        var updated = _.merge(sharingsamepeople, sharingData);
        if (req.body.access == 'Allowusers' || (req.body.access == 'public')) updated.filepassword = undefined
        updated.updated_at = Date.now();
        updated.save(function (err) {

          if (err) { return handleError(res, err); }
           sendEmail(updated, element, req.body, req.user, req)
          sharedData.push(updated)
          call()
        });

      }
      else {
        sharingData.created_at = new Date();
        Sharingpeople.create(sharingData, function (err, sharingpeople) {//create new one
          if (err) {
            return handleError(res, err);
          }
          else {
            sharedData.push(sharingpeople)
          sendEmail(sharingpeople, element, req.body, req.user, req)
            call()
          }
        });
      }
    })
  }, function (err) {
    return res.status(201).json(sharedData);
  })
};

/**
 * @api {Post} /sharingpeoples/fileid/ Request Passwords SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName filedecrypt
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Json} All_fields of  Particular SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.filedecrypt = function (req, res) {
  var decryptid = decrypt(key, req.body.id);
  var id = decryptid
  req.body.id = id
  Sharingpeople.findOne({ $and: [{ $or: [{ fromid: req.user.id }, { toid: req.user.id }] }, { $or: [{ fileid: req.body.id }, { folderid: req.body.id }] }] }).populate('toid').populate('fromid').populate('fileid').populate('folderid').exec(async function (err, sharingpeoples) {
    if (err) { return handleError(res, err); }
    sharingpeoples.filepassword = await decrypt(key, sharingpeoples.filepassword);
     return res.json(sharingpeoples);
  })
}

/**
 * @api {Post} /sharingpeoples/checkallusers/ Request Alluser  SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName checkallusers
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Array} All_fields of  user .
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.checkallusers = function (req, res) {
  User.find({ email: req.body.email }, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(400).send();
     else return res.status(200).send(user);
  });

}

/**
 * @api {Post} /sharingpeoples/fileid1/  Request Passwords SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName filedecrypt1
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Json} All_fields of  Particular SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.filedecrypt1 = function (req, res) {
  var decryptid = decrypt(key, req.body.id);
  var id = decryptid
  req.body.id = id
  Sharingpeople.findOne({ $and: [{ $or: [{ fromid: req.user.id }, { toid: req.user.id }] }, { $or: [{ fileid: req.body.id }, { folderid: req.body.id }] }] })
    .populate('toid').populate('fromid').populate('fileid').populate('folderid').exec(async function (err, sharingpeoples) {
      if (err) { return handleError(res, err); }
      sharingpeoples.filepassword = await decrypt(key, sharingpeoples.filepassword);
      return res.json(sharingpeoples);
    })
}

/**
 * @api {put} /sharingpeoples/sharedoc/update/:id  Update All SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update
 * @apiGroup sharingpeople
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Sharingpeople.findById(req.params.id, function (err, sharingpeople) {
    if (err) { return handleError(res, err); }
    if (!sharingpeople) { return res.status(404).send('Not Found'); }
    var updated = _.merge(sharingpeople, req.body);
    updated.updated_at = Date.now();
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(sharingpeople);
    });
  });
};
/**
 * @api {put} /sharingpeoples/:id  Update individual SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName Sharedpeopleupdate
 * @apiGroup sharingpeople
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//update individual file
exports.Sharedpeopleupdate = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  if (req.body.updateforAgree) { }
  else updatelink(req.params.id)
  if (req.body.title == 'Signature') { req.body.view = false; req.body.edit = true; }
  if (req.body.title == 'Review') { req.body.view = true; req.body.edit = false; }
  req.body.comment = req.body.Comment;
  if (req.body.filepassword) { req.body.filepassword = encrypt(key, req.body.filepassword.toString()); }
  Sharingpeople.findById(req.params.id, function (err, sharingpeople) {
    if (err) { return handleError(res, err); }
    if (!sharingpeople) return res.status(404).send('Not Found');
    var updated = _.merge(sharingpeople, req.body);
    updated.updated_at = Date.now();
    updated.save(function (err) {
      if (!req.body.revokeStatus) sendEmail(updated, sharingpeople, req.body, req.user, req)
      else if (req.body.revokeStatus == 'Revoke') {
        req.body.revokeStatus = null
        revokeEmail(sharingpeople, req.user)
      }
      else if (req.body.revokeStatus == 'Un Revoke') {
        req.body.revokeStatus = null
        unRevokeEmail(sharingpeople, req.user)
      }
      if (err) { return handleError(res, err); }
      return res.status(200).json("updated");

    });
  });
};

/**
 * @api {put} /sharingpeoples/removedepartsharing/:id Update individual SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName removedepartsharing
 * @apiGroup sharingpeople
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {Array} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.removedepartsharing = function (req, res) {
  Sharingpeople.find({ departmentid: req.params.id }, function (err, sharingpeople) {
    if (err) { return handleError(res, err); }
    if (!sharingpeople) { return res.status(404).send('Not Found'); }
    async.forEach(sharingpeople, function (element, callback) {
      element.active = false
      element.updated_at = Date.now();
      element.save(function (err) {
      });
      callback();
      }, function (err) {
        return res.status(201).json({ data: "success" });
     });
   });
}

/**
 * @api {put} /sharingpeoples/updateorgsharingpeople/:id Update individual SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName updateorgsharingpeople
 * @apiGroup sharingpeople
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {String}  updated
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.updateorgsharingpeople = function (req, res) {
  Sharingpeople.find({ $and: [{ fileid: req.params.id }, { toid: req.body._id }, { fromid: req.body.organizationid }] }).exec(function (err, sharingpeople) {
    sharingpeople[0].orgfileviewstatus = true;
    sharingpeople[0].updated_at = Date.now();
    sharingpeople[0].save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json("updated");
    });
  })
}

/**
 * @api {post} /sharingpeoples/AllSharedpeopleupdate Update All SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName AllSharedpeopleupdate
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data will send through the request body.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//updateall
exports.AllSharedpeopleupdate = function (req, res) {
  async.each(req.body.employees, async function (element, call) {
    if (element.Sharetype == 'Signature') { element.view = false; element.edit = true }
    if (element.Sharetype == 'Review') { element.view = true; element.edit = false }
    if (element.pin) element.pin = element.pin; else element.pin = false
    element.accesstype = req.body.accesstype
    async.each(element.shareAccess, function (elementshare, callback) {
      if (elementshare == 'heatmaps') { element.heatmaps = true }
      if (elementshare == 'Download') { element.Download = true }
      if (elementshare == 'Copy') { element.Copy = true }
      if (elementshare == 'Comment') { element.comment = true }
      if (elementshare == 'VersionAccess') { element.VersionAccess = true }
      if (elementshare == 'Chat') { element.Chat = true }
      if (elementshare == 'VideoRecord') { element.VideoRecord = true }
    });
    if (element.access_expirydate) { element.access_expirydate = element.access_expirydate }
    else element.access_expirydate = null
    if (element.filepassword) { element.filepassword = encrypt(key, element.filepassword.toString()); }
    else element.filepassword = null
    Sharingpeople.findById(element._id, function (err, sharingpeople) {
      var updated = _.merge(sharingpeople, element);
      updated.updated_at = Date.now();
      Sharingpeople.findByIdAndUpdate(updated._id, updated, function (err, updatedrecord) {
        sendEmail(updated, sharingpeople, req.body, req.user, req)
        if (err) { return handleError(res, err); }
      });
    });
  }, function (err) {
    return res.status(200).json("updated");
  });
};

/**
 * @api {delete} /sharingpeoples/:id Update All SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup sharingpeople
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Deletes a sharingpeople from the DB.
exports.destroy = function (req, res) {
  Sharingpeople.findById(req.params.id, function (err, sharingpeople) {
    if (err) { return handleError(res, err); }
    if (!sharingpeople) { return res.status(404).send('Not Found'); }
    sharingpeople.active = false
    sharingpeople.updated_at = Date.now();
    sharingpeople.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(201).json({ data: "success" });
    });
  });
};

/**
 * @api {post} /sharingpeoples/multiFolder/ShareDelete Request to delete SharedRecords
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName ShareDeleteMulti
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body.
 * @apiSuccess {String} Success 
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.ShareDeleteMulti = function (req, res) {
  var folders = req.body.folders
  var files = req.body.files
  async.each(folders, function (element, callback) {
    Sharingpeople.update({ _id: element.sharedid }, { active: false }).exec(function (err, sharingpeople) {
      callback()
    })
  }, function () {
    async.each(files, function (element, callback) {
      Sharingpeople.update({ _id: element.sharedid }, { active: false }).exec(function (err, sharingpeople) {
        var status
        Sharingpeople.find({ fileid: element._id , active: true }).exec(function (err, sharingpeoples) {
            let completedEmails = sharingpeoples.filter(email =>
              ((email.signed && email.reviewed) || (email.signed && !email.view) || (email.reviewed && email.view)));
            if (sharingpeoples.length === 0) {
              status = 'upload' ;
            } else if (completedEmails.length === sharingpeoples.length) {
             status = 'Completed' ;
            } else if (completedEmails.length !== 0 && completedEmails.length < sharingpeoples.length) {
              status = 'Partially completed' ;
            } else if (completedEmails.length === 0) {
              status =  'Waiting for Sign' ;
            }
            Document.update({ _id: element._id }, { status: status }).exec(function (err, document) {
              callback()
            })
        })
      })
    },function (err) {
      return res.status(200).json("sucess");
    })
  });
};

/**
 * @api {post} /sharingpeoples/Shareto_Department create SharedRecords for departmnets
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName Shareto_Department
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.Shareto_Department = function (req, res) {
  var userArray = []
  var sharedData = []
  userArray = req.body.employees
  if (req.body.fileid) {
    var groupdata = req.body.fileid._id + getRandomInt(1234560);
  }
  if (req.body.folderid) {
    var groupdata = req.body.folderid._id + getRandomInt(1234560);
  }
  async.each(userArray, function (element, call) {
    var sharingData = {}
    sharingData.fromid = req.user.id;
    sharingData.accesstype = element.access
    sharingData.departmentid = element.department
    if (req.body.fileid) { sharingData.fileid = req.body.fileid._id; sharingData.filename = req.body.fileid.name }
    if (req.body.folderid) sharingData.folderid = req.body.folderid
    if (element.filepassword) {
      var encryptedid = encrypt(key, element.filepassword.toString());
      sharingData.filepassword = encryptedid
    }
    sharingData.groupid = groupdata;
    sharingData.pin = element.pin
    var departmentfound = req.body.departmentlevels.find(el => el.value === sharingData.departmentid)
    sharingData.departmentlevels = departmentfound;
    sharingData.orgfileviewstatus = false;
    if (element.title == 'Signature') { sharingData.view = false; sharingData.edit = true; }
    if (element.title == 'Review') { sharingData.view = true; sharingData.edit = false; }
    if (element.message) { sharingData.message = element.message }
    if (element.access_expirydate) { sharingData.access_expirydate = element.access_expirydate }
    async.each(element.shareAccess, function (elementshare, callback) {
      if (elementshare == 'heatmaps') { sharingData.heatmaps = true }
      if (elementshare == 'Download') { sharingData.Download = true }
      if (elementshare == 'Copy') { sharingData.Copy = true }
      if (elementshare == 'Comment') { sharingData.comment = true }
      if (elementshare == 'VersionAccess') { sharingData.VersionAccess = true }
      if (elementshare == 'Chat') { sharingData.Chat = true }
      if (elementshare == 'VideoRecord') { sharingData.VideoRecord = true }
    });

    sharingData.toemail = element.email
    sharingData.toid = element._id
    sharingData.created_at = new Date();
    sharingData.organizationShare = req.body.organizationShare;
    Sharingpeople.create(sharingData, function (err, sharingpeople) {//create new one
      if (err) {
        return handleError(res, err);
      }
      else {
        sharedData.push(sharingpeople)
        var sharedata = {}
        sharedata = sharingData
        if (req.body.fileid) {
          sharedata.fileid = req.body.fileid
        }
        if (req.body.folderid) {
          sharedata.folderid = req.body.folderid
        }
        sendEmail(sharingpeople, element, sharedata, req.user, req)
        call()
      }
    });

  }, function (err) {
    return res.status(201).json(sharedData);
  })
};

/**
 * @api {post} /sharingpeoples/multisharetodepartment create SharedRecords for multi departmnets
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multisharetodepartment
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
//multiple document share with department
exports.multisharetodepartment = function (req, res) {
  var userArray = []
  var sharedData = []
  var folders = req.body.folder
  var files = req.body.file
  userArray = req.body.employees
  var groupdata = req.body.fileid + getRandomInt(1234560);
  async.each(userArray, function (element, call) {
    var sharingData = {}
    sharingData.fromid = req.user.id;
    sharingData.accesstype = element.access
    sharingData.departmentid = element.department
    if (element.filepassword) {
      var encryptedid = encrypt(key, element.filepassword.toString());
      sharingData.filepassword = encryptedid
    }
    sharingData.groupid = groupdata;
    sharingData.pin = element.pin
    sharingData.orgfileviewstatus = false;
    if (element.title == 'Signature') { sharingData.view = false; sharingData.edit = true; }
    if (element.title == 'Review') { sharingData.view = true; sharingData.edit = false; }
    if (element.message) { sharingData.message = element.message }
    if (element.access_expirydate) { sharingData.access_expirydate = element.access_expirydate }
  async.each(element.shareAccess, function (elementshare, callback) {
      if (elementshare == 'heatmaps') { sharingData.heatmaps = true }
      if (elementshare == 'Download') { sharingData.Download = true }
      if (elementshare == 'Copy') { sharingData.Copy = true }
      if (elementshare == 'Comment') { sharingData.comment = true }
      if (elementshare == 'VersionAccess') { sharingData.VersionAccess = true }
      if (elementshare == 'Chat') { sharingData.Chat = true }
      if (elementshare == 'VideoRecord') { sharingData.VideoRecord = true }
    });

    sharingData.toemail = element.email
    sharingData.toid = element._id
    sharingData.created_at = new Date();
    async.eachOfSeries(files, function (file, x_index, outerCallback) {
      multisharecreation1(element, file, req, sharingData, function (resp) {
        if (resp) {
          sharedData = sharedData.concat(resp);
          multishare_document_update(file, function (reslut) {
            if (reslut) outerCallback()
          })
        }
      })
    }, function (err) {
      async.eachOfSeries(folders, function (folder, x_index, outerCallback1) {
        multisharecreation1(element, folder, req, sharingData, function (resp) {
          if (resp) {
            sharedData = sharedData.concat(resp);
            multishare_document_update(folder, function (reslut) {
              if (reslut) outerCallback1()
            })
          }
        })
      }, function (err) {
        call();
      })
    })
  }, function (err) {
    return res.status(201).json(sharedData);
  })
};

/**
 * @api {post} /SharedWith_Departments Request SharedRecords of departmnets
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multisharetodepartment
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.SharedWith_Departments = function (req, res) {
  var sharedData = []
  async.each(req.body.allDepartmentss, function (element, callback) {
    Sharingpeople.find({ $and: [{$or:[{fileid: req.body.document._id},{folderid:req.body.document._id}], departmentid: element._id, active: true }] }).populate('toid').exec(function (err, sharingpeople) {
      if (err) {
        return handleError(res, err);
      }
      else {
        if (typeof sharingpeople !== 'undefined' && sharingpeople.length > 0) {
          sharedData.push({ department_id: element._id, department_name: element.deptname, Sharedwith: sharingpeople })
        }
        callback();
       }
    })
  }, function (err) {
    return res.status(201).json(sharedData);
  })
};

/**
 * @api {post} /sharingpeoples/multishare Request to multishare of file
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multishare
 * @apiGroup sharingpeople
 *
 * @apiParam {json} data Will send through the body.
 * @apiSuccess {Json} All_fields of   SharedRecords.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.multishare = function (req, res) {
  var userArray = []
  var sharedData = []
  var folders = req.body.folder
  var files = req.body.file
  userArray = req.body.user
  var sharingData = {}
  sharingData.pin = req.body.pin
  sharingData.fromid = req.user.id;
  sharingData.accesstype = req.body.access;
  if (req.body.title == 'Signature') { sharingData.view = false; sharingData.edit = true; }
  if (req.body.title == 'Review') { sharingData.view = true; sharingData.edit = false; }
  if (req.body.Download) sharingData.Download = true;
  if (req.body.Copy) sharingData.Copy = true;
  if (req.body.Comment) sharingData.comment = true;
  if (req.body.VersionAccess) sharingData.VersionAccess = true;
  if (req.body.Chat) sharingData.Chat = true;
  if (req.body.heatmaps) sharingData.heatmaps = true;
  if (req.body.VideoRecord) sharingData.VideoRecord = true;
  if (req.body.message) { sharingData.message = req.body.message }
  if (req.body.access_expirydate) { sharingData.access_expirydate = req.body.access_expirydate }
  if (req.body.filepassword) {
    var encryptedid = encrypt(key, req.body.filepassword.toString());
    sharingData.filepassword = encryptedid
  }
  async.eachOfSeries(files, function (file, x_index, outerCallback) {
    multisharecreation(userArray, file, req, sharingData, function (resp) {
      if (resp) {
        sharedData = sharedData.concat(resp);
        multishare_document_update(file, function (reslut) {
          if (reslut) outerCallback()
        })
      }
    })
  }, function (err) {
    async.eachOfSeries(folders, function (folder, x_index, outerCallback1) {
      multisharecreation(userArray, folder, req, sharingData, function (resp) {
        if (resp) {
          sharedData = sharedData.concat(resp);
          multishare_document_update(folder, function (reslut) {
            if (reslut) outerCallback1()
          })
        }
      })
    }, function (err) {
      return res.status(201).json(sharedData);
    })
  })
}


//email template for revoke
function revokeEmail(sharingpeople, user) {
  if (user.name) var name = user.name
  if (user.companyname) var name = user.companyname
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25, // use SSL
    auth: {
      user: config.email,
      pass: config.password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  var HelperOptions = {
    from: '"DOCINTACT" '+config.email,
    to: sharingpeople.toemail,
    subject: name + " has denied the access to view the document",
  };


  HelperOptions.html = '<div class="background" style= "width: 680px; height: 815px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
    '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
    '<div class="innrbackground"  style=" width: 580px; height: 679px; background-color: #FFF; text-align: center; margin: auto;">' +
    '<a href="#"><img src="https://staging.docintact.com/assets/images/revokeimg.png"></a><hr style="border: 1px solid #f4f7fa;;width:100%;">' +
    '<h2 style="margin-top: 0.9rem; font-size:21px; font-weight: 500;color: #000;margin-left: -122px;padding-top:35px;" >Caution :You cannot view this file</h2>' +
    '<ul style="list-style:none;text-align: left;">' +
    '<li style="padding-bottom:10px;">' + name + ' has declined the Access.</li>' +
    '<li style="padding-top:5px;padding-bottom:10px;margin-left:0px;">Doc Intact respects your privacy, to learn more read our Privacy Statement. If you have any queries reach us @ no-reply@docintact.com </li>' +
    '<li style="text-align:center;margin-top:25px;font-size:20px;">Thanks for using DocIntact !</li>' +
    '</ul>' +

    '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +
    '<p style="font-size:16px; margin: 65px; margin-top:4px; margin-bottom: 18px; color: #A2A2A3;">Note: This is an auto-generated mail, please do not reply.</p>' +
    '</div>' +
    '<p style="font-size: 14px;color: #A2A2A3;"><img src ="https://staging.docintact.com/assets/images/careof.png" style="vertical-align: text-top;">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
    '</div>'

 transporter.sendMail(HelperOptions, function (err, info) {
    if (err) { console.log(err) }
    else { console.log("sucess") }
  });
}
//email template for un-revoke
function unRevokeEmail(sharingpeople, user) {
  var linkdata = {};
  if (user.name) var name = user.name
  if (user.companyname) var name = user.companyname
  linkdata.fromid = sharingpeople.fromid
  linkdata.toid = sharingpeople.toid
  linkdata.shareddocumentid = sharingpeople._id
  Links.create(linkdata, function (err, link) {
    var sharingdocumentid = encrypturl(key, link._id.toString());
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 25, // use SSL
      auth: {
        user: config.email,
        pass: config.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    var HelperOptions = {
      from: '"DOCINTACT "'+config.email,
      to: sharingpeople.toemail,
      subject: name + " has given you the access to view the document",
    };


    HelperOptions.html = '<div class="background" style= "width: 680px; height: 815px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
      '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
      '<div class="innrbackground"  style=" width: 580px; height: 679px; background-color: #FFF; text-align: center; margin: auto;">' +
      '<a href="#"><img src="https://staging.docintact.com/assets/images/unrevoke.png" ></a>' +
      '<div class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary"  href="' + config.frontendUrl + "/user/allowusers/" + sharingdocumentid + '" style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;color:#000;background-color:#FFC324;border:1px solid #FFC324; font-size: 16px;border-radius: 5px; padding: 8px 10px;" target="_blank">View Document</a></div><hr style="border: 1px solid #f4f7fa;;width:100%;">' +
      '<h2 style="margin-top:40px;  font-size:21px; font-weight: 500;color: #4CA2D1;margin-left: -122px;" >Caution :You can now access the document.</h2>' +
      '<ul style="list-style:none;text-align: left;">' +
      '<li style="padding-bottom:10px;margin-left:0px;">' + name + ' has un-revoked the document.</li>' +
      '<li style="padding-top:5px;padding-bottom:10px;margin-left:0px;">Doc Intact respects your privacy, to learn more read our Privacy Statement. If you have any queries reach us @ no-reply@docintact.com </li>' +
      '<li style="text-align:center;margin-top:30px;font-size:20px;">Thanks for using DocIntact !</li>' +
      '</ul>' +

      '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +
      '<p style="font-size:16px; margin: 65px; margin-top:4px; margin-bottom: 18px; color: #A2A2A3;">Note: This is an auto-generated mail, please do not reply.</p>' +
      '</div>' +
      '<p style="font-size: 14px;color: #A2A2A3;"><img src ="https://staging.docintact.com/assets/images/careof.png" style="vertical-align: text-top;">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
      '</div>'
  transporter.sendMail(HelperOptions, function (err, info) {
      if (err) { console.log(err) }
      else { console.log("sucess") }
    });
  })
}
// Function to send email
function sendEmail(Emaildata, Sharindetail, requestedbody, userdata, req) {
  if (req.headers && req.headers.ipaddress) {
    req.body.IpAddress = req.headers.ipaddress
  }
  else {
    req.body.IpAddress = req.body.IpAddress
  }
  if (userdata.companyname) {
  userdata.name = userdata.companyname
  }
  var linkdata = {};
  // console.log(requestedbody);
  if (requestedbody.folderid) requestedbody.fileid = requestedbody.folderid;
  linkdata.fromid = Emaildata.fromid
  linkdata.toid = Emaildata.toid
  linkdata.shareddocumentid = Emaildata._id
  if (userdata.name) var name = userdata.name
  if (userdata.companyname) var name = userdata.companyname
  Links.create(linkdata, function (err, link) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 25, // use SSL
      auth: {
        user: config.email,
        pass: config.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    var noPin = true;
    if (Emaildata.pin) {
      noPin = false
    }
    var subject;
    var sharingdocumentid = encrypturl(key, link._id.toString());
  if(requestedbody && requestedbody.fileid &&  !requestedbody.folderid) subject=' shared a document with you'
  if(requestedbody && requestedbody.folderid) subject=' shared a Folder with you'
    var HelperOptions = {
      from: '"DOCINTACT "'+config.email,
      to: Emaildata.toemail,
      subject: name + subject,
    }
    // Email Body Start
    var msg = '';
    var msg1 = '';
    if (requestedbody && requestedbody.message) msg1 = '<div > ' + requestedbody.message.replace(/\n/g, "<br />") + ' </div>';
    if (requestedbody && requestedbody.fileid && !requestedbody.folderid) {
      Document.findById(requestedbody.fileid, function (err, document) {
      msg += '<div class="a3s aXjCH msg233836446190015510" id=":q2"><div style="width:100%!important;font-family:Helvetica,sans-serif;margin:0;padding:0;">' +
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
          '<h2 class="m_233836446190015510header-title-text m_233836446190015510white-text-color" style="display:inline-block;font-weight:300;color:white;margin:17px 10px 13px 15px;">' + name + '</h2><span class="m_233836446190015510dh-white-wordmark" style="padding-right:20px;vertical-align:bottom;float:right;margin:21px 10px 0 0;">&nbsp;<span class="m_233836446190015510via-text m_233836446190015510white-text" style="color:white;">via</span> <a href="' + config.frontendUrl + '"  style="color:white;text-decoration:none;" target="_blank"><strong>DocIntact</strong></a></span></td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr>' +
          '<tr>' +
          '<td class="m_233836446190015510body-content" style="border-collapse:collapse;padding:20px 30px 50px;"><span class="im"> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + msg1 + '</h3> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + ' Click the below button to view the document</h3></span>' +
          '<table class="m_233836446190015510two-column-preview" style="border-collapse:collapse;width:100%;">' +
          '<tbody>' +
          '<tr>' +
          '<td class="m_233836446190015510no-border m_233836446190015510thumb-content-column" style="border-collapse:collapse;width:180px!important;max-width:180px!important;margin:10px;border:none;" valign="top">' +
          '<a  href="' + config.frontendUrl + "/user/allowusers/" + sharingdocumentid + '" style="text-decoration:none;" target="_blank"><img class="m_233836446190015510document-thumbnail-image CToWUd fr-fic fr-dib" src="https://staging.docintact.com/assets/images/document.png" alt="test.pdf" style="outline: none; text-decoration: none; border: none; width: 150px !important; max-width: 150px !important;"></a></td>' +
          '<td class="m_233836446190015510no-border m_233836446190015510body-content-column" style="border-collapse:collapse;width:inherit!important;margin:10px;border:none;" valign="top">' +
          '<h3><strong></strong></h3><span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary"  href="' + config.frontendUrl + "/user/allowusers/" + sharingdocumentid + '" style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;color:#fff;background-color:#0275d8;border:1px solid #0275d8;font-size: 16px;border-radius: 5px; padding: 8px 10px;" target="_blank">View Document</a><div class="m_233836446190015510sent-by-text" style="font-size:14px;margin-top:16px;"><div>Shared by ' + userdata.name + '</div><div class="m_233836446190015510text-muted"><div>Document : ' + document.name + '</div></div></div></span></td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '<div class="yj6qo ajU ">' +
          '<div aria-expanded="false" aria-label="Show trimmed content" class="ajR" data-tooltip="Show trimmed content" id=":qi" tabindex="0"><img class="ajT fr-fic fr-dib" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif" style="display:none"></div></div>' +
          '<div class="adL">' +
          '<div class="adm">' +
          '<div class="ajR h4" id="q_8">' +
          '<div class="ajT">' +
          '<br>' +
          '</div></div></div>' +
          '<div class="h5">' +
          '<table class="m_233836446190015510footer" style="border-collapse:collapse;max-width:900px;width:100%;font-size:13px;margin:20px auto;">' +
          '<tbody>' +
          '<tr>' +
          '<td align="center" style="border-collapse:collapse;font-family:Arial;color:#777;">' +
          '<div>Sent by ' + userdata.name + ' (<a href="mailto:' + userdata.email + '" target="_blank">' + userdata.email + '</a>, IP: ' + req.body.IpAddress + ').</div>' +
          '<div>Powered by <a href="' + config.frontendUrl + '" style="text-decoration:none;" target="_blank">DocIntact.com</a> - View and sign PDFs in your web browser</div>' +
          '<div>&copy; 2019-2020 CognitiveInnovations.com</div>' +
          '</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>' +
          '</div></div></div>' +
          '<div class="adL">' +
          '<br>' +
          '</div></div>' +
          '<div class="adL">' +
          '<br>' +
          '</div></div>'
        HelperOptions.html = msg;
        // Email Body End
        transporter.sendMail(HelperOptions, function (err, info) {
          if (err) { console.log("error occured when sending mail" + err) }
        });
     })
     } 
     else {
       if(requestedbody  && requestedbody.folderid){
        Folder.findById(requestedbody.folderid, function (err, folder) {
          msg += '<div class="a3s aXjCH msg233836446190015510" id=":q2"><div style="width:100%!important;font-family:Helvetica,sans-serif;margin:0;padding:0;">' +
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
            '<h2 class="m_233836446190015510header-title-text m_233836446190015510white-text-color" style="display:inline-block;font-weight:300;color:white;margin:17px 10px 13px 15px;">' + name + '</h2><span class="m_233836446190015510dh-white-wordmark" style="padding-right:20px;vertical-align:bottom;float:right;margin:21px 10px 0 0;">&nbsp;<span class="m_233836446190015510via-text m_233836446190015510white-text" style="color:white;">via</span> <a href="' + config.frontendUrl + '"  style="color:white;text-decoration:none;" target="_blank"><strong>DocIntact</strong></a></span></td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</td>' +
            '</tr>' +
            '<tr>' +
            '<td class="m_233836446190015510body-content" style="border-collapse:collapse;padding:20px 30px 50px;"><span class="im"> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + msg1 + '</h3> <h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + ' Click the below button to view the Folder</h3></span>' +
            '<table class="m_233836446190015510two-column-preview" style="border-collapse:collapse;width:100%;">' +
            '<tbody>' +
            '<tr>' +
            '<td class="m_233836446190015510no-border m_233836446190015510thumb-content-column" style="border-collapse:collapse;width:180px!important;max-width:180px!important;margin:10px;border:none;" valign="top">' +
            '<a  href="' + config.frontendUrl + "/user/allowusers/" + sharingdocumentid + '" style="text-decoration:none;" target="_blank"><img class="m_233836446190015510document-thumbnail-image CToWUd fr-fic fr-dib" src="https://staging.docintact.com/assets/images/document.png" alt="test.pdf" style="outline: none; text-decoration: none; border: none; width: 150px !important; max-width: 150px !important;"></a></td>' +
      
            '<td class="m_233836446190015510no-border m_233836446190015510body-content-column" style="border-collapse:collapse;width:inherit!important;margin:10px;border:none;" valign="top">' +
            '<h3><strong></strong></h3><span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary"  href="' + config.frontendUrl + "/user/allowusers/" + sharingdocumentid + '" style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;color:#fff;background-color:#0275d8;border:1px solid #0275d8;font-size: 16px;border-radius: 5px; padding: 8px 10px;" target="_blank">View Document</a><div class="m_233836446190015510sent-by-text" style="font-size:14px;margin-top:16px;"><div>Shared by ' + userdata.name + '</div><div class="m_233836446190015510text-muted"><div>Folder : ' + folder.name + '</div></div></div></span></td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<div class="yj6qo ajU ">' +
            '<div aria-expanded="false" aria-label="Show trimmed content" class="ajR" data-tooltip="Show trimmed content" id=":qi" tabindex="0"><img class="ajT fr-fic fr-dib" src="//ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif" style="display:none"></div></div>' +
            '<div class="adL">' +
            '<div class="adm">' +
            '<div class="ajR h4" id="q_8">' +
            '<div class="ajT">' +
            '<br>' +
            '</div></div></div>' +
            '<div class="h5">' +
            '<table class="m_233836446190015510footer" style="border-collapse:collapse;max-width:900px;width:100%;font-size:13px;margin:20px auto;">' +
            '<tbody>' +
            '<tr>' +
            '<td align="center" style="border-collapse:collapse;font-family:Arial;color:#777;">' +
            '<div>Sent by ' + userdata.name + ' (<a href="mailto:' + userdata.email + '" target="_blank">' + userdata.email + '</a>, IP: ' + req.body.IpAddress + ').</div>' +
            '<div>Powered by <a href="' + config.frontendUrl + '" style="text-decoration:none;" target="_blank">DocIntact.com</a> - View and sign PDFs in your web browser</div>' +
            '<div>&copy; 2019-2020 CognitiveInnovations.com</div>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '</div></div></div>' +
            '<div class="adL">' +
            '<br>' +
            '</div></div>' +
            '<div class="adL">' +
            '<br>' +
            '</div></div>'
          HelperOptions.html = msg;
          // Email Body End
          transporter.sendMail(HelperOptions, function (err, info) {
            if (err) { console.log("error occured when sending mail" + err) }
          });
        })
       }
    }
  })
}

//create individual file for department multi share
function multisharecreation1(element, document, req, sharingData, callback) {
  var sharedData = []
  sharingData.fileid = sharingData.folderid = undefined;
  if (document.isFile) { req.body.fileid = document, sharingData.fileid = document._id; }
  if (document.isFolder){ req.body.folderid = document, sharingData.folderid = document._id
    sharingData.heatmaps = false
    sharingData.Download = false
    sharingData.Copy = false
    sharingData.comment = false
    sharingData.VersionAccess = false
    sharingData.Chat = false
    sharingData.VideoRecord = false 
  };
  sharingData.toemail = element.email
  sharingData.toid = element._id;
  Sharingpeople.findOne({ $and: [{ fromid: req.user.id, toemail: element.email, active: true }, { $or: [{ fileid: document._id }, { folderid: document._id }] }] }).exec(function (err, sharingsamepeople) {
    if (sharingsamepeople) { //if already exits update
      var updated = _.merge(sharingsamepeople, sharingData);
      if (req.body.access == 'Allowusers' || (req.body.access == 'public')) updated.filepassword = undefined
      updated.updated_at = Date.now();
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        sendEmail(updated, element, req.body, req.user, req)
        sharedData.push(updated)
        callback(sharedData)
      });
    }
    else {
      sharingData.created_at = new Date();
      Sharingpeople.create(sharingData, function (err, sharingpeople) {//create new one
        if (err) {
          return handleError(res, err);
        }
        else {
          sharedData.push(sharingpeople)
          sendEmail(sharingpeople, element, req.body, req.user, req)
          callback(sharedData)
        }
      });
    }

  })
}
//create individual file for multi share
function multisharecreation(userArray, document, req, sharingData, callback) {
  var sharedData = []
  sharingData.fileid = sharingData.folderid = undefined;
  if (document.isFile) { req.body.fileid = document, sharingData.fileid = document._id; }
  if (document.isFolder) {req.body.folderid = document, sharingData.folderid = document._id;
    sharingData.heatmaps = false
    sharingData.Download = false
    sharingData.Copy = false
    sharingData.comment = false
    sharingData.VersionAccess = false
    sharingData.Chat = false
    sharingData.VideoRecord = false 
  }
  async.eachOfSeries(userArray, function (element, x_index, innerCallback1) {
    sharingData.toemail = element.email
    sharingData.toid = element._id;
    Sharingpeople.findOne({ $and: [{ fromid: req.user.id, toemail: element.email, active: true }, { $or: [{ fileid: document._id }, { folderid: document._id }] }] }).exec(function (err, sharingsamepeople) {
      if (sharingsamepeople) { //if already exits update
        var updated = _.merge(sharingsamepeople, sharingData);
        if (req.body.access == 'Allowusers' || (req.body.access == 'public')) updated.filepassword = undefined
        updated.updated_at = Date.now();
        updated.save(function (err) {
          if (err) { return handleError(res, err); }
          sendEmail(updated, element, req.body, req.user, req)
          sharedData.push(updated)
          innerCallback1()
        });
      }
      else {
        sharingData.created_at = new Date();
        Sharingpeople.create(sharingData, function (err, sharingpeople) {//create new one
          if (err) {
            return handleError(res, err);
          }
          else {
            sharedData.push(sharingpeople)
            sendEmail(sharingpeople, element, req.body, req.user, req)
            innerCallback1()
          }
        });
      }
    })
  }, function (err) {
    callback(sharedData)
  })
}

//update individual file for multi share
function multishare_document_update(document, callback) {
  if (document.isFile) {
    Document.findById(document._id, function (err, document) {
      var updated = JSON.parse(JSON.stringify(document));
      updated.isSent = true;
      updated.status = 'Review';
      updated = _.merge(document, updated);
      updated.save(function (err) {
        callback(true)
      })
    })
  }
  if (document.isFolder) {
    Folder.findById(document._id, function (err, folder) {
      var updated = JSON.parse(JSON.stringify(folder));
      updated.isSent = true;
      updated = _.merge(folder, updated);
      updated.save(function (err) {
        callback(true)
      })
    })
  }
}

//to get random number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
//to update the email link status
function updatelink(sharedid) {
  Links.find({ $and: [{ shareddocumentid: sharedid }, { active: true }] }).exec(function (err, link) {
    link.forEach(element => {
      element.active = false
      element.save(function (err) {
      });
    })
  })
}
/**
 * @api {get} /sharingpeoples/checkpassword/:id/:password/:title Request Password information
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName checkpassword
 * @apiGroup sharingpeople
 *
 * @apiParam {Sring/Number} /:id/:password/:title Will send through the url parameter.
 * @apiSuccess {Json}  Result of particular SharedRecord Password.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.getsharedDocumet = function (req, res) {
  Sharingpeople.findOne({ $and: [{ $and: [{ fileid: req.params.fileid}, {toemail: req.params.email }]},{active:true}]}).exec(function (err, sharingpeoples) {
    if (err) { return handleError(res, err); }
    
    else return res.status(200).send(sharingpeoples);
  })
}
// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
return res.status(500).send(err);
}
