'use strict';
var _ = require('lodash');
var Fieldvalue = require('./fieldvalue.model');
var async = require('async');
var Links = require('../links/links.model')
var Document = require('../document/document.model')
const nodemailer = require('nodemailer');
var config = require('../../config/environment');
var key = "secretkey";
var crypto = require("crypto")
var FieldOptions = require('../fieldoption/fieldoption.model');
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
 * @api {get} /  Get list of fieldvalues
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup fieldvalue
 * @apiSuccess {array}  Get list fieldvalues
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Fieldvalue.find(function(err, fieldvalues) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(fieldvalues);
    });
};
/**
 * @api {post} /getvalues/  Get list fieldvalues for specific document
 * @apiName getvalues
 * @apiParam {josn}
 * @apiGroup fieldvalue
 * @apiSuccess {array}  Get list fieldvalues for specific document
 * @apiError 500-InternalServerError SERVER error.
 */
// Get a single fieldvalue
exports.getvalues = function(req, res) {
    Fieldvalue.find({ $and: [{ documentid: req.body.documentid }, { sharedid: req.body.sharedid }] }).exec(function(err, fieldvalue) {
        if (err) { return handleError(res, err); }
        if (!fieldvalue) { return res.status(404).send('Not Found'); }
        return res.json(fieldvalue);
    });
};
/**
 * @api {post} /getCurrFieldVal/  Get a related document all current version fieldvalue records 
 * @apiName getCurrFieldVal
 * @apiParam {json}
 * @apiGroup fieldvalue
 * @apiSuccess {array}  Get a related document all current version fieldvalue records 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getCurrFieldVal = function(req, res) {
    Fieldvalue.find({ $and: [{ documentid: req.body.documentid }, { active: true }] }).exec(function(err, fieldvalue) {
        if (err) { return handleError(res, err); }
        if (!fieldvalue) { return res.status(404).send('Not Found'); }
        return res.json(fieldvalue);
    });
};
/**
 * @api {post} /getDocFieldValueRecords/  Get a related document all fieldvalue records 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getDocFieldValueRecords
 * @apiParam {json}
 * @apiGroup fieldvalue
 * @apiSuccess {array} Get a related document all fieldvalue records 
 * @apiError 404-NoDataFound Not Found.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getDocFieldValueRecords = function(req, res) {
    Fieldvalue.find({ documentid: req.body.documentid }).exec(function(err, fieldvalue) {
        if (err) { return handleError(res, err); }
        if (!fieldvalue) { return res.status(404).send('Not Found'); }
        return res.json(fieldvalue);
    });
};
/**
 * @api {post} /updateSharedFields/  updates fieldvalues in DB
 * @apiName updateSharedFields
 * @apiParam {json}
 * @apiGroup fieldvalue
 * @apiSuccess {String} 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.updateSharedFields = function(req, res) {
    Document.findById(req.body.documentid, function(err, doc) {
        if (err) { return handleError(res, err); }
        if (!doc) { return res.status(404).send('Not Found'); }
        FieldOptions.findOne({ documentid: req.body.documentid, versionid: doc.versionid }).exec(function(err, fieldoptions) {
            if (err) { return handleError(res, err); }
            if (!fieldoptions && !fieldoptions.fields) { return res.status(404).send('Not Found'); }
            async.each(req.body.fieldvalues, function(element, call) {
                Fieldvalue.findOne({ $and: [{ documentid: req.body.documentid }, { id: element.id }] }).exec(function(err, fieldvalue) {
                    if (err) { return handleError(res, err); }
                    if (!fieldvalue) {
                        let ownerfieldoptions = fieldoptions.fields.filter(option => (option.id == element.id && ((option.value == element.value && element.value != undefined) || (option.photoId == element.photoId && element.photoId != undefined) || (option.signatureId == element.signatureId && element.signatureId != undefined) || (option.stampId == element.stampId && element.stampId != undefined))))
                        if (ownerfieldoptions.length) { return call(); }
                        element.documentid = req.body.documentid;
                        element.uid = req.body.uid;
                        if (element.people && element.people == req.body.email && (element.value || element.photoId || element.signatureId || element.stampId)) {
                            element.insertedemail = req.body.email;
                            Fieldvalue.create(element, function(err, newfieldvalue) {
                                if (err) { return handleError(res, err); }
                                call();
                            });
                        } else if (!element.people && (element.value || element.photoId || element.signatureId || element.stampId)) {
                            element.insertedemail = req.body.email;
                            Fieldvalue.create(element, function(err, newfieldvalue) {
                                if (err) { return handleError(res, err); }
                                call();
                            });
                        }
                    } else {
                        return call();
                    }
                });
            });
        })
        Document.findById(req.body.documentid, function(err, doc) {
            if (err) { return handleError(res, err); }
            if (!doc) { return res.status(404).send('Not Found'); }
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
            var encryptid = encrypturl(key, String(doc._id))
            if (req.body.name) var name = req.body.name
            if (req.headers && req.headers.ipaddress) {
                req.body.IpAddress = req.headers.ipaddress
            } else {
                req.body.IpAddress = req.body.IpAddress
            }
            if (req.body.companyname) var name = req.body.companyname
            var HelperOptions = {
                from: '"DOCINTACT" '+config.email,
                to: req.body.tomail,
                subject: name + ' submitted a document to you',
            }
            HelperOptions.html = '<div class="a3s aXjCH msg233836446190015510" id=":q2">' +
                '<div style="width:100%!important;font-family:Helvetica,sans-serif;margin:0;padding:0;">' +
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
                '<h2 class="m_233836446190015510header-title-text m_233836446190015510white-text-color" style="display:inline-block;font-weight:300;color:white;margin:17px 10px 13px 15px;">' + name + '</h2><span class="m_233836446190015510dh-white-wordmark" style="padding-right:20px;vertical-align:bottom;float:right;margin:21px 10px 0 0;">&nbsp;<span class="m_233836446190015510via-text m_233836446190015510white-text" style="color:white;">via</span> <a href="' + config.frontendUrl + '/#' + '"  style="color:white;text-decoration:none;" target="_blank"><strong>DocIntact</strong></a></span></td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td class="m_233836446190015510body-content" style="border-collapse:collapse;padding:20px 30px 50px;"><span class="im"><h3 class="m_233836446190015510sign-request-title-message" style="font-size:18px;font-weight:400;margin:30px 0 50px;">' + name + ' submitted a document to you</h3></span>' +
                '<table class="m_233836446190015510two-column-preview" style="border-collapse:collapse;width:100%;">' +
                '<tbody>' +
                '<tr>' +
                '<td class="m_233836446190015510no-border m_233836446190015510thumb-content-column" style="border-collapse:collapse;width:180px!important;max-width:180px!important;margin:10px;border:none;" valign="top">' +
                '<a href="#"><img class="m_233836446190015510document-thumbnail-image CToWUd fr-fic fr-dib" src="https://staging.docintact.com/assets/images/document.png" style="outline: none; text-decoration: none; border: none; width: 150px !important; max-width: 150px !important;"></a></td>' +
                '<td class="m_233836446190015510no-border m_233836446190015510body-content-column" style="border-collapse:collapse;width:inherit!important;margin:10px;border:none;" valign="top">' +
                '<h3><strong></strong></h3><span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary"  href="' + config.frontendUrl + "/user/checkuser/" + encryptid + '"  style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;color:#fff;background-color:#0275d8;border:1px solid #0275d8;" target="_blank">View Document</a><div class="m_233836446190015510sent-by-text" style="font-size:14px;margin-top:16px;font-size: 16px;border-radius: 5px; padding: 8px 10px;"><div>Shared by ' + req.body.name + '</div><div class="m_233836446190015510text-muted" style="color:#777!important;"><a href="mailto:' + req.body.email + '" target="_blank">' + req.body.email + '</a><div style="color:#211e1e" >Document : ' + doc.name + '</div></div></div></span></td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<div class="yj6qo ajU">' +
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
                '<div>Sent by ' + name + ' (<a href="mailto:' + req.body.email + '" target="_blank">' + req.body.email + '</a>, IP: ' + req.body.IpAddress + ').</div>' +
                '<div>Powered by <a href="' + config.frontendUrl + '/#' + '" style="text-decoration:none;" target="_blank">DocIntact.com</a> - View and sign PDFs in your web browser</div>' +
                '<div>&copy; 2019-2020 Cognitive Innovations</div>' +
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
            transporter.sendMail(HelperOptions, function(err, info) {
                if (err) {}
                return res.status(201).json({ res: "Success" });
            });
        })
    });
};
/**
 * @api {get} /updateFieldValues/  updates fieldvalues in DB
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName updateFieldValues
 * @apiParam {json}
 * @apiGroup fieldvalue
 * @apiSuccess {String}  
 * @apiError 500-InternalServerError SERVER error.
 */
exports.updateFieldValues = function(req, res) {
        async.each(req.body.fieldvalues, function(element, call) {
            Fieldvalue.findOne({ $and: [{ documentid: req.body.documentid }, { id: element.id }] }).exec(function(err, fieldvalue) {
                if (err) { return handleError(res, err); }
                if (!fieldvalue) {
                    call();
                } else {
                    var updated = _.merge(fieldvalue, element);
                    updated.updated_at = Date.now();
                    updated.save(function(err) {
                        if (err) { return handleError(res, err); }
                        call();
                    });
                }
            });
        });
        return res.status(200).json({ res: 'success' });
    }
    /**
     * @api {post} /  Creates a new fieldvalue in the DB. 
     * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
     * @apiName create
     * @apiParam {json}
     * @apiGroup fieldvalue
     * @apiSuccess {json}  Creates a new fieldvalue in the DB.
     * @apiError 500-InternalServerError SERVER error.
     */
exports.create = function(req, res) {
    async.each(req.body.fieldvalues, function(element, call) {
        element.documentid = req.body.documentid;
        element.uid = req.user._id;
        Fieldvalue.create(element, function(err, fieldvalue) {
            if (err) { return handleError(res, err); }
            call();
        });
    });
    return res.status(201).json({ res: "Success" });
};
/**
 * @api {put} /:id Updates an existing fieldvalue in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update
 * @apiParam {json}
 * @apiGroup fieldvalue
 * @apiSuccess {json}  updated field value
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Fieldvalue.findById(req.params.id, function(err, fieldvalue) {
        if (err) { return handleError(res, err); }
        if (!fieldvalue) { return res.status(404).send('Not Found'); }
        var updated = _.merge(fieldvalue, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(fieldvalue);
        });
    });
};
/**
 * @api {delete} /:id  Deletes a fieldvalue from the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiParam {String} fieldvalue id
 * @apiGroup fieldvalue
 * @apiSuccess {String}  
 * @apiError 404-NoDataFound Not Found.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.destroy = function(req, res) {
    Fieldvalue.findById(req.params.id, function(err, fieldvalue) {
        if (err) { return handleError(res, err); }
        if (!fieldvalue) { return res.status(404).send('Not Found'); }
        fieldvalue.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};
// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}