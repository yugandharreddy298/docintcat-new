'use strict';

var _ = require('lodash');
var Otp = require('./otp.model');

/**
 * @api {get} / Get list of otps
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup otp
 * @apiSuccess {array}  Get list of otps
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Otp.find({ uid: req.user._id }).populate('otpID').exec(function(err, otps) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(otps);
    });
};

/**
 * @api {get} / Get selected otp
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName show
 * @apiGroup otp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get selected otp
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Otp.findById(req.params.id, function(err, otp) {
        if (err) { return handleError(res, err); }
        if (!otp) { return res.status(404).send('Not Found'); }
        return res.json(otp);
    });
};

/**
 * @api {post} / Creates a new otp in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup otp
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Creates a new otp in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    Otp.create(req.body, function(err, otp) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(otp);
    });
};

/**
 * @api {put} / Updates an existing otp in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update
 * @apiGroup otp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing otp in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Otp.findById(req.params.id, function(err, otp) {
        if (err) { return handleError(res, err); }
        if (!otp) { return res.status(404).send('Not Found'); }
        var updated = _.merge(otp, req.body);
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(otp);
        });
    });
};

/**
 * @api {delete} / Deletes a otp from the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup otp
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {String} Deletes a otp from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Otp.findById(req.params.id, function(err, otp) {
        if (err) { return handleError(res, err); }
        if (!otp) { return res.status(404).send('Not Found'); }
        otp.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}