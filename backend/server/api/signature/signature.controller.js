'use strict';

var _ = require('lodash');
var Signature = require('./signature.model');
var async = require('async');
const selfCert = require('self-cert')
const AWS = require('aws-sdk');
var fs = require('fs');
const path = require('path');
var key = "secretkey";
var crypto = require("crypto")
var moment = require("moment")

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
 * @api {get} / Get list of current user signatures
 * @apiName index
 * @apiGroup signature
 * @apiParam {string/Number} email Will send through the url parameter
 * @apiSuccess {array} Get list of current user signatures
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Signature.find({ $and: [{ email: req.params.email }, { setDelete: false }, { active: true }, { signtype: 'signature' }] }).sort({ created_at: 'desc' }).exec(function(err, signatures) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(signatures);
    });
};

/**
 * @api {get} /initialList Get list of Initial user signatures
 * @apiName initialList
 * @apiGroup signature
 * @apiParam {string/Number} email Will send through the url parameter
 * @apiSuccess {array} Get list of Initial user signatures
 * @apiError 500-InternalServerError SERVER error.
 */
exports.initialList = function(req, res) {
    Signature.find({ $and: [{ email: req.params.email }, { setDelete: false }, { active: true }, { signtype: 'initial' }] }).sort({ created_at: 'desc' }).exec(function(err, signatures) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(signatures);
    });
};

/**
 * @api {put} /setDefaultSetting Updates an existing signature for the setDefault/setDelete signature.
 * @apiName setDefaultSetting
 * @apiGroup signature
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing signature for the setDefault/setDelete signature.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.setDefaultSetting = function(req, res) {
    Signature.findById(req.params.id, function(err, signature) {
        if (err) { return handleError(res, err); }
        if (!signature) { return res.status(404).send('Not Found'); }
        if (req.body.setDefault && !req.body.setDelete) {
            Signature.update({ $and: [{ email: req.body.email }, { setDelete: false }, { active: true }, { signtype: req.body.signtype }] }, { $set: { setDefault: false } }, { multi: true }, function(err, signatures) {
                if (err) { return handleError(res, err); }
                var updated = _.merge(signature, req.body);
                updated.updated_at = Date.now();
                updated.save(function(err) {
                    if (err) { return handleError(res, err); }
                    return res.status(200).json(signature);
                });
            });
        } else {
            var updated = _.merge(signature, req.body);
            updated.updated_at = Date.now();
            updated.save(function(err) {
                if (err) { return handleError(res, err); }
                return res.status(200).json(signature);
            });
        }

    });
};

/**
 * @api {get} /getsignature Get selected signature
 * @apiName getsignature
 * @apiGroup signature
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get selected signature
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getsignature = function(req, res) {
    Signature.findById(req.params.id).populate('uid').exec(function(err, signature) {
        if (err) { return handleError(res, err); }
        if (!signature) { return res.status(404).send('Not Found'); }
        return res.json(signature);
    });
};

/**
 * @api {get} /  Get selected signature by converting that into base64 format
 * @apiName show
 * @apiGroup signature
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get selected signature by converting that into base64 format
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Signature.findById(req.params.id, function(err, signature) {
        if (err) { return handleError(res, err); }
        if (!signature) { return res.status(404).send('Not Found'); }
        let buff = signature.signaturebaseData.data;
        let base64data = buff.toString('base64');
        res.json({ pic: base64data });
    });
};

/**
 * @api {post} /getDefault get default signature
 * @apiName getDefault
 * @apiGroup signature
 * @apiParam {string/Number} email Will send through the url parameter
 * @apiSuccess {json} get default signature
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getDefault = function(req, res) {
    Signature.findOne({ $and: [{ email: req.params.email }, { setDefault: true }, { signtype: req.body.signtype }, { setDelete: false }] }).exec(function(err, signature) {
        if (err) { return handleError(res, err); }
        if (!signature) { return res.status(404).send('Not Found'); }
        return res.status(200).json(signature);
    });
};

/**
 * @api {post} /  Creates a new signature in the DB.
 * @apiName create
 * @apiGroup signature
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new signature in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.create = async function(req, res) {
    var fs = require('fs');
    var file = {};
    if (req.body.type == "signaturepad") {
        file.signaturebaseData = req.body.signdata.base64
        file.type = req.body.type
        file.uid = req.body.uid
        file.signtype = req.body.signtype
        file.size = req.body.size
        file.email = req.body.email
    } else if (req.body.type == "fileupload") {
        file.originalFilename = req.files.uploads.originalFilename;
        file.path = req.files.uploads.path;
        file.path = file.path.replace("../", "");
        file.path = file.path.replace("backend/", "");
        file.size = req.files.uploadssize;
        file.type = req.files.uploads.type;
        file.name = req.files.uploads.name;
        if (req.body.folderid) file.folderid = req.body.folderid;
        var encryptedid = encrypt(key, file.name);
        file.encryptedid = encryptedid,
            file.uid = req.body.uid;
        file.type = req.body.type
        file.signtype = req.body.signtype
        file.email = req.body.email
    } else if (req.body.type == "font") {
        file.fontText = req.body.fonttype;
        file.fontStyle = req.body.fontstyle;
        file.type = req.body.type
        file.uid = req.body.uid
        file.signtype = req.body.signtype
        file.email = req.body.email
    }

    file.expirydate = new Date(moment().add(365, 'days').format())

    if (req.body.type == "fileupload") {
        var p = await uploadS3(__dirname + '/../../../' + file.path, 'signature', true, function(p) {
            file.path = p;
            Signature.create(file, function(err, signature) {
                if (err) {
                    return handleError(res, err);
                } else {
                    const certDetails = selfCert({
                        attrs: {
                            commonName: 'CognitiveInnovations.in',
                            countryName: 'IN',
                            stateName: 'AP',
                            locality: 'VSP',
                            orgName: 'Cognitive Innovations',
                            shortName: signature._id
                        },
                        bits: 2048,
                        expires: file.expirydate
                    })
                    Signature.findById(signature._id, function(err, updateSignature) {
                        if (err) { return handleError(res, err); }
                        if (!signature) { return res.status(404).send('Not Found'); }
                        var data = {};
                        data.privateKey = certDetails.privateKey;
                        data.publicKey = certDetails.publicKey;
                        data.certificate = certDetails.certificate;
                        var updated = _.merge(signature, data);
                        updated.save(function(err) {
                            if (err) { return handleError(res, err); } else {
                                fs.mkdirSync('./signature/' + signature._id);
                                fs.writeFile('./signature/' + signature._id + '/signature.pem', signature.certificate, async function(err) {
                                    if (err) throw err;
                                    else {
                                        var p = await uploadS3(__dirname + '/../../../' + 'signature/' + signature._id + '/signature.pem', 'signature', true, function(pempath) {
                                            signature.pemFilePath = pempath
                                            signature.save(function(err, updatedsignature) {
                                                if (err) return res.status(500).send(err);
                                                return res.status(200).json(updatedsignature);
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
    } else {
        Signature.create(file, function(err, signature) {
            if (err) {
                return handleError(res, err);
            } else {
                const certDetails = selfCert({
                    attrs: {
                        commonName: 'CognitiveInnovations.in',
                        countryName: 'IN',
                        stateName: 'AP',
                        locality: 'VSP',
                        orgName: 'Cognitive Innovations',
                        shortName: signature._id
                    },
                    bits: 2048,
                    expires: file.expirydate
                })
                Signature.findById(signature._id, function(err, updateSignature) {
                    if (err) { return handleError(res, err); }
                    if (!signature) { return res.status(404).send('Not Found'); }
                    var data = {};
                    data.privateKey = certDetails.privateKey;
                    data.publicKey = certDetails.publicKey;
                    data.certificate = certDetails.certificate;
                    var updated = _.merge(signature, data);
                    updated.save(function(err) {
                        if (err) { return handleError(res, err); } else {
                            fs.mkdirSync('./signature/' + signature._id);
                            fs.writeFile('./signature/' + signature._id + '/signature.pem', signature.certificate, async function(err) {
                                if (err) throw err;
                                else {
                                    var p = await uploadS3(__dirname + '/../../../' + 'signature/' + signature._id + '/signature.pem', 'signature', true, function(pempath) {
                                        signature.pemFilePath = pempath
                                        signature.save(function(err, updatedsignature) {
                                            if (err) return res.status(500).send(err);
                                            return res.status(200).json(updatedsignature);
                                        });
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    }
};

//Uploading file to S3 bucket
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
 * @api {post} /createfrommobilelink Creates a new signature from mobilelink in the DB.
 * @apiName createfrommobilelink
 * @apiGroup signature
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Json} Creates a new signature from mobilelink in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.createfrommobilelink = function(req, res) {
    var fs = require('fs');
    var file = {};
    if (req.body.type == "signaturepad") {
        file.signaturebaseData = req.body.signdata
        file.type = req.body.type
    }
    file.expirydate = new Date(moment().add(365, 'days').format())
    Signature.create(file, function(err, signature) {
        if (err) { return handleError(res, err); } else {
            const certDetails = selfCert({
                attrs: {
                    commonName: 'CognitiveInnovations.in',
                    countryName: 'IN',
                    stateName: 'AP',
                    locality: 'VSP',
                    orgName: 'Cognitive Innovations',
                    shortName: signature._id
                },
                bits: 2048,
                expires: file.expirydate
            })
            Signature.findById(signature._id, function(err, updateSignature) {
                if (err) { return handleError(res, err); }
                if (!signature) { return res.status(404).send('Not Found'); }
                var data = {};
                data.privateKey = certDetails.privateKey;
                data.publicKey = certDetails.publicKey;
                data.certificate = certDetails.certificate;
                var updated = _.merge(signature, data);
                updated.save(function(err) {
                    if (err) { return handleError(res, err); } else {
                        fs.mkdirSync('./signature/' + signature._id);
                        fs.writeFile('./signature/' + signature._id + '/signature.pem', signature.certificate, function(err) {
                            if (err) throw err;
                            else
                                return res.status(200).json(signature);
                        });
                    }
                });
            });
        }
    });
};

/**
 * @api {put} / Updates an existing signature in the DB.
 * @apiName update
 * @apiGroup signature
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Updates an existing signature in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Signature.findById(req.params.id, function(err, signature) {
        if (err) { return handleError(res, err); }
        if (!signature) { return res.status(404).send('Not Found'); }
        var updated = _.merge(signature, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(signature);
        });
    });
};

/**
 * @api {post} / Deletes a signature from the DB.
 * @apiName destroy
 * @apiGroup signature
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Deletes a signature from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Signature.findById(req.params.id, function(err, signature) {
        if (err) { return handleError(res, err); }
        if (!signature) { return res.status(404).send('Not Found'); }
        signature.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}