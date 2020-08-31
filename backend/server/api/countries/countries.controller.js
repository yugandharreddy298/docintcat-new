'use strict';

var _ = require('lodash');
var Countries = require('./countries.model');

/**
 * @api {get} / Get list of countries
 * @apiName index
 * @apiGroup countries
 * @apiParam 
 * @apiSuccess {array}  Get list of countries
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Countries.find(function(err, countriess) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(countriess);
    });
};

/**
 * @api {get} / Get selected countries
 * @apiName show
 * @apiGroup countries
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Get selected countries
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Countries.findById(req.params.id, function(err, countries) {
        if (err) { return handleError(res, err); }
        if (!countries) { return res.status(404).send('Not Found'); }
        return res.json(countries);
    });
};

/**
 * @api {post} / Creates a new countries in the DB.
 * @apiName create
 * @apiGroup countries
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Creates a new countries in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    Countries.create(req.body, function(err, countries) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(countries);
    });
};

/**
 * @api {put} / Updates an existing countries in the DB.
 * @apiName update
 * @apiGroup countries
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Updates an existing countries in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Countries.findById(req.params.id, function(err, countries) {
        if (err) { return handleError(res, err); }
        if (!countries) { return res.status(404).send('Not Found'); }
        var updated = _.merge(countries, req.body);
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(countries);
        });
    });
};

/**
 * @api {delete} / Deletes selected countries from the DB.
 * @apiName destroy
 * @apiGroup countries
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Deletes selected countries from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Countries.findById(req.params.id, function(err, countries) {
        if (err) { return handleError(res, err); }
        if (!countries) { return res.status(404).send('Not Found'); }
        countries.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}