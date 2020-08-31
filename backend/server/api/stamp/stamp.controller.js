'use strict';

var _ = require('lodash');
var Stamp = require('./stamp.model');
const selfCert = require('self-cert')
var key = "secretkey";
var crypto = require("crypto")
const AWS = require('aws-sdk');
var fs = require('fs');
var moment = require("moment")
const path = require('path');

/**
 * Encrpyt Data from UTF-8 to hex format  
 * used For Id Encryption
 */
function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

/**
 * @api {get} /getstamp Get selected stamp
 * @apiName getstamp
 * @apiGroup stamp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get selected stamp
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getstamp = function(req, res) {
    Stamp.findById(req.params.id).populate('uid').exec(function(err, stamp) {
        if (err) { return handleError(res, err); }
        if (!stamp) { return res.status(404).send('Not Found'); }
        return res.status(200).json(stamp);
    });
};

/**
 * @api {get} / Get list of current user stamps
 * @apiName index
 * @apiGroup stamp
 * @apiParam {string/Number} email Will send through the url parameter
 * @apiSuccess {array} Get list of current user stamps
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Stamp.find({ $and: [{ email: req.params.email }, { setDelete: false }, { active: true }] }).sort({ created_at: 'desc' }).exec(function(err, stamps) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(stamps);
    });
};

/**
 * @api {get} /getDefault get default stamp
 * @apiName getDefault
 * @apiGroup stamp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} get default stamp
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getDefault = function(req, res) {
    Stamp.findOne({ $and: [{ email: req.params.id }, { setDefault: true }, { setDelete: false }] }).exec(function(err, stamp) {
        if (err) { return handleError(res, err); }
        if (!stamp) { return res.status(404).send('Not Found'); }
        return res.status(200).json(stamp);
    });
};

/**
 * @api {put} /setDefaultSetting Updates an existing stamp for the setDefault/setDelete stamp.
 * @apiName setDefaultSetting
 * @apiGroup stamp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing stamp for the setDefault/setDelete stamp.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.setDefaultSetting = function(req, res) {
    Stamp.findById(req.params.id, function(err, stamp) {
        if (err) { return handleError(res, err); }
        if (!stamp) { return res.status(404).send('Not Found'); }
        if (req.body.setDefault && !req.body.setDelete) {
            Stamp.update({ $and: [{ email: req.body.email }, { setDelete: false }, { active: true }] }, { $set: { setDefault: false } }, { multi: true }, function(err, stamps) {
                if (err) { return handleError(res, err); }
                var updated = _.merge(stamp, req.body);
                updated.updated_at = Date.now();
                updated.save(function(err) {
                    if (err) { return handleError(res, err); }
                    return res.status(200).json(stamp);
                });
            });
        } else {
            console.log(req.body.setDefault)
            var updated = _.merge(stamp, req.body);
            updated.updated_at = Date.now();
            updated.save(function(err) {
                if (err) { return handleError(res, err); }
                return res.status(200).json(stamp);
            });
        }

    });
};

/**
 * @api {get} / Get selected stamp
 * @apiName show
 * @apiGroup stamp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get selected stamp
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Stamp.findById(req.params.id, function(err, stamp) {
        if (err) { return handleError(res, err); }
        if (!stamp) { return res.status(404).send('Not Found'); }
        return res.json(stamp);
    });
};

/**
 * @api {post} / Creates a new stamp in the DB.
 * @apiName create
 * @apiGroup stamp
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new stamp in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.create = async function(req, res) {
    var file = {};
    file.originalFilename = req.files.uploads.originalFilename;
    file.path = req.files.uploads.path;
    file.path = file.path.replace("../", "");
    file.path = file.path.replace("backend/", "");
    file.size = req.files.uploads.size;
    file.type = req.files.uploads.type;
    file.name = req.files.uploads.name;
    if (req.body.folderid) file.folderid = req.body.folderid;
    var encryptedid = encrypt(key, file.name);
    file.encryptedid = encryptedid;
    if (req.body.uid) file.uid = req.body.uid;
    file.email = req.body.email;
    file.type = req.body.type;
    file.expirydate = new Date(moment().add(365, 'days').format())
    var p = await uploadS3(__dirname + '/../../../' + file.path, 'stamp', true, function(p) {
        file.path = p;
        Stamp.create(file, function(err, stamp) {
            if (err) { return handleError(res, err); } else {
                const certDetails = selfCert({
                    attrs: {
                        commonName: 'CognitiveInnovations.in',
                        countryName: 'IN',
                        stateName: 'AP',
                        locality: 'VSP',
                        orgName: 'Cognitive Innovations',
                        shortName: stamp._id
                    },
                    bits: 2048,
                    expires: file.expirydate
                })
                Stamp.findById(stamp._id, function(err, updateStamp) {
                    if (err) { return handleError(res, err); }
                    if (!stamp) { return res.status(404).send('Not Found'); }
                    var data = {};
                    data.privateKey = certDetails.privateKey;
                    data.publicKey = certDetails.publicKey;
                    data.certificate = certDetails.certificate;
                    var updated = _.merge(stamp, data);
                    updated.save(function(err) {
                        if (err) { return handleError(res, err); } else {
                            fs.mkdirSync('./stamp/' + stamp._id);
                            fs.writeFile('./stamp/' + stamp._id + '/stamp.pem', stamp.certificate, async function(err) {
                                if (err) throw err;
                                else {
                                    var p = await uploadS3(__dirname + '/../../../' + 'stamp/' + stamp._id + '/stamp.pem', 'stamp', true, function(pempath) {
                                        stamp.pemFilePath = pempath
                                        stamp.save(function(err, updatedstamp) {
                                            if (err) return res.status(500).send(err);
                                            return res.status(200).json(updatedstamp);
                                        });
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    });
};


//Uploading files to S3 bucket
async function uploadS3(filePath, folderName, deleteFile, callback) {

    var s3 = new AWS.S3({useAccelerateEndpoint: true});  
    //configuring parameters
    var params = {
        Bucket: 'docintact',
        Body: fs.createReadStream(filePath),
        Key: folderName + "/" + Date.now() + "_" + path.basename(filePath)
    };
    s3.upload(params, function(err, data) {
        //handle error
        if (err) {
            console.log("Error", err);
        }
        //success
        if (data) {
            if (deleteFile)
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
            if (callback) callback(data.Location);
            else return data.Location;
        }
    });
}

/**
 * @api {post} /createfrommobilelink Creates a new stamp from mobilelink in the DB.
 * @apiName createfrommobilelink
 * @apiGroup stamp
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new stamp from mobilelink in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.createfrommobilelink = async function(req, res) {
    var file = {};
    file.originalFilename = req.files.uploads.name;
    file.path = req.files.uploads.path;
    file.path = file.path.replace("../", "");
    file.path = file.path.replace("backend/", "");
    file.size = req.files.uploads.size;
    file.type = req.files.uploads.type;
    file.name = req.files.uploads.name;
    if (req.body.folderid) file.folderid = req.body.folderid;
    var encryptedid = encrypt(key, file.name);
    file.encryptedid = encryptedid,
        file.type = req.body.type
    file.expirydate = new Date(moment().add(365, 'days').format())
    var p = await uploadS3(__dirname + '/../../../' + file.path, 'stamp', true, function(p) {
        file.path = p;
        Stamp.create(file, function(err, stamp) {
            if (err) { return handleError(res, err); } else {
                const certDetails = selfCert({
                    attrs: {
                        commonName: 'CognitiveInnovations.in',
                        countryName: 'IN',
                        stateName: 'AP',
                        locality: 'VSP',
                        orgName: 'Cognitive Innovations',
                        shortName: stamp._id
                    },
                    bits: 2048,
                    expires: file.expirydate
                })
                Stamp.findById(stamp._id, function(err, updateStamp) {
                    if (err) { return handleError(res, err); }
                    if (!stamp) { return res.status(404).send('Not Found'); }
                    var data = {};
                    data.privateKey = certDetails.privateKey;
                    data.publicKey = certDetails.publicKey;
                    data.certificate = certDetails.certificate;
                    var updated = _.merge(stamp, data);
                    updated.save(function(err) {
                        if (err) { return handleError(res, err); } else {
                            fs.mkdirSync('./stamp/' + stamp._id);
                            fs.writeFile('./stamp/' + stamp._id + '/stamp.pem', stamp.certificate, function(err) {
                                if (err) throw err;
                                else
                                    return res.status(200).json(stamp);
                            });
                        }
                    });
                });
            }
        });
    });
};

/**
 * @api {put} / Updates an existing stamp in the DB.
 * @apiName update
 * @apiGroup stamp
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Updates an existing stamp in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Stamp.findById(req.params.id, function(err, stamp) {
        if (err) { return handleError(res, err); }
        if (!stamp) { return res.status(404).send('Not Found'); }
        var updated = _.merge(stamp, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(stamp);
        });
    });
};

/**
 * @api {delete} / Deletes a stamp from the DB.
 * @apiName destroy
 * @apiGroup stamp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {String} Deletes a stamp from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Stamp.findById(req.params.id, function(err, stamp) {
        if (err) { return handleError(res, err); }
        if (!stamp) { return res.status(404).send('Not Found'); }
        stamp.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}