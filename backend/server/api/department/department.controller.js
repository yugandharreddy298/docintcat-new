'use strict';

var _ = require('lodash');
var Department = require('./department.model');

/**
 * @api {get} /  Get list of departments
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup department
 * @apiSuccess {array}  Get list of departments
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Department.find({ $and: [{ $or: [{ organizationid: req.user._id }, { organizationid: req.user.organizationid }] }, { active: true }] }).populate('organizationid').populate('parentdepartmentid').sort({ "created_at": -1 }).exec(function(err, department) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(department);
    });
};

/**
 * @api {get} /departmentslist  Get list of departments
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName departmentslist
 * @apiGroup department
 * @apiSuccess {array}  Get list of departments
 * @apiError 500-InternalServerError SERVER error.
 */
exports.departmentslist = function(req, res) {
    Department.find({ $and: [{ organizationid: req.user.organizationid }, { active: true }] }).populate('organizationid').populate('parentdepartmentid').sort({ "created_at": -1 }).exec(function(err, department) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(department);
    });
};

/**
 * @api {post} /searchdepartment/search  Get searched department data in an organisation
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName searchdepartment
 * @apiGroup department
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Get searched department data in an organisation
 * @apiError 500-InternalServerError SERVER error.
 */
exports.searchdepartment = function(req, res) {
    Department.find({ $and: [{ deptname: { $regex: req.body.search, $options: 'i' } }, { organizationid: req.user._id }, { active: true }] }).populate('organizationid').populate('parentdepartmentid').exec(function(err, department) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(department);
    });
};

/**
 * @api {get} /  Get selected department
 * @apiName show
 * @apiGroup department
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}   Get selected department
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.show = function(req, res) {
    Department.findById(req.params.id, function(err, department) {
        if (err) { return handleError(res, err); }
        if (!department) { return res.status(404).send('Not Found'); }
        return res.json(department);
    });
};

/**
 * @api {post} /   Creates a new department in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName create
 * @apiGroup department
 * @apiSuccess {json}   Creates a new department in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    req.body.organizationid = req.user.id
    Department.create(req.body, function(err, department) {
        if (err) { return handleError(res, err); }
        return res.status(201).json(department);
    });
};

/**
 * @api {put} /  Updates an existing department in the DB.
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName update
 * @apiGroup department
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Updates an existing department in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Department.findById(req.params.id, function(err, department) {
        if (err) { return handleError(res, err); }
        if (!department) { return res.status(404).send('Not Found'); }
        var updated = _.merge(department, req.body);
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(department);
        });
    });
};

/**
 * @api {delete} /  Deletes selected department by making that status as false.
 * @apiName destroy
 * @apiGroup department
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {string}  Deletes selected department by making that status as false.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Department.findById(req.params.id, function(err, department) {
        if (err) { return handleError(res, err); }
        if (!department) { return res.status(404).send('Not Found'); }
        department.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};


/**
 * @api {get} /  Checking department presence
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName checkdepartments
 * @apiGroup department
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json}  Checking department presence
 * @apiError 500-InternalServerError SERVER error.
 */
exports.checkdepartments = function(req, res) {
    if (req.body.type == 'department') var q = { deptname: req.body.value, organizationid: req.user.id, active: true };
    Department.findOne(q, function(err, department) {
        if (err) return next(err);
        if (!department) return res.status(200).send({ "data": false });
        else return res.status(200).send({ "data": true });
    });

}



// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}