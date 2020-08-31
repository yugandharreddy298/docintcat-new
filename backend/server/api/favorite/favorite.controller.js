'use strict';

var _ = require('lodash');
var Favorite = require('./favorite.model');
var async = require('async');

/**
 * @api {get} /  Get list of favorites
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup favorite
 * @apiSuccess {array}  Get list of favorites
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Favorite.find({ $and: [{ uid: req.user._id }, { active: true }] }).populate('fileid').populate('folderid').sort({ updated_at: 'desc' }).exec(function(err, favorites) {
        if (err) { return handleError(res, err); }
        var favoritedata = favorites
        favoritedata.forEach(element => {
            if (element.fileid) {
                if (element.fileid.active == false) {
                    element.fileid = null
                }
            }
            if (element.folderid) {
                if (element.folderid.active == false) {
                    element.folderid = null
                }
            }
        })
        return res.status(200).json(favoritedata)
    });
};

/**
 * @api {get} /  Get selected favorite
 * @apiName show
 * @apiGroup favorite
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {array}  Get selected favorite
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Favorite.find({ $and: [{ fileid: req.params.id }, { active: true }] }).exec(function(err, favorite) {
        if (err) { return handleError(res, err); }
        if (!favorite) { return res.status(404).send('Not Found'); }
        return res.json(favorite);

    });
};

/**
 * @api {post} / Creates a new favorite in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup favorite
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Creates a new favorite in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    req.body.uid = req.user.id
    Favorite.create(req.body, function(err, favorite) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(favorite);
    });
};

/**
 * @api {put} /  Updates an existing favorite in the DB.
 * @apiName update
 * @apiGroup favorite
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Updates an existing favorite in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Favorite.findById(req.params.id, function(err, favorite) {
        if (err) { return handleError(res, err); }
        if (!favorite) { return res.status(404).send('Not Found'); }
        var updated = _.merge(favorite, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(favorite);
        });
    });
};

/**
 * @api {delete} /  Deletes a favorite by changing status as false.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup favorite
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Deletes a favorite by changing status as false
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Favorite.findById(req.params.id, function(err, favorite) {
        if (err) { return handleError(res, err); }
        if (!favorite) { return res.status(404).send('Not Found'); }
        favorite.active = "false";
        favorite.updated_at = Date.now();
        favorite.save(function(err, unfavorite) {
            if (err) { return handleError(res, err); }
            return res.status(201).json({ data: "success" });
        });
    });
};

/**
 * @api {post} /multifavorite making multi files as favourites
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName multifavorite
 * @apiGroup favorite
 * @apiParam {json} data Will send through the body
 * @apiSuccess {String} send success message 
 * @apiError 500-InternalServerError SERVER error.
 */
exports.multifavorite = function(req, res) {
    var folders = req.body.folders
    var files = req.body.files
    var favorite = req.body.make_favorite
    async.each(files, function(element, callback) {
        if (!favorite) {
            Favorite.findById(element.favoriteid, function(err, favorite) {
                if (err) { return handleError(res, err); }
                if (favorite) {
                    favorite.active = false;
                    favorite.updated_at = Date.now();
                    favorite.save();
                }
                callback()
            });
        } else {
            Favorite.findOne({ fileid: element._id }).exec(function(err, favorite) {
                if (favorite) {
                    favorite.active = true;
                    favorite.updated_at = Date.now();
                    favorite.save(function(err, favorite) { callback() })
                } else {
                    var favdoc = {
                        fileid: element._id,
                        isFile: true,
                        uid: req.user._id,
                    }
                    Favorite.create(favdoc, function(favorite) {
                        callback()
                    })
                }
            });
        }

    }, function(err) {
        async.each(folders, function(element1, callback) {
            if (!favorite) {
                Favorite.findById(element1.favoriteid, function(err, favorite) {
                    if (err) { return handleError(res, err); }
                    favorite.active = false;
                    favorite.updated_at = Date.now();
                    favorite.save();
                    callback()
                });
            } else {
                Favorite.findOne({ folderid: element1._id }).exec(function(err, favorite) {
                    if (favorite) {
                        favorite.active = true;
                        favorite.updated_at = Date.now();
                        favorite.save(function(err, favorite) { callback() })
                    } else {
                        var favdoc = {
                            folderid: element1._id,
                            isFolder: true,
                            uid: req.user._id,
                        }
                        Favorite.create(favdoc, function(favorite) {
                            callback()
                        })
                    }
                });
            }
        }, function(err) {
            return res.status(201).json({ message: 'success' });
        })
    })

};

// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}