'use strict';

var _ = require('lodash');
var Links = require('./links.model');

/**
 * @api {get} /  Get list of links
 * @apiName index
 * @apiGroup links
 * @apiSuccess {array}  Get list of links
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Links.find(function(err, linkss) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(linkss);
    });
};

/**
 * @api {get} / Get selected links
 * @apiName show
 * @apiGroup links
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Get selected links
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Links.findById(req.body, function(err, links) {
        if (err) { return handleError(res, err); }
        if (!links) { return res.status(404).send('Not Found'); }
        return res.json(links);
    });
};

/**
 * @api {post} /  Creates a new links in the DB.
 * @apiName create
 * @apiGroup links
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new links in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    Links.create(req.body, function(err, links) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(links);
    });

}

/**
 * @api {put} /  Updates an existing links in the DB.
 * @apiName update
 * @apiGroup links
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Updates an existing links in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Links.findById(req.params.id, function(err, links) {
        if (err) { return handleError(res, err); }
        if (!links) { return res.status(404).send('Not Found'); }
        var updated = _.merge(links, req.body);
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(links);
        });
    });
};

/**
 * @api {delete} /  Deletes a links from the DB.
 * @apiName destroy
 * @apiGroup links
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {String}  Deletes a links from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Links.findById(req.params.id, function(err, links) {
        if (err) { return handleError(res, err); }
        if (!links) { return res.status(404).send('Not Found'); }
        links.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}