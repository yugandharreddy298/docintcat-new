'use strict';
var _ = require('lodash');
var Fieldoption = require('./fieldoption.model');
var Fieldvalue = require('../fieldvalue/fieldvalue.model');
/**
 * @api {post} /CurrentVersionDocFields  Get list of fields for document with specific version
 * @apiName index
 * @apiGroup fieldoption
 * @apiSuccess {json} Get list of fields
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Fieldoption.findOne({ $and: [{ active: true }, { versionid: req.body.versionid }, { documentid: req.body.documentid }] }).exec(function(err, fieldoptions) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(fieldoptions);
    });
};
/**
 * @api {post} /versionDocfieldvalues  Get list of fields with values for document with specific version
 * @apiName versionFieldValues
 * @apiGroup fieldoption
 * @apiParam {json}
 * @apiSuccess {array} get  All fields with values
 * @apiError 500-InternalServerError SERVER error.
 */
exports.versionFieldValues = function(req, res) {
    var result = [];
    var async = require('async');
    Fieldoption.findOne({ $and: [{ active: true }, { versionid: req.body.versionid }, { documentid: req.body.documentid },{istemplate:false}] }).exec(function(err, fieldoptions) {
        if (err) { return handleError(res, err); } else if (!fieldoptions) { return res.status(200).send(result); } else {
            Fieldvalue.find({ $and: [{ documentid: req.body.documentid }, { active: true }] }).exec(function(err, fieldvalue) {
                if (!fieldvalue) return res.json(fieldoptions);
                else {
                    async.eachSeries(fieldoptions.fields, function iteratee(field, callback) {
                        var f = _.filter(fieldvalue, { 'id': field.id })[0];
                        if (f && f.id) {
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
                            if (f.longitude) _f.longitude = f.longitude;
                            if (f.latitude) _f.latitude = f.latitude;
                            if (_f.value) _f.uid = _f.uid;
                            if(f.fontsize) _f.fontsize = f.fontsize;

                            result.push(_f);
                            callback();
                        } else {
                            result.push(field);
                            callback();
                        }
                    }, function done() {
                        res.send(result);
                    });
                }

            });
        }
    });
};
/**
 * @api {get} /gettempltes  Get list templates for specific user
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName gettempltes
 * @apiGroup fieldoption
 * @apiSuccess {array}  Get list templates for specific user
 * @apiError 500-InternalServerError SERVER error.
 */
exports.gettempltes = function(req, res) {
    Fieldoption.find({ $and: [{ active: true }, { uid: req.user.id }, { istemplate: true }] }).sort({ created_at: 'desc' }).exec(function(err, fieldoptions) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(fieldoptions);
    });
};
/**
 * @api {get} /:id  Get a single fieldoption
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName show
 * @apiParam {String} encryptedid
 * @apiGroup fieldoption
 * @apiSuccess {array}  Get list templates for specific user
 * @apiError 500-InternalServerError SERVER error.
 */
exports.show = function(req, res) {
    Fieldoption.find({ $and: [{ active: true }, { encryptedid: req.params.id }] }).exec(function(err, fieldoption) {
        if (err) {
            return handleError(res, err);
        }
        if (!fieldoption) { return res.status(404).send('Not Found'); }
        return res.json(fieldoption);
    });
};
/**
 * @api {get} /getSelectedTemplate/:id  get selected template
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getSelectedTemplate
 * @apiGroup fieldoption
 * @apiparam {String} templateid
 * @apiSuccess {json} get selected template
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getSelectedTemplate = function(req, res) {
    Fieldoption.findById(req.params.id).exec(function(err, fieldoption) {
        if (err) { return handleError(res, err); }
        if (!fieldoption) { return res.status(404).send('Not Found'); }
        return res.json(fieldoption);
    });
};
/**
 * @api {post} /  Creates a new fieldoption in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup fieldoption
 * @apiParam {json}
 * @apiSuccess {json} get created fieldoptions
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    req.body.uid = req.user._id;
    Fieldoption.create(req.body, function(err, fieldoption) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(fieldoption);
    });
};
/**
 * @api {post} /emailcheck  Creates a new fieldoption in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName emailcheck
 * @apiGroup fieldoption
 * @apiSuccess {array} get selected template
 * @apiError 500-InternalServerError SERVER error.
 */
exports.emailcheck = function(req, res) {
    req.body.uid = req.user._id;
    Fieldoption.find({ $and: [{ uid: req.user._id }, { 'fields.email': { $regex: req.body.searchvalue } }] }).exec(function(err, fieldoption) {
        if (err) { return handleError(res, err); }
        if (!fieldoption) { return res.status(404).send('Not Found'); }
        return res.json(fieldoption);
    });
};
/**
 * @api {put} /:id  Updates an existing fieldoption in the DB.
 * @apiName update
 * @apiGroup fieldoption
 * @apiparam {String} fieldoptionsid
 * @apiSuccess {json} get updated fieldoptions
 * @apiError 500-InternalServerError SERVER error.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Fieldoption.findById(req.params.id, function(err, fieldoption) {
        if (err) { return handleError(res, err); }
        if (!fieldoption) { return res.status(404).send('Not Found'); }
        var updated = _.merge(fieldoption, req.body);
        console.log(updated,)
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(fieldoption);
        });
    });
};
/**
 * @api {put} /overridetemplate/:id  ovveride template
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName overridetemplate
 * @apiGroup fieldoption
 * @apiparam {String} templateid
 * @apiSuccess {json} get template fields
 * @apiError 500-InternalServerError SERVER error.
 */
exports.overridetemplate = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Fieldoption.findById(req.params.id, function(err, fieldoption) {
        if (err) {
            return handleError(res, err);
        }
        if (!fieldoption) { return res.status(404).send('Not Found'); }
        var updated = _.merge(fieldoption, req.body);
        updated.updated_at = Date.now();
        updated.fields = []
        updated.fields = req.body.fields
        console.log(updated.field,"{{{{{s")
        updated.save(function(err,updatedfieldOptions) {
            if (err) { return handleError(res, err); }
            // console.log(updatedfieldOptions)
            return res.status(200).json(updatedfieldOptions);
        });
    });
};
/**
 * @api {put} /destroy  Deletes a fieldoption from the DB.
 * @apiName destroy
 * @apiGroup fieldoption
 * @apiparam {String}fieldoptionid
 * @apiSuccess {string} No Content
 * @apiError 500-InternalServerError SERVER error.
 */
exports.destroy = function(req, res) {
    Fieldoption.findById(req.params.id, function(err, fieldoption) {
        if (err) { return handleError(res, err); }
        if (!fieldoption) { return res.status(404).send('Not Found'); }
        fieldoption.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};
// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}