'use strict';

var _ = require('lodash');
var Mobilelink = require('./mobilelink.model');
var config = require('../../config/environment');
var moment = require('moment')
var key = "secretkey";
var crypto = require("crypto");

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
 * Decrypt Data from  hex format to UTF-8
 * used For Id Decryption
 */
function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

/**
 * @api {get} /  Get list of mobilelinks
 * @apiName index
 * @apiGroup mobilelink
 * @apiSuccess {array}  Get list of mobilelinks
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Mobilelink.find(function(err, mobilelinks) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(mobilelinks);
    });
};

/**
 * @api {get} / Get selected mobilelink
 * @apiName show
 * @apiGroup mobilelink
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Get selected mobilelink
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Mobilelink.findById(decrypt(key, req.params.id), function(err, mobilelink) {
        if (err) { return handleError(res, err); }
        if (!mobilelink) { return res.status(404).send('Not Found'); }
        if (new Date() > mobilelink.expire_at) return res.status(200).json({ expired: true });
        return res.status(200).json(mobilelink);
    });
};

/**
 * @api {post} /  Creates a new mobilelink in the DB.
 * @apiName create
 * @apiGroup mobilelink
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Creates a new mobilelink in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    req.body.expire_at = moment().add(10, 'minutes').format('ddd, MMM D, YYYY hh:mm:ss A');
    Mobilelink.create(req.body, async function(err, mobilelink) {
        if (err) { return handleError(res, err); }
        await sendMessage(mobilelink)
        return res.status(201).json(mobilelink);
    });
};

/**
 * @api {put} /  Updates an existing mobilelink in the DB.
 * @apiName update
 * @apiGroup mobilelink
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing mobilelink in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    req.body.toIP = req.connection.remoteAddress;
    req.body.expire_at = Date.now()
    Mobilelink.findById(req.params.id, function(err, mobilelink) {
        if (err) { return handleError(res, err); }
        if (!mobilelink) { return res.status(404).send('Not Found'); }
        var updated = _.merge(mobilelink, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json(mobilelink);
        });
    });
};

/**
 * @api {delete} / Deletes a mobilelink from the DB.
 * @apiName destroy
 * @apiGroup mobilelink
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Deletes a mobilelink from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Mobilelink.findById(req.params.id, function(err, mobilelink) {
        if (err) { return handleError(res, err); }
        if (!mobilelink) { return res.status(404).send('Not Found'); }
        mobilelink.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}

// Sending link to mobile for updating photo/initial/signature/stamp.
function sendMessage(MessageData) {
    var AWS = require('aws-sdk');
    if (MessageData.type) {
        var mobilelinkid = encrypt(key, MessageData._id.toString());
        AWS.config.region = 'us-east-1';
        var sns = new AWS.SNS();
        var params = {
            Message: "Please click this link to upload the " + MessageData.type + " for DOCINTACT : " + config.frontendUrl + "/user/uploadbylink/" + mobilelinkid,
            MessageStructure: 'string',
            PhoneNumber: MessageData.phNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        }
        var AWS = require('aws-sdk');
        // Create promise and SNS service object
        var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

        publishTextPromise.then(
            function(data) {
                console.log("MessageID is " + data.MessageId);
            }).catch(
            function(err) {
                console.error(err, err.stack);
            });
    }
}