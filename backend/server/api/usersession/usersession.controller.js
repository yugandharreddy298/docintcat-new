'use strict';

var _ = require('lodash');
var Usersession = require('./usersession.model');

// Get list of usersessions
exports.index = function(req, res) {
  Usersession.find(function (err, usersessions) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(usersessions);
  });
};

// Get a single usersession
exports.show = function(req, res) {
  Usersession.findById(req.params.id, function (err, usersession) {
    if(err) { return handleError(res, err); }
    if(!usersession) { return res.status(404).send('Not Found'); }
    return res.json(usersession);
  });
};

// Creates a new usersession in the DB.
exports.create = function(req, res) {
  Usersession.create(req.body, function(err, usersession) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(usersession);
  });
};

// Updates an existing usersession in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Usersession.findById(req.params.id, function (err, usersession) {
    if (err) { return handleError(res, err); }
    if(!usersession) { return res.status(404).send('Not Found'); }
    var updated = _.merge(usersession, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(usersession);
    });
  });
};

// Deletes a usersession from the DB.
exports.destroy = function(req, res) {
  Usersession.findById(req.params.id, function (err, usersession) {
    if(err) { return handleError(res, err); }
    if(!usersession) { return res.status(404).send('Not Found'); }
    usersession.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

// Deletes a usersession from the DB.
exports.clearAll = function (req, res) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    var token = req.headers.authorization.split(' ')[1];
  }
  Usersession.remove({ uid: req.user._id, token: { $ne: token } }).exec(function (err, usersession) {
    if (err) { return handleError(res, err); }
    return res.status(200).json('cleared successfully');
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}