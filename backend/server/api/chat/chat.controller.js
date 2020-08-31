'use strict';

var _ = require('lodash');
var key = "secretkey@123";
var crypto = require("crypto")
var Chat = require('./chat.model');

/**
 * Encrpyt Data from UTF-8 to hex format  
 * used For Id Encryption
 */
function encrypt(key, data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

/**
 * Decrypt Data from  hex format to UTF-8
 * used For Id Decryption
 */
function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}

/**
 * @api {get} /getdoc  Get selected chat
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup chat
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json} Get selected chat
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.index = function(req, res) {
    Chat.findById(req.params.id).populate('from').populate('to').count().exec(function(err, chat) {
        if (err) { return handleError(res, err); }
        if (!chat) {
            return res.status(404).send('Not Found');
        } else {
            Chat.findById(req.params.id).populate('from').populate('to').exec(function(err, chatdata) {
                var data = chatdata;
                for (var i = 0; i < chat; i++) {
                    data[i].message = decrypt(key, data[i].message);
                }
                return res.json(data);
            });
        }
    });
};

/**
 * @api {get} /  Get a list of chat for a document
 * @apiName show
 * @apiGroup chat
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {array}  Get a list of chat for a document
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Chat.find({ documentid: req.params.id }).sort({ created_at: 'asc' }).populate('from').count().exec(function(err, chat) {
        if (err) { return handleError(res, err); }
        if (!chat) {
            return res.status(404).send('Not Found');
        } else {
            Chat.find({ documentid: req.params.id }).sort({ created_at: 'asc' }).populate('from').exec(function(err, chatdata) {
                var data = chatdata;
                for (var i = 0; i < chat; i++) {
                    data[i].message = decrypt(key, data[i].message);
                }
                return res.json(data);
            });
        }
    });
};

/**
 * @api {get} /  Get a list of unread chat for a user
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getChat
 * @apiGroup chat
 * @apiSuccess {array}  Get a list of unread chat for a user
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.getChat = function(req, res) {
    Chat.find({ $and: [{ $or: [{ from: req.user._id }, { to: req.user._id }] }, { read: false }] }).sort({ created_at: 'asc' }).populate('from').populate('to').exec(function(err, chat) {
        if (err) { return handleError(res, err); }
        if (!chat) { return res.status(404).send('Not Found'); }
        return res.json(chat);
    });
};

/**
 * @api {post} /  Creates a new chat in the DB.
 * @apiName create
 * @apiGroup chat
 * @apiParam {json} data Will send through the body
 * @apiSuccess {array}  Creates a new chat in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    req.body.message = encrypt(key, req.body.message)
    req.body.from = req.body.uid;
    Chat.create(req.body, function(err, chat) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(chat);
    });
};

/**
 * @api {put} /  Updates an existing chat in the DB.
 * @apiName update
 * @apiGroup chat
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Updates an existing chat in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Chat.findById(req.params.id, function(err, chat) {
        if (err) { return handleError(res, err); }
        if (!chat) { return res.status(404).send('Not Found'); }
        var updated = _.merge(chat, req.body);
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(chat);
        });
    });
};

/**
 * @api {delete} /  Deletes a chat from the DB.
 * @apiName destroy
 * @apiGroup chat
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {string} returing 'No Content' string.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Chat.findById(req.params.id, function(err, chat) {
        if (err) { return handleError(res, err); }
        if (!chat) { return res.status(404).send('Not Found'); }
        chat.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}