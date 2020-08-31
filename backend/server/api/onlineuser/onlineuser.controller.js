'use strict';

var _ = require('lodash');
var Onlineuser = require('./onlineuser.model');

/**
 * @api {get} /  Get list of onlineusers
 * @apiName index
 * @apiGroup onlineuser
 * @apiSuccess {array} Get list of onlineusers
 * @apiError 500-InternalServerError SERVER error.
 */
// 
exports.index = function(req, res) {
    Onlineuser.find(function(err, onlineusers) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(onlineusers);
    });
};

/**
 * @api {get} / Get selected onlineuser
 * @apiName show
 * @apiGroup onlineuser
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {array}  Get selected onlineuser
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Onlineuser.find({ fileid: req.params.id, viewStatus: true }).populate('uid').exec(function(err, onlineuser) {
        if (err) { return handleError(res, err); }
        if (!onlineuser) { return res.status(404).send('Not Found'); }
        return res.json(onlineuser);
    });
};

/**
 * @api {post} / Creates/updates onlineuser in the DB.
 * @apiName create
 * @apiGroup onlineuser
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates/updates onlineuser in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    req.body.uid = req.body.uid;
    Onlineuser.findOne({ fileid: req.body.fileid, uid: req.body.uid }).exec(function(err, onlineuser) {
        if (!onlineuser) {
            Onlineuser.create(req.body, function(err, onlineuser) {
                if (err) {
                    return handleError(res, err);
                }
                return res.status(201).json(onlineuser);
            });
        } else {
            req.body.viewStatus = true
            var updated = _.merge(onlineuser, req.body);
            updated.save(function(err) {
                if (err) { return handleError(res, err); }
                return res.status(200).json(onlineuser);
            });
        }
    });
};

/**
 * @api {put} /  Updates an existing onlineuser in the DB.
 * @apiName update
 * @apiGroup onlineuser
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Updates an existing onlineuser in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    req.body.endTime = new Date(req.body.endTime)
    if (req.body._id) { delete req.body._id; }
    Onlineuser.findById(req.params.id, function(err, onlineuser) {
        if (err) { return handleError(res, err); }
        if (!onlineuser) { return res.status(404).send('Not Found'); }
        var updated = _.merge(onlineuser, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(onlineuser);
        });
    });
};

/**
 * @api {delete} / Deletes a onlineuser from the DB.
 * @apiName destroy
 * @apiGroup onlineuser
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Deletes a onlineuser from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Onlineuser.findById(req.params.id, function(err, onlineuser) {
        if (err) { return handleError(res, err); }
        if (!onlineuser) { return res.status(404).send('Not Found'); }
        onlineuser.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}