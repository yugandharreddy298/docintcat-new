'use strict';

var _ = require('lodash');
var Photo = require('./photo.model');
var config = require('../../config/environment');
var request = require("request");
var key = "secretkey";
const selfCert = require('self-cert')
const AWS = require('aws-sdk');
var fs = require('fs');
var moment = require("moment")
const path = require('path');
var crypto = require("crypto")

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
 * @api {get} /getphoto Get selected photo
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getphoto
 * @apiGroup photo
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get selected photo
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getphoto = function(req, res) {
    Photo.findById(req.params.id).populate('uid').exec(function(err, photo) {
        if (err) { return handleError(res, err); }
        if (!photo) { return res.status(404).send('Not Found'); }
        return res.status(200).json(photo);
    });
};

/**
 * @api {get} / Get list of current user photos
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup photo
 * @apiParam {string/Number} email Will send through the url parameter
 * @apiSuccess {array} Get list of current user photos
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Photo.find({ $and: [{ email: req.params.email }, { setDelete: false }, { active: true }] }).sort({ created_at: 'desc' }).exec(function(err, photos) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(photos);
    });
};

/**
 * @api {get} /getDefault  get default photo
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getDefault
 * @apiGroup photo
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} get default photo
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getDefault = function(req, res) {
    Photo.findOne({ $and: [{ email: req.params.id }, { setDefault: true }, { setDelete: false }] }).exec(function(err, photo) {
        if (err) { return handleError(res, err); }
        if (!photo) { return res.status(404).send('Not Found'); }
        return res.status(200).json(photo);
    });
};

/**
 * @api {put} /setDefaultSetting  Updates an existing photo for the setDefault/setDelete photo.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName setDefaultSetting
 * @apiGroup photo
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing photo for the setDefault/setDelete photo.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.setDefaultSetting = function(req, res) {
    Photo.findById(req.params.id, function(err, photo) {
        if (err) { return handleError(res, err); }
        if (!photo) { return res.status(404).send('Not Found'); }
        if (req.body.setDefault && !req.body.setDelete) {
            Photo.update({ $and: [{ email: req.body.email }, { setDelete: false }, { active: true }] }, { $set: { setDefault: false } }, { multi: true }, function(err, photos) {
                if (err) { return handleError(res, err); }
                var updated = _.merge(photo, req.body);
                updated.updated_at = Date.now();
                updated.save(function(err) {
                    if (err) { return handleError(res, err); }
                    return res.status(200).json(photo);
                });
            });
        } else {
            var updated = _.merge(photo, req.body);
            updated.updated_at = Date.now();
            updated.save(function(err) {
                if (err) { return handleError(res, err); }
                return res.status(200).json(photo);
            });
        }

    });
};

/**
 * @api {get} /  Get a single photo
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName show
 * @apiGroup photo
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get a single photo
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Photo.findById(req.params.id, function(err, photo) {
        if (err) { return handleError(res, err); }
        if (!photo) { return res.status(404).send('Not Found'); }
        return res.json(photo);
    });
};

/**
 * @api {post} / Creates a new photo in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup photo
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new photo in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = async function(req, res) {
    var file = {}
    file.originalFilename = req.files.uploads[1].originalFilename;
    file.path = req.files.uploads[1].path;
    file.path = file.path.replace("../", "");
    file.path = file.path.replace("backend/", "");
    file.size = req.files.uploads[1].size;
    file.type = req.files.uploads[1].type;
    file.name = req.files.uploads[1].name;
    file.AIpath = req.files.uploads[0].path;
    var encryptedid = encrypt(key, file.name);
    file.encryptedid = encryptedid,
        file.uid = req.body.uid;
    file.email = req.body.email
    file.type = req.body.type
    if (req.body.authentication) file.authentication = req.body.authentication
    file.expirydate = new Date(moment().add(365, 'days').format())
    var p = await uploadS3(__dirname + '/../../../' + file.path, 'photo', true, async function(p) {
        file.path = p;
        var pat = await uploadS3(__dirname + '/../../../' + file.AIpath, 'photo', true, function(AIp) {
            file.AIpath = AIp
            Photo.create(file, function(err, photo) {
                if (err) { return handleError(res, err); } else {
                    const certDetails = selfCert({
                        attrs: {
                            commonName: 'CognitiveInnovations.in',
                            countryName: 'IN',
                            stateName: 'AP',
                            locality: 'VSP',
                            orgName: 'Cognitive Innovations',
                            shortName: photo._id
                        },
                        bits: 2048,
                        expires: file.expirydate
                    })
                    Photo.findById(photo._id, function(err, updatePhoto) {
                        if (err) { return handleError(res, err); }
                        if (!photo) { return res.status(404).send('Not Found'); }
                        var data = {};
                        data.privateKey = certDetails.privateKey;
                        data.publicKey = certDetails.publicKey;
                        data.certificate = certDetails.certificate;
                        var updated = _.merge(photo, data);
                        updated.save(function(err) {
                            if (err) { return handleError(res, err); } else {
                                fs.mkdirSync('./photo/' + photo._id);
                                fs.writeFile('./photo/' + photo._id + '/photo.pem', photo.certificate, async function(err) {
                                    if (err) throw err;
                                    else {
                                        var p = await uploadS3(__dirname + '/../../../' + 'photo/' + photo._id + '/photo.pem', 'photo', true, function(pempath) {
                                            photo.pemFilePath = pempath
                                            if (photo.authentication) {
                                                var options = {
                                                    method: 'POST',
                                                    uri: config.python + '/postdata',
                                                    body: photo._id,
                                                    json: true
                                                };
                                                var sendrequest = request(options, function(response, result) {
                                                    if (response) {
                                                        photo.active = false
                                                        Photo.findByIdAndUpdate(photo._id, photo, function(err, updatedPhoto) {
                                                            if (err) return res.status(500).send(err);
                                                            return res.status(500).send(response)
                                                        });
                                                    } else if (result && result.body == photo._id) {
                                                        photo.bottlenecksCreated = true;
                                                        photo.save(function(err, updatedPhoto) {
                                                            if (err) { return handleError(res, err); }
                                                            return res.status(200).json(updatedPhoto);
                                                        });
                                                    } else {
                                                        photo.active = false
                                                        photo.save(function(err, updatedPhoto) {
                                                            if (err) return res.status(500).send(err);
                                                            return res.status(200).json({ message: 'AIfailed' });;
                                                        });
                                                    }
                                                });
                                            } else {
                                                photo.save(function(err, updatedPhoto) {
                                                    if (err) return res.status(500).send(err);
                                                    return res.status(200).json(updatedPhoto);
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    });
};


/////--------------- Upload file to S3 Start----------------------

// Uploading file to S3 bucket
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
        if (err) {}
        //success
        if (data) {
            if (deleteFile)
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
            if (callback) callback(data.Location);
            else return data.Location;
        }
    });
}
/// ----------Upload file to S3 End---------------------

/**
 * @api {post} /mobilecreate storing file, when we upload from mobile
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName mobilecreate
 * @apiGroup photo
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} storing file, when we upload from mobile
 * @apiError 500-InternalServerError SERVER error.
 */
exports.mobilecreate = async function(req, res) {
    var file = {}
    file.originalFilename = req.files.uploads[0].originalFilename;
    file.path = req.files.uploads[0].path;
    file.path = file.path.replace("../", "");
    file.path = file.path.replace("backend/", "");
    file.size = req.files.uploads[0].size;
    file.type = req.files.uploads[0].type;
    file.name = req.files.uploads[0].name;
    file.AIpath = req.files.uploads[0].path;
    var encryptedid = encrypt(key, file.name);
    file.encryptedid = encryptedid,
        file.uid = req.body.uid;
    file.email = req.body.email
    file.type = req.body.type
    if (req.body.authentication) file.authentication = req.body.authentication;
    file.expirydate = new Date(moment().add(365, 'days').format())

    var p = await uploadS3(__dirname + '/../../../' + file.path, 'photo', true, function(p) {
        file.path = p;
        file.AIpath = p
        Photo.create(file, function(err, photo) {
            if (err) { return handleError(res, err); } else {
                const certDetails = selfCert({
                    attrs: {
                        commonName: 'CognitiveInnovations.in',
                        countryName: 'IN',
                        stateName: 'AP',
                        locality: 'VSP',
                        orgName: 'Cognitive Innovations',
                        shortName: photo._id
                    },
                    bits: 2048,
                    expires: file.expirydate
                })
                Photo.findById(photo._id, function(err, updatePhoto) {
                    if (err) { return handleError(res, err); }
                    if (!photo) { return res.status(404).send('Not Found'); }
                    var data = {};
                    data.privateKey = certDetails.privateKey;
                    data.publicKey = certDetails.publicKey;
                    data.certificate = certDetails.certificate;
                    var updated = _.merge(photo, data);
                    updated.save(function(err) {
                        if (err) { return handleError(res, err); } else {
                            fs.mkdirSync('./photo/' + photo._id);
                            fs.writeFile('./photo/' + photo._id + '/photo.pem', photo.certificate, async function(err) {
                                if (err) throw err;
                                else {
                                    var p = await uploadS3(__dirname + '/../../../' + 'photo/' + photo._id + '/photo.pem', 'photo', true, function(pempath) {
                                        photo.pemFilePath = pempath
                                        if (photo.authentication) {
                                            var options = {
                                                method: 'POST',
                                                uri: config.python + '/postdata',
                                                body: photo._id,
                                                json: true
                                            };
                                            var sendrequest = request(options, function(response, result) {
                                                if (response) {
                                                    photo.active = false
                                                    Photo.findByIdAndUpdate(photo._id, photo, function(err, updatedPhoto) {
                                                        if (err) return res.status(500).send(err);
                                                        return res.status(500).send(response)
                                                    });
                                                } else if (result && result.body == photo._id) {
                                                    photo.bottlenecksCreated = true;
                                                    photo.save(function(err, updatedPhoto) {
                                                        if (err) { return handleError(res, err); }
                                                        if(req.body.checkauthentication){
                                                            var url=config.frontendUrl+'/checkauthentication/'+updatedPhoto._id
                                                            return res.status(200).json(url);
                                                        }else{
                                                         return res.status(200).json(updatedPhoto);
                                                        }
                                                       // return res.status(200).json(updatedPhoto);
                                                    });
                                                } else {
                                                    photo.active = false
                                                    Photo.findByIdAndUpdate(photo._id, photo, function(err, updatedPhoto) {
                                                        if (err) return res.status(500).send(err);
                                                        return res.status(200).json({ message: 'AIfailed' });;
                                                    });
                                                }
                                            });
                                        } else {
                                            photo.save(function(err, updatedPhoto) {
                                                if (err) return res.status(500).send(err);
                                                return res.status(200).json(updatedPhoto);
                                            });
                                        }
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

/**
 * @api {post} /bottlenecksCreation Creates a bottlenecks to the photo
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName bottlenecksCreation
 * @apiGroup photo
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a bottlenecks to the photo.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.bottlenecksCreation = function(req, res) {
    Photo.findById(req.body._id, function(err, photo) {
        if (err) { return handleError(res, err); }
        if (!photo) { return res.status(404).send('Not Found'); }
        var options = {
            method: 'POST',
            uri: config.python + '/postdata',
            body: photo._id,
            json: true
        };
        var sendrequest = request(options, function(response, result) {
            if (response) {
                return res.status(500).send(response)
            } else if (result && result.body == photo._id) {
                photo.bottlenecksCreated = true;
                photo.save(function(err, updatedPhoto) {
                    if (err) { return handleError(res, err); }
                    return res.status(200).json(updatedPhoto);
                });
            } else {
                return res.status(200).json({ message: 'AIfailed' });;
            }
        });
    });
};

/**
 * @api {post} /createfrommobilelink creating photo, when we upload from mobile
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName createfrommobilelink
 * @apiGroup photo
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} creating photo, when we upload from mobile
 * @apiError 500-InternalServerError SERVER error.
 */
exports.createfrommobilelink = function(req, res) {
    var file = {}
    file.originalFilename = req.files.uploads[1].originalFilename;
    file.path = req.files.uploads[1].path;
    file.path = file.path.replace("../", "");
    file.path = file.path.replace("backend/", "");
    file.size = req.files.uploads[1].size;
    file.type = req.files.uploads[1].type;
    file.name = req.files.uploads[1].name;
    file.AIpath = req.files.uploads[0].path;
    // if (req.body.folderid) file.folderid = req.body.folderid;
    var encryptedid = encrypt(key, file.name);
    // file.link = "http://localhost:4200/document/:" + encryptedid,
    file.encryptedid = encryptedid,
        file.type = req.body.type
    if (req.body.authentication) file.authentication = req.body.authentication
    file.expirydate = new Date(moment().add(365, 'days').format())

    Photo.create(file, function(err, photo) {
        if (err) { return handleError(res, err); } else {
            const certDetails = selfCert({
                attrs: {
                    commonName: 'CognitiveInnovations.in',
                    countryName: 'IN',
                    stateName: 'AP',
                    locality: 'VSP',
                    orgName: 'Cognitive Innovations',
                    shortName: photo._id
                },
                bits: 2048,
                expires: file.expirydate
            })
            Photo.findById(photo._id, function(err, updatePhoto) {
                if (err) { return handleError(res, err); }
                if (!photo) { return res.status(404).send('Not Found'); }
                var data = {};
                data.privateKey = certDetails.privateKey;
                data.publicKey = certDetails.publicKey;
                data.certificate = certDetails.certificate;
                var updated = _.merge(photo, data);
                updated.save(function(err) {
                    if (err) { return handleError(res, err); } else {
                        fs.mkdirSync('./photo/' + photo._id);
                        fs.writeFile('./photo/' + photo._id + '/photo.pem', photo.certificate, function(err) {
                            if (err) throw err;
                            else {
                                if (photo.authentication) {
                                    var options = {
                                        method: 'POST',
                                        uri: config.python + '/postdata',
                                        body: photo._id,
                                        json: true
                                    };
                                    var sendrequest = request(options, function(response, result) {
                                        if (response) {
                                            photo.active = false
                                            Photo.findByIdAndUpdate(photo._id, photo, function(err, updatedPhoto) {
                                                if (err) return res.status(500).send(err);
                                                return res.status(500).send(response)
                                            });
                                        } else if (result && result.body == photo._id) {
                                            photo.bottlenecksCreated = true;
                                            photo.save(function(err, updatedPhoto) {
                                                if (err) { return handleError(res, err); }
                                                return res.status(200).json(updatedPhoto);
                                            });
                                        } else {
                                            photo.active = false
                                            Photo.findByIdAndUpdate(photo._id, photo, function(err, updatedPhoto) {
                                                if (err) return res.status(500).send(err);
                                                return res.status(200).json({ message: 'AIfailed' });;
                                            });
                                        }
                                    });
                                } else
                                    return res.status(200).json(photo);
                            }
                        });
                    }
                });
            });

        }
    });
};

/**
 * @api {put} / Updates an existing photo in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update
 * @apiGroup photo
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing photo in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Photo.findById(req.params.id, function(err, photo) {
        if (err) { return handleError(res, err); }
        if (!photo) { return res.status(404).send('Not Found'); }
        var updated = _.merge(photo, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(photo);
        });
    });
};

/**
 * @api {delete} / Deletes a photo from the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup photo
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Deletes a photo from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Photo.findById(req.params.id, function(err, photo) {
        if (err) { return handleError(res, err); }
        if (!photo) { return res.status(404).send('Not Found'); }
        photo.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

/**
 * @api {post} /dragcreate 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName dragcreate
 * @apiGroup photo
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} 
 * @apiError 500-InternalServerError SERVER error.
 */
exports.dragcreate = function(req, res) {
    if (req.body.type == 'captured') {
        req.body.uid = req.user.id
        Photo.create(req.body, function(err, photo) {
            if (err) { return handleError(res, err); }
            return res.status(201).json(photo);
        });
    } else {
        var file = {}
        file.originalFilename = req.files.uploads.originalFilename;
        file.path = req.files.uploads.path;
        file.path = file.path.replace("../", "");
        file.path = file.path.replace("backend/", "");
        file.size = req.files.uploads.size;
        file.type = req.files.uploads.type;
        file.name = req.files.uploads.name;
        file.uid = req.files.uploads.uid;
        if (req.body.folderid) file.folderid = req.body.folderid;
        var encryptedid = encrypt(key, file.name);
        file.link = "http://localhost:4200/document/:" + encryptedid,
            file.encryptedid = encryptedid,
            file.uid = req.user.id;
        file.type = req.body.type
        Photo.create(file, function(err, photo) {
            if (err) { return handleError(res, err); }
            return res.status(201).json(photo);
        });
    }
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}