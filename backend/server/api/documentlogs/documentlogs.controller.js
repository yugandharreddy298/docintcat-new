'use strict';

var _ = require('lodash');
var Documentlogs = require('./documentlogs.model');
const AWS = require('aws-sdk');
var fs = require('fs');
const path = require('path');
var async = require('async');

/**
 * @api {get} /  Get list of documentlogs
 * @apiName index
 * @apiGroup documentlogs
 * @apiSuccess {Array}  Get list of documentlogs
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function (req, res) {
  Documentlogs.find(function (err, documentlogss) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(documentlogss);
  });
};

/**
 * @api {post} /  Get a single document log based on message
 * @apiName getDocumentSingleLog
 * @apiGroup documentlogs
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Array}  Get a single document log based on message
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getDocumentSingleLog = function (req, res) {
  Documentlogs.find({ $and: [{ documentid: req.body.documentid }, { sharedid: req.body.sharedid }, { toemail: req.body.toemail }, { message: req.body.message }] }).populate('toid').populate('uid').populate('documentid').sort({ "_id": -1 }).exec(function (err, documentlogs) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(documentlogs);
  });
};

/**
 * @api {get} /  Get a single documentlogs or folder document logs
 * @apiName getDocumentSingleLog
 * @apiGroup documentlogs
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {Array}  Get a single documentlogs or folder document logs
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function (req, res) {
  Documentlogs.find({ $or: [{ documentid: req.params.id }, { folderid: req.params.id }] }).populate('toid').populate('uid').populate('documentid').sort({ "_id": -1 }).exec(function (err, documentlogs) {
    if (err) { return handleError(res, err); }
    if (!documentlogs) { return res.status(404).send('Not Found'); }
    return res.json(documentlogs);
  });
};

/**
 * @api {get} /getSingleLog  Get selected log
 * @apiName getSingleLog
 * @apiGroup documentlogs
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Get selected log
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getSingleLog = function (req, res) {
  Documentlogs.findOne(req.params.id).populate('toid').populate('uid').populate('documentid').sort({ "_id": -1 }).exec(function (err, documentlogs) {
    if (err) { return handleError(res, err); }
    if (!documentlogs) { return res.status(404).send('Not Found'); }
    return res.json(documentlogs);
  });
};

/**
 * @api {post} /  Creates a new documentlogs in the DB.
 * @apiName create
 * @apiGroup documentlogs
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Creates a new documentlogs in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function (req, res) {
  if (req.headers && req.headers.ipaddress) {
    req.body.IpAddress = req.headers.ipaddress
  }
  else {
    req.body.IpAddress = req.body.IpAddress
  }
  const DeviceDetector = require("device-detector-js");
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(req.headers["user-agent"]);
  if (device)
    req.body.browser = device.client.name + ', Version' + device.client.version;
  if (device.os.platform)
    req.body.deviceName = device.os.name + ',Platform -' + device.os.platform;
  else
    req.body.deviceName = device.os.name
  Documentlogs.create(req.body, function (err, documentlogs) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(documentlogs);
  });
};

/**
 * @api {post} /fieldlogs   creates a new fieldlogs
 * @apiName fieldlogs
 * @apiGroup documentlogs
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}   creates a new fieldlogs
 * @apiError 500-InternalServerError SERVER error.
 */
exports.fieldlogs = function (req, res) {
  if (req.headers && req.headers.ipaddress) {
    req.body.IpAddress = req.headers.ipaddress
  }
  else {
    req.body.IpAddress = req.body.IpAddress
  }
  const DeviceDetector = require("device-detector-js");
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(req.headers["user-agent"]);
  if (device && device.client.name && device.client.version) {
    req.body.browser = device.client.name + ', Version' + device.client.version;
  }
  if (device && device.client.name && !device.client.version) {
    req.body.browser = device.client.name;
  }
  if (device.os.platform)
    req.body.deviceName = device.os.name + ',Platform -' + device.os.platform;
  else
    req.body.deviceName = device.os.name
  if (req.body.created_at) delete req.body.created_at;
  Documentlogs.create(req.body, function (err, documentlogs) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(documentlogs);
  });
}

/**
 * @api {post} /createBulkFieldLogs  creates a new fieldlogs on Bulk amount
 * @apiName createBulkFieldLogs
 * @apiGroup documentlogs
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  creates a new fieldlogs on Bulk amount
 * @apiError 500-InternalServerError SERVER error.
 */
exports.createBulkFieldLogs = function (req, res) {
  if (req.headers && req.headers.ipaddress) {
    req.body.IpAddress = req.headers.ipaddress
  }
  else {
    req.body.IpAddress = req.body.IpAddress
  }
  const DeviceDetector = require("device-detector-js");
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(req.headers["user-agent"]);
  async.each(req.body, function (log, call) {
    if (device)
      log.browser = device.client.name + ', Version' + device.client.version;
    if (device.os.platform)
      log.deviceName = device.os.name + ',Platform -' + device.os.platform;
    else
      log.deviceName = device.os.name
    Documentlogs.create(log, function (err, documentlog) {
      if (err) {
        return handleError(res, err);
      }
      call();
    });
  });
  return res.status(201).json();
}

/**
 * @api {post} /uploadvideo  Creates a new documentlogs of upload video in the DB.
 * @apiName uploadvideocreate
 * @apiGroup documentlogs
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new documentlogs of upload video in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.uploadvideocreate = async function (req, res) {
  var file = {};
  file.originalFilename = req.files.video[0].originalFilename;
  file.path = req.files.video[0].path;
  file.path = file.path.replace("../", "");
  file.path = file.path.replace("backend/", "");
  file.size = req.files.video[0].size;
  file.type = req.files.video[0].type;
  file.name = req.files.video[0].name;
  file.uid = req.body.uid;
  file.email = req.body.email;
  file.message = 'Video Record';
  if (req.body.documentid) file.documentid = req.body.documentid;
  if (req.body.sharedid) file.sharedid = req.body.sharedid;
  var p = await uploadS3(__dirname + '/../../../' + file.path, 'uploads', true, function (p) {
    file.path = p;
    Documentlogs.create(file, function (err, documentlogs) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(201).json(documentlogs);
    });
  })
};

// Uploading files to S3 bucket
async function uploadS3(filePath, folderName, deleteFile, callback) {
  var s3 = new AWS.S3({useAccelerateEndpoint: true});
  //configuring parameters
  var params = {
    Bucket: 'docintact',
    Body: fs.createReadStream(filePath),
    Key: folderName + "/" + Date.now() + "_" + path.basename(filePath)
  };
  s3.upload(params, function (err, data) {
    //handle error
    if (err) {
    }
    //success
    if (data) {
      if (deleteFile) if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      if (callback) callback(data.Location);
      else return data.Location;
    }
  });
}

/**
 * @api {put} /  Updates an existing documentlogs in the DB.
 * @apiName update
 * @apiGroup documentlogs
 * @apiParam {json} data Will send through the body
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing documentlogs in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Documentlogs.findById(req.params.id, function (err, documentlogs) {
    if (err) { return handleError(res, err); }
    if (!documentlogs) { return res.status(404).send('Not Found'); }
    documentlogs.pageInfo = null
    var updated = _.merge(documentlogs, req.body);
    updated.updated_at = Date.now();
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(documentlogs);
    });
  });
};

/**
 * @api {delete} /  Deletes a documentlogs from the DB.
 * @apiName destroy
 * @apiGroup documentlogs
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Deletes a documentlogs from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function (req, res) {
  Documentlogs.findById(req.params.id, function (err, documentlogs) {
    if (err) { return handleError(res, err); }
    if (!documentlogs) { return res.status(404).send('Not Found'); }
    documentlogs.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

/**
 * @api {post} /filesFilter  filter in dashboard
 * @apiName filesFilter
 * @apiGroup documentlogs
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Array} filter in dashboard
 * @apiError 500-InternalServerError SERVER error.
 */
exports.filesFilter = function (req, res) {
  Documentlogs.find(req.body.where).sort({ created_at: 'desc' }).populate('documentid').exec(function (err, documents) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(documents);
  });
};

/**
 * @api {post} /getdevice get device data
 * @apiName getdevice
 * @apiGroup documentlogs
 * @apiSuccess {string} get device data
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getdevice = function (req, res) {
  const DeviceDetector = require("device-detector-js");
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(req.headers["user-agent"]);
  if (device) {
    if (device.os) {
      var devicedata = device.os.name
    }
    else var devicedata = 'not found'
  }
  else {
    var devicedata = 'not found'
  }
  return res.send({ devicedata })
};

/**
 * @api {post} /logs/ Get logs
 * @apiName my
 * @apiGroup documentlogs
 * @apiSuccess {Array} Get logs data
 * @apiError 500-InternalServerError SERVER error.
 */
exports.my = function (req, res) {
  if (req.body.startdate && req.body.enddate && req.body.todaydate == null && req.body.yesterdaydate == null) {
    Documentlogs.find({ $and: [{ email: req.body.email }, { 'createdAt': { $gte: req.body.startdate, $lte: req.body.enddate } }] }).populate('documentid').sort('-updatedAt').exec(function (err, dpinfo) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(dpinfo);
    });
  }
  else if (req.body.todaydate && req.body.yesterdaydate) {
    Documentlogs.find({ $and: [{ email: req.body.email }, { 'createdAt': { $gte: req.body.yesterdaydate, $lte: req.body.todaydate } }] }).populate('documentid').sort('-updatedAt').exec(function (err, sinfo) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(sinfo);
    });
  }
  else if (req.body.todaydate && !req.body.yesterdaydate) {
    Documentlogs.find({ $and: [{ email: req.body.email }, { 'createdAt': { $gte: req.body.todaydate } }] }).populate('documentid').sort('-updatedAt').exec(function (err, sinfo) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(sinfo);
    });
  }
  else {
    return res.status(200).json([]);
  }
}
exports.getVideoLog = function(req,res){
  Documentlogs.findOne({_id:req.params.id}).exec(function(err,log){
    if(err) return handleError(ress,err)
    if(log) return res.status(200).json(log)
  })
}

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
  return res.status(500).send(err);
}