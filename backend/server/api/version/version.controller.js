'use strict';

var _ = require('lodash');
var Version = require('./version.model');
/**
 * @api {get} /versions/AllDocVersions/:id Request All versions information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup Version
 *
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {Array} All versions records.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get list of versions
exports.index = function(req, res) {
  Version.find({documentid:req.params.id}).sort({created_at: 'desc'}).exec(function (err, versions) {
   if(err) { return handleError(res, err); }
    return res.status(200).json(versions);
  });
};

/**
 * @api {get} /versions/:id Request particular version information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup Version
 *
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {Json} All_fields of particular version Record.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get a single version
exports.show = function(req, res) {
  Version.findById(req.params.id, function (err, version) {
    if(err) { return handleError(res, err); }
    if(!version) { return res.status(404).send('Not Found'); }
    return res.json(version);
  });
};

/**
 * @api {Post} /versions/ create version
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup Version
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {Json} All_fields of  version.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Creates a new version in the DB.
exports.create = function(req, res) {
  req.body.uid = req.user._id;
  Version.create(req.body, function(err, version) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(version);
  });
};

/**
 * @api {put} /versions/:id  Update individual Version document
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update
 * @apiGroup Version
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {Json} All_fields of   Version.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Updates an existing version in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Version.findById(req.params.id, function (err, version) {
    if (err) { return handleError(res, err); }
    if(!version) { return res.status(404).send('Not Found'); }
    var updated = _.merge(version, req.body);
    updated.updated_at = Date.now();
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(version);
    });
  });
};

/**
 * @api {delete} /versions/:id Remove a record
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup Version
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {String} success Statement.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Deletes a version from the DB.
exports.destroy = function(req, res) {
  Version.findById(req.params.id, function (err, version) {
    if(err) { return handleError(res, err); }
    if(!version) { return res.status(404).send('Not Found'); }
    version.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}