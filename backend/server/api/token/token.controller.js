'use strict';

var _ = require('lodash');
var Token = require('./token.model');
var User = require('../user/user.model');
var auth = require('../../auth/auth.service');


/**
 * @api {Post} /tokens/auth Request to validate device token
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName auth
 * @apiGroup Token
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {object} All_fields of  user.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.auth = function (req, res) {
  Token.findOne({ uid: req.body.uid, deviceuuid: req.body.deviceuuid }, function (error, token) {
    if (error) return res.status(401).json(error);
    else if (!token) return res.status(404).json({ message: 'Something went wrong, please try again.' });
    else {
      User.findById(req.body.uid, function (err, user) {
        if (error) return res.status(401).json(error);
        else {
          var tokens = JSON.parse(JSON.stringify(token));
          tokens.isLoggedIn = true
          var updated = _.merge(token, tokens);
          updated.save(function (err) {
            if (err) { return handleError(res, err); }
            var token = auth.signToken(user._id, user.role);
            return res.json({token: token,user:user});
          });
        }
      });
    }
  });
}

/**
 * @api {get} /tokens Request All token information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup Token
 *
 * @apiSuccess {array} All token records.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get list of tokens
exports.index = function (req, res) {
  Token.find(function (err, tokens) {
    if (err) { return handleError(res, err); }
    return res.status(200).json(tokens);
  });
};

/**
 * @api {get} /tokens/:id Request particular token information  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup Token
 *
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {object} All_fields of particular token Record.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Get a single token
exports.show = function (req, res) {
  Token.findById(req.params.id, function (err, token) {
    if (err) { return handleError(res, err); }
    if (!token) { return res.status(404).send('Not Found'); }
    return res.json(token);
  });
};

/**
 * @api {Post} /tokens/ create tokens
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup Token
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {object} All_fields of  tokens.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Creates a new token in the DB.
exports.create = function (req, res) {
  req.body.uid = req.user._id;
  Token.findOne({ deviceuuid: req.body.deviceuuid }, function (err, token) {
    if (!token) {
      Token.create(req.body, function (err, token) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(token);
      });
    } else {
      var data = { uid: req.body.uid }
      var updated = _.merge(token, req.body);
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(token);
      });
    }
  });

};

/**
 * @api {put} /tokens/:id  Update individual token document
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update
 * @apiGroup Token
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {object} All_fields of   token.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Updates an existing token in the DB.
exports.update = function (req, res) {
  if (req.body._id) { delete req.body._id; }
  Token.findById(req.params.id, function (err, token) {
    if (err) { return handleError(res, err); }
    if (!token) { return res.status(404).send('Not Found'); }
    var updated = _.merge(token, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(token);
    });
  });
};

/**
 * @api {Post} /tokens/fingerprint update token documets
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName fingerprintupdate
 * @apiGroup Token
 *
 * @apiParam {json} data Will send through the body
 * @apiSuccess {object} All_fields of  tokens.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.fingerprintupdate = function (req, res) {
  Token.findOne({ deviceuuid: req.body.deviceuuid }, function (err, token) {
    var data = { uid: req.body.uid }
    var updated = _.merge(token, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(token);
    });

  });
};

/**
 * @api {delete} /tokens/:id Remove a record
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup Token
 *
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {String} success Statement.
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
// Deletes a token from the DB.
exports.destroy = function (req, res) {
  Token.findById(req.params.id, function (err, token) {
    if (err) { return handleError(res, err); }
    if (!token) { return res.status(404).send('Not Found'); }
    token.remove(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};
/**
 * @api {get} /update/:uuid Updates a token from the DB.
 * @apiName updateToken
 * @apiGroup Token
 * @apiParam {string/Number} id Will send through the url parameter.
 * @apiSuccess {json} updated document
 * @apiError 404-NoDataFound Not Found.
 * @apiError  500-InternalServerError SERVER error.
 */
exports.updateToken = function(req, res) {
  Token.findOne({deviceuuid:req.params.uuid}, function (err, token) {
    if(err) { return handleError(res, err); }
    if(!token) { return res.status(404).send('Not Found'); }
    var tokens = JSON.parse(JSON.stringify(token));
    tokens.isLoggedIn = false
    var updated = _.merge(token, tokens);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(token);
    });
  });
};
// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
  return res.status(500).send(err);
}
