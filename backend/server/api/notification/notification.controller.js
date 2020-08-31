'use strict';

var _ = require('lodash');
var Notification = require('./notification.model');
var async = require('async');
var Token = require('../token/token.model');
var FCM = require('fcm-push');
var serverKey = 'AAAAL4ZnNeA:APA91bFZscWiwjIpxmuiKgjj_s3U1I47B18bXJsiEMl1JCpcXbGocR-THctdaXGoArzS0R05zduB1NAstTFxk5ZgDrRuOnOlzBX7NCLFmgtyRlqT7HlIgw9NahMmHAFNCN0o5PDqCody';
var fcm = new FCM(serverKey);

/**
 * @api {get} /  Get list of notifications
 * @apiName index
 * @apiGroup notification
 * @apiSuccess {array}  Get list of notifications
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    Notification.find({ $and: [{ $or: [{ toid: req.user._id }, { fromid: req.user._id }] }, { read: false }, { active: true }] }).populate('fromid').populate('toid').populate('sharingPeopleId').populate('documentid').exec(function(err, notifications) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(notifications);
    });
}

/**
 * @api {get} /getOfflinenotification  get all the active notifications
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName getOfflinenotification
 * @apiGroup notification
 * @apiSuccess {array}  get all the active notifications
 * @apiError 500-InternalServerError SERVER error.
 */
exports.getOfflinenotification = function(req, res) {
    Notification.find({ $and: [{ $or: [{ toemail: req.user.email }, { toid: req.user._id }] }] }).sort({ created_at: 'desc' }).populate('fromid').populate('toid').populate('sharingPeopleId').populate('documentid').populate('folderid').exec(function(err, notifications) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(notifications);
    });
}

/**
 * @api {get} /count  get the count for notifications
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName count
 * @apiGroup notification
 * @apiSuccess {number} get the count for notifications
 * @apiError 500-InternalServerError SERVER error.
 */
exports.count = function(req, res) {
    Notification.count({ $and: [{ $or: [{ toemail: req.user.email }, { toid: req.user._id }] }, { read: false }, { active: true }] }).populate('fromid').populate('toid').populate('sharingPeopleId').populate('documentid').exec(function(err, notifications) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(notifications);
    });
}

/**
 * @api {get} / Get selected notification
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName show
 * @apiGroup notification
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {json}  Get selected notification
 * @apiError 500-InternalServerError SERVER error.
 */
exports.show = function(req, res) {
    Notification.findById(req.params.id).populate('fromid').populate('toid').populate('sharingPeopleId').exec(function(err, notification) {
        if (err) { return handleError(res, err); }
        if (!notification) { return res.status(404).send('Not Found'); }
        return res.json(notification);
    });
};

/**
 * @api {post} /  Creates a new notification in the DB.
 * @apiName create
 * @apiGroup notification
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new notification in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.create = function(req, res) {
    Notification.create(req.body, function(err, notification) {
        /****************************Push notification for mobile***************************** */
        Notification.findById(notification._id).populate('fromid').populate('toid').populate('documentid').populate('sharingPeopleId').exec(function(err, notificationdetail) {
                var title = req.body.type;
                var name = notificationdetail.documentid ? notificationdetail.documentid.name : 'folder';
                if (notificationdetail.fromid && notificationdetail.fromid.name && !notificationdetail.fromid.companyname) var fromemail = notificationdetail.fromid.name;
                if (notificationdetail.fromid && !notificationdetail.fromid.name && notificationdetail.fromid.companyname) var fromemail = notificationdetail.fromid.companyname;
                if (!notificationdetail.fromid) var fromemail = (notificationdetail.fromemail).split('@')[0]
                if (req.body.type == 'Shared') var body = fromemail + ' Shared a ' + name + ' to you'
                if (req.body.type == 'submit') var body = fromemail + ' Submitted ' + name
                if (req.body.type == 'closed') var body = fromemail + '  closed ' + name
                if (req.body.type == 'reviewed') var body = fromemail + '  Reviewed ' + name
                var p = notificationdetail.documentid;
                var s = notificationdetail.sharingPeopleId
                var notifytype = req.body.type
                var finaldata = {
                    type: notifytype,
                    shareddata: s
                };
                Token.find({ uid: notification.toid }, function(err, tokens) {     
                    async.forEachOf(tokens, (token, callback) => {
                        if(token.isLoggedIn){
                        var message = {
                            to: token.deviceid,
                            notification: { title: title, body: body, click_action: "FCM_PLUGIN_ACTIVITY" },
                            data: finaldata,
                            priority: "high",
                        };
                        fcm.send(message, function(err, response) {
                            if (err) {
                                console.log("error" + err)
                            } else {
                                console.log("Successfully sent with response: ", response);
                            }
                        });
                    }
                    })
                    
                })
            })
            /****************************Push notification for mobile ends***************************** */
        if (err) { return handleError(res, err); }
        return res.status(201).json(notification);
    });
};

/**
 * @api {put} /  Updates an existing notification in the DB.
 * @apiName update
 * @apiGroup notification
 * @apiSuccess {json} Updates an existing notification in the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    Notification.findById(req.params.id, function(err, notification) {
        if (err) { return handleError(res, err); }
        if (!notification) { return res.status(404).send('Not Found'); }
        var updated = _.merge(notification, req.body);
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(notification);
        });
    });
};

/**
 * @api {post} /clearAllNotifications  clear all notifications
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName clearAllNotifications
 * @apiGroup notification
 * @apiSuccess {json} clear all notifications
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.clearAllNotifications = function(req, res) {
    console.log()
    if(req.body.title == 'notification'){
        Notification.update({$and:[ {$or:[{type:'Shared'},{type:'submit'},{type:'closed'},{type:'reviewed'}]},{ $or: [{ toemail: req.user.email, active: true }, { toid: req.user._id, active: true }] }]}, { active: false }, { multi: true }, function(err, notification) {
            if (err) { return handleError(res, err); }
            if (!notification) { return res.status(404).send('Not Found'); }
            return res.status(204).json({ res: "Removed" });
        })
    }
    else if(req.body.title == 'chat'){
        Notification.update( {$and:[{type:'chat'},{ $or: [{ toemail: req.user.email, active: true }, { toid: req.user._id, active: true }] }]}  , { active: false }, { multi: true }, function(err, notification) {
            if (err) { return handleError(res, err); }
            if (!notification) { return res.status(404).send('Not Found'); }
            return res.status(204).json({ res: "Removed" });
        })
    }
};

/**
 * @api {post} /clearAllNotificationsactive  Making Notifications as read 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName clearAllNotificationsactive
 * @apiGroup notification
 * @apiSuccess {json}  Making Notifications as read
 * @apiError 500-InternalServerError SERVER error.
 */
exports.clearAllNotificationsactive = function(req, res) {
    Notification.update({ $or: [{ toemail: req.user.email, active: true, read: false }, { toid: req.user._id, active: true, read: false }] }, { read: true }, { multi: true }, function(err, notification) {
        if (err) { return handleError(res, err); }
        return res.status(201).json({ res: "Success" });
    });
};

/**
 * @api {delete} / Deletes a notification from the DB.
 * @apiName destroy
 * @apiGroup notification
 * @apiParam {string/Number} id Will send through the url parameter
 * @apiSuccess {String}  Deletes a notification from the DB.
 * @apiError 500-InternalServerError SERVER error.
 * @apiError 404-NoDataFound Not Found.
 */
exports.destroy = function(req, res) {
    Notification.findById(req.params.id, function(err, notification) {
        if (err) { return handleError(res, err); }
        if (!notification) { return res.status(404).send('Not Found'); }
        notification.remove(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(204).send('No Content');
        });
    });
};
/**
 * @api {post} /  Creates a new notification in the DB.
 * @apiName create
 * @apiGroup notification
 * @apiParam {json} data Will send through the body
 * @apiSuccess {json} Creates a new notification in the DB.
 * @apiError 500-InternalServerError SERVER error.
 */
exports.createnotificationForChat = function(req, res) { 
    async.each(req.body.sharerecords, function (element, call) {
        if(element.Chat){
            var fromid,toid,name
            if(req.body.chatdata.email == element.fromid.email){
                fromid = element.fromid._id
                if(element.toid) toid = element.toid._id
                name = element.fromid.name
            } 
            else if(req.body.chatdata.email == element.toemail ) {
                if(element.toid) fromid = element.toid._id
                toid = element.fromid._id
                if(element.toid) name = element.toid.name
                else name = element.toemail
            } 
            if((req.body.chatdata.email != element.toemail) || (req.body.chatdata.email != element.fromid.email)){
                var result = {}
                result.fromemail = req.body.chatdata.email
                if(req.body.chatdata.email != element.toemail) result.toemail = element.toemail
                else if(req.body.chatdata.email != element.fromid.email) result.toemail = element.fromid.email
                result.documentid = req.body.chatdata.documentid
                result.type = 'chat'
                result.fromid = fromid
                result.toid = toid
                Notification.create(result, function(err, notification) {
                });
              
                var body = element.fileid.name + ' '+result.type +' by '+name
                Token.find({ uid: result.toid }, function(err, tokens) {     
                    async.forEachOf(tokens, (token, callback) => {
                        if(token.isLoggedIn){
                        var message = {
                            to: token.deviceid,
                            notification: { title: result.type, body: body, click_action: "FCM_PLUGIN_ACTIVITY" },
                            data: {type:"chat",shareddata:element._id},
                            priority: "high",
                        };
                        fcm.send(message, function(err, response) {
                            if (err) {
                                console.log("error" + err)
                            } else {
                                console.log("Successfully sent with response: ", response);
                            }
                        });
                    }
                    },function(err){
                        call()
                    })
                    
                })
            }
        }
        
       
    }, function (err) {
        return res.status(201).json("success");
      })
};





// Error Handler, if it is called, it will return with 500 status code
function handleError(res, err) {
    return res.status(500).send(err);
}