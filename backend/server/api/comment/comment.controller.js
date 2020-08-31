'use strict';

var _ = require('lodash');
var Comment = require('./comment.model');
var Document = require('../document/document.model')
const os = require('os');
var auth = require('../../auth/auth.service');

/**
 * @api {get} /  Get list of comments
 * @apiName index
 * @apiGroup comment
 * @apiSuccess {array}  Get list of comments
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Comment.find(function(err, comments) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(comments);
    });
};

/**
 * @api {get} /  Get selected comment by comment id
 * @apiName show
 * @apiGroup comment
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Get selected comment by comment id
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Comment.findById(req.params.id, function(err, comment) {
        if (err) { return handleError(res, err); }
        if (!comment) { return res.status(404).send('Not Found'); }
        return res.json(comment);
    });
};

/**
 * @api {post} /  Creates a new comment in the DB.
 * @apiName create
 * @apiGroup comment
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Creates a new comment in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    req.body.status = "pending"
    Comment.create(req.body, function(err, comment) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(comment);
    });
};

/**
 * @api {post} /postcommentsoutside created comments 
 * @apiName postcommentsoutside
 * @apiGroup comment
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} created comments
 * @apiError 500-InternalServerError SERVER error.
 */
exports.postcommentsoutside = function(req, res) {
    req.body.status = "pending"
    Comment.create(req.body, function(err, comment) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(comment);
    });
};

/**
 * @api {post} /getcomments  get comments for a selected document
 * @apiName getcomments
 * @apiGroup comment
 * @apiParam {json} data Will send through the body
 * @apiSuccess {array}  get comments for a selected document
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getcomments = function(req, res) {
    Comment.find({ documentid: req.body.id, active: true }).populate('uid').populate('parentcommentid').exec(function(err, comment) {
        if (err) { return handleError(res, err); }
        if (!comment) { return res.status(500).send('Internal server error'); }
        return res.json(comment);
    });
};

/**
 * @api {post} /replycomments storing recievers comments in DB
 * @apiName replycomments
 * @apiGroup comment
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  storing recievers comments in DB
 * @apiError 500-InternalServerError SERVER error.
 */
exports.replycomments = function(req, res) {
    req.body.status = "pending"
    Comment.create(req.body, function(err, comment) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(comment);
    });
};

/**
 * @api {post} /replycommentsoutside storing outside recievers comments in DB
 * @apiName replycommentsoutside
 * @apiGroup comment
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  storing outside recievers comments in DB
 * @apiError 500-InternalServerError SERVER error.
 */
exports.replycommentsoutside = function(req, res) {
    req.body.name = os.hostname()
    req.body.status = "pending"
    Comment.create(req.body, function(err, comment) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(comment);
    });
};

/**
 * @api {put} / Updates an existing comment in the DB.
 * @apiName update
 * @apiGroup comment
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Updates an existing comment in the DB. 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Comment.findById(req.params.id, function(err, comment) {
        if (err) { return handleError(res, err); }
        if (!comment) { return res.status(404).send('Not Found'); }
        var updated = _.merge(comment, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(comment);
        });
    });
};

/**
 * @api {delete} / Deletes a comment from the DB.
 * @apiName destroy
 * @apiGroup comment
 * @apiParam id
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Deletes a comment from the DB. 
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    console.log(req.body)
    Comment.findById(req.body.id, function(err, comment) {
        if (err) { return handleError(res, err); }
        if (!comment) { return res.status(404).send('Not Found'); }
        if (req.body.status == "delete")
            comment.active = false
        comment.status = req.body.status
        comment.updated_at = Date.now();
        comment.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}