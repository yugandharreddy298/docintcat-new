'use strict';

var _ = require('lodash');
var Docimage = require('./docimage.model');

/**
 * @api {get} /getDocumentImages  Get list of docimages
 * @apiName index
 * @apiGroup docimage
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {array}  Get list of docimages
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Docimage.find({ $and: [{ documentid: req.params.id }, { active: true }, { originalImg: true }] }).sort({ pageNo: 'asc' }).exec(function(err, docimages) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(docimages);
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}