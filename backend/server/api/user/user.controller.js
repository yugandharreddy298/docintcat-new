'use strict';

var User = require('./user.model');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var rn = require('random-number')
var OtpModel = require('../otp/otp.model');
var moment = require('moment')
var Countries = require('../countries/countries.model');
var key = "secretkey";
var crypto = require("crypto")
var Links = require('../links/links.model')
var twitterAPI = require('node-twitter-api');
var _ = require('lodash');
var Department = require('../department/department.model');
var Sharingpeople = require('../sharingpeople/sharingpeople.model');
var Signature = require('../signature/signature.model');
var Photo = require('../photo/photo.model');
var Stamp = require('../stamp/stamp.model');
var Notification = require('../notification/notification.model');
var Fieldvalue = require('../fieldvalue/fieldvalue.model');
var Fieldoption = require('../fieldoption/fieldoption.model');
var async = require('async');
var userseesion=require('../../api/usersession/usersession.model')


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
 * Decrypt Data from UTF-8 to hex format  
 * used For Id Decryption
 */
function decrypt(key, data) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
var validationError = function(res, err) {
    return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
/**
 * @api {get} / or  /getRegisteredUsers     : index  get Users
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index
 * @apiGroup User
 * @apiSuccess {Array} get selected template
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index = function(req, res) {
    User.find({ role: 'user', active: true }, '-salt -hashedPassword').sort({ created_at: 'desc' }).exec(function(err, users) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(users);
    });
};

/**
 * @api {get} /getUsers    :    Registered Users List
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName index1
 * @apiGroup User
 * @apiSuccess {Array} get selected template
 * @apiError 500-InternalServerError SERVER error.
 */
exports.index1 = function(req, res) {
    User.find({ role: 'user', active: true }, '-salt -hashedPassword').sort({ created_at: 'desc' }).exec(function(err, users) {
        if (err) return res.status(500).send(err);
        res.send(users);
    });
};
/**
 * @api {post} /newemailactivate   :  Activate employee when click on mail link
 * @apiName activatenewemail
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError  Invalid Link / Link expired
 */
exports.activatenewemail = function(req, res) {
    var newpass = req.body.password;
    var decryptid = decrypt(key, req.body.id);
    if (newpass) {
        User.findOne({ _id: decryptid }, '-salt -hashedPassword', function(err, user) {
            user.active = "true";
            user.new = 'true';
            user.password = newpass
            user.updated_at = Date.now();
            user.save(function(err, users) {
                if (err) return validationError(res, err);
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    secure: false,
                    port: 25, // use SSL
                    auth: {
                        user: config.email,
                        pass: config.password
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                var HelperOptions = {

                    from: '"DOCINTACT" '+config.email,
                    to: user.email,
                    subject: "Welcome to DocIntact",
                };
                if(user.name) user.name = user.name
                else if(user.companyname) user.name = user.companyname
                HelperOptions.html = '<table class="main" width="100%" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#F4F7FA"'+
                                             'style="border: 1px solid #DADADA;max-width: 680px;">'+            
                                             '<tr>'+
                                              '<td colspan="3" height="112" align="center" valign="middle"> <a href="'+config.frontendUrl+'">'+
                                              '<img src='+'"'+config.frontendUrl+'/images/Group2244.png" alt=""></a></td>'+
                                              '</tr>'+
                                              '<tr>'+
                                               '<td align="center" valign="top" class="" width="50" style="width: 50px;"> &nbsp;</td>'+
        '<td align="center" valign="top" class="" width="50" height="780"'+
            'style="border-radius:6px; background: #fff; width: 640px;  padding-left: 20px; padding-right:20px;">'+
            '<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-header"'+
                            'style="color: #000000;font-size: 24px;text-align: center;margin-top: 20px !important;margin-bottom: 30px !important;">'+
                            '<p style=" margin: 0;line-height: 1.5;color:#000 !important;">Welcome !</p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="start-content"'+
                            'style="padding-left:34px; padding-right:34px;color: #000000;font-size: 16px;text-align: left;font-family: "'+
                            'Poppins", sans-serif;">'+
                            '<p style="margin: 0;line-height: 1.5;color:#000 !important;"> Mr/Ms '+user.name+' ,Good Day</p>'+
                            '<p class="p-mrg"'+
                                'style="margin-bottom: 30px !important;margin-top: 20px !important;margin: 0 !important;line-height: 1.5;color:#000 !important;">'+
                                'Thank you for registering with DOC INTACT. Your account has been activated successfully.'+
                                'Please Sign in to <a href="'+config.frontendUrl+'">www.docintact.com</a> </p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="30">&nbsp;'+
                        '<hr style="border: 0.5px solid #d5d5d5;">'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="center" valign="top">'+
                        '<div class="row-sub">'+
                            '<p style="color: #000 !important;font-size:20px;text-align: center;font-family:Poppins,'+
                                'sans-serif;margin: 0 !important;line-height: 1.5;"><b style="color:#000;">Our Beloved'+
                                    'Features</b></p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%; " width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:34px;">'+
                                        '<div><img src='+'"'+config.frontendUrl+'/assets/images/icon1.png">'+
                                        '</div>'+
                                    '</td>'+
                                    '<td style="padding-right:59px;">'+
                                        '<div class="row-subr">'+
                                            '<p style="color: #000 !important;font-size:17px;font-family:Poppins,'+
                                                'sans-serif;text-align: left;padding-left: 36px;margin-bottom: 10px'+
                                                '!important;margin: 0 !important;line-height: 1.5;"><b'+
                                                    'style="color:#000 !important;">Access Your Files Anywhere</b></p>'+
                                        '</div>'+
                                        '<div class="row-parar" style="padding-right: 25px;">'+
                                            '<p style="color: #000 !important;font-size:15px;font-family:Poppins,'+
                                                'sans-serif;padding-left: 36px;margin: 0;line-height: 1.5;">Our Doc'+
                                                'Intact provides the access to your files from anywhere, thus avoiding'+
                                                'any professional delays or work setbacks.</p>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
               '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%;" width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:59px;">'+
                                       '<div class="text1">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom: 10px'+
                                                    '!important;"><b>Upload your documents </b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color: #000000;font-size:15px;font-family:Poppins,'+
                                                    'sans-serif;text-align: left;padding-right: 36px;line-height:1.5;">Instantly Upload'+
                                                    'the document and send it for any required actions, it can be a'+
                                                    'signature, review and approval or all of them.</p>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="image1"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/docupld.png">'+
                                        '</div>'+
                                    '</td>'+
                                    '<td style="padding-right:34px;">'+
                                        '<div class="image2" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/docupld.png"></div>'+
                                        '<div class="text2"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<div class="row-subl">'+
                                                '<p><b>Share documents securely/b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p>Documents are end –to-end encrypted and can be shared via email with'+
                                                    'geographical location restriction.</p>'+
                                           '</div>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%;" width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:34px;">'+
                                        '<div><img src='+'"'+config.frontendUrl+'/assets/images/tempmng.png"></div>'+
                                    '</td>'+
                                    '<td style="padding-right:59px;">'+
                                        '<div class="row-subr">'+
                                            '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                'sans-serif;text-align: left;padding-left: 36px;margin-bottom: 10px;">'+
                                                '<b>Template management</b></p>'+
                                        '</div>'+
                                        '<div class="row-parar" style="padding-right: 25px;">'+
                                            '<p style="color: #000000;font-size: 15px;font-family:Poppins,'+
                                                'sans-serif;padding-left: 36px;line-height:1.5;">Doc Intact supports Template Management'+
                                                'system to simplify the sharing process while sending documents to the'+
                                                'small group or individuals. You can use same template without making any'+
                                                'changes or can customize the template as per the requirement.</p>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%; margin-bottom:30px;" width="100%" border="0" align="left"'+
                            'cellpadding="0" cellspacing="0" class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:59px;">'+
                                        '<div class="text1" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom:'+
                                                    '10px"><b>Heat maps</b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color: #000000;font-size:15px;font-family:Poppins,'+
                                                    'sans-serif;text-align: left;padding-right: 36px;color:#000'+
                                                    '!important;line-height:1.5;">Heatmap tracks out the shared documents, where user pay'+
                                                    'attention and analyze how long and what pages he has gone through.'+
                                                '</p>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="image1"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/heatmap.png"> </div>'+
                                    '</td>'+
                                    '<td style="padding-right:34px;">'+
                                        '<div class="image2" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/heatmap.png"></div>'+
                                        '<div class="text2"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size: 16px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom:'+
                                                    '10px;"><b style="color:#000 !important;">Id Based User'+
                                                        'Identification</b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color:#000 !important;">Lorem Ipsum is simply dummy text of'+
                                                    'the printing and typesetting industry specimen book.</p>'+
                                            '</div>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                           '</tbody>'+
                       '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="20">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-btn" style="text-align:center;"> <a'+
                                'style="    color: #ffffff;background: #0187D1;border-radius: 4px;-moz-border-radius: 4px;-webkit-border-radius: 4px;border-width: 0;padding: 16px 117px;font-size: 16px;font-family: "'+
                                'Poppins", sans-serif;font-weight: 600;text-decoration: none;"> Share Documents Now'+
                                '</button> </a>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-parac" style="text-align:center;">'+
                            '<p style="color:#000 !important;"> If you have any queries, please write to us at </p>'+
                            '<p><a href="#">support@docintact.com</a> </p>'+
                        '</div>'+
                   '</td>'+
                '</tr>'+
            '</table>'+
        '</td>'+
        '<td align="center" valign="top" class="" width="50" style="width: 50px;"> &nbsp;</td>'+
    '</tr>'+
    '<tr>'+
        '<td colspan="3" height="50" align="center" valign="middle" class="footer-text"'+
            'style="font-size: 14px;font-family: " Poppins", sans-serif;color: #A2A2A3;font-style: italic;">'+
            '<div class="round-brd"'+
                'style="display: inline-block;font-style: normal;border: 1px solid #A2A2A3;border-radius: 50%;width: 18px;height: 18px;">'+
                '<p style="font-size: 12px;margin: 0 !important;line-height: 1.5;color:#000 !important;">C</p>'+
            '</div>&nbsp;<p style="display:inline-block;color:#000 !important;">Doc Intact 2019-2020</p>'+
        '</td>'+
    '</tr>'+
'</table>'

transporter.sendMail(HelperOptions, function(err, info) {
                    if (err) { console.log("error occured when sending mail" + err) }
                    if (!err) {
                        console.log("Email sent")
                        // res.json({ "res": "success" })
                        res.json(users)
                    }
                });
               
            });
        });
    } else {
        User.ll({ _id: decryptid }, function(err, user) {
            if (user) {
                user.active = 'true';
                if (user.expire_at <= Date.now() || user.status == false) res.json({ "linkstatus": "Link Expired" });
                else {
                    user.updated_at = Date.now();
                    user.save(function(err, users) {
                        if (err) return validationError(res, err);
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            secure: false,
                            port: 25, // use SSL
                            auth: {
                                user: config.email,
                                pass: config.password
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                        var HelperOptions = {
        
                            from: '"DOCINTACT" '+config.email,
                            to: user.email,
                            subject: "Welcome to DocIntact",
                        };
                        if(user.name) user.name = user.name
                        else if(user.companyname) user.name = user.companyname
                        HelperOptions.html = '<table class="main" width="100%" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#F4F7FA"'+
                                             'style="border: 1px solid #DADADA;max-width: 680px;">'+            
                                             '<tr>'+
                                              '<td colspan="3" height="112" align="center" valign="middle"> <a href="'+config.frontendUrl+'">'+
                                              '<img src='+'"'+config.frontendUrl+'/images/Group2244.png" alt=""></a></td>'+
                                              '</tr>'+
                                              '<tr>'+
                                               '<td align="center" valign="top" class="" width="50" style="width: 50px;"> &nbsp;</td>'+
        '<td align="center" valign="top" class="" width="50" height="780"'+
            'style="border-radius:6px; background: #fff; width: 640px;  padding-left: 20px; padding-right:20px;">'+
            '<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-header"'+
                            'style="color: #000000;font-size: 24px;text-align: center;margin-top: 20px !important;margin-bottom: 30px !important;">'+
                            '<p style=" margin: 0;line-height: 1.5;color:#000 !important;">Welcome !</p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="start-content"'+
                            'style="padding-left:34px; padding-right:34px;color: #000000;font-size: 16px;text-align: left;font-family: "'+
                            'Poppins", sans-serif;">'+
                            '<p style="margin: 0;line-height: 1.5;color:#000 !important;"> Mr/Ms '+user.name+' ,Good Day</p>'+
                            '<p class="p-mrg"'+
                                'style="margin-bottom: 30px !important;margin-top: 20px !important;margin: 0 !important;line-height: 1.5;color:#000 !important;">'+
                                'Thank you for registering with DOC INTACT. Your account has been activated successfully.'+
                                'Please Sign in to <a href="'+config.frontendUrl+'">www.docintact.com</a> </p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="30">&nbsp;'+
                        '<hr style="border: 0.5px solid #d5d5d5;">'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="center" valign="top">'+
                        '<div class="row-sub">'+
                            '<p style="color: #000 !important;font-size:20px;text-align: center;font-family:Poppins,'+
                                'sans-serif;margin: 0 !important;line-height: 1.5;"><b style="color:#000;">Our Beloved'+
                                    'Features</b></p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%; " width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:34px;">'+
                                        '<div><img src='+'"'+config.frontendUrl+'/assets/images/icon1.png">'+
                                        '</div>'+
                                    '</td>'+
                                    '<td style="padding-right:59px;">'+
                                        '<div class="row-subr">'+
                                            '<p style="color: #000 !important;font-size:17px;font-family:Poppins,'+
                                                'sans-serif;text-align: left;padding-left: 36px;margin-bottom: 10px'+
                                                '!important;margin: 0 !important;line-height: 1.5;"><b'+
                                                    'style="color:#000 !important;">Access Your Files Anywhere</b></p>'+
                                        '</div>'+
                                        '<div class="row-parar" style="padding-right: 25px;">'+
                                            '<p style="color: #000 !important;font-size:15px;font-family:Poppins,'+
                                                'sans-serif;padding-left: 36px;margin: 0;line-height: 1.5;">Our Doc'+
                                                'Intact provides the access to your files from anywhere, thus avoiding'+
                                                'any professional delays or work setbacks.</p>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
               '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%;" width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:59px;">'+
                                       '<div class="text1">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom: 10px'+
                                                    '!important;"><b>Upload your documents </b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color: #000000;font-size:15px;font-family:Poppins,'+
                                                    'sans-serif;text-align: left;padding-right: 36px;line-height:1.5;">Instantly Upload'+
                                                    'the document and send it for any required actions, it can be a'+
                                                    'signature, review and approval or all of them.</p>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="image1"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/docupld.png">'+
                                        '</div>'+
                                    '</td>'+
                                    '<td style="padding-right:34px;">'+
                                        '<div class="image2" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/docupld.png"></div>'+
                                        '<div class="text2"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<div class="row-subl">'+
                                                '<p><b>Share documents securely/b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p>Documents are end –to-end encrypted and can be shared via email with'+
                                                    'geographical location restriction.</p>'+
                                           '</div>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%;" width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:34px;">'+
                                        '<div><img src='+'"'+config.frontendUrl+'/assets/images/tempmng.png"></div>'+
                                    '</td>'+
                                    '<td style="padding-right:59px;">'+
                                        '<div class="row-subr">'+
                                            '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                'sans-serif;text-align: left;padding-left: 36px;margin-bottom: 10px;">'+
                                                '<b>Template management</b></p>'+
                                        '</div>'+
                                        '<div class="row-parar" style="padding-right: 25px;">'+
                                            '<p style="color: #000000;font-size: 15px;font-family:Poppins,'+
                                                'sans-serif;padding-left: 36px;line-height:1.5;">Doc Intact supports Template Management'+
                                                'system to simplify the sharing process while sending documents to the'+
                                                'small group or individuals. You can use same template without making any'+
                                                'changes or can customize the template as per the requirement.</p>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%; margin-bottom:30px;" width="100%" border="0" align="left"'+
                            'cellpadding="0" cellspacing="0" class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:59px;">'+
                                        '<div class="text1" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom:'+
                                                    '10px"><b>Heat maps</b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color: #000000;font-size:15px;font-family:Poppins,'+
                                                    'sans-serif;text-align: left;padding-right: 36px;color:#000'+
                                                    '!important;line-height:1.5;">Heatmap tracks out the shared documents, where user pay'+
                                                    'attention and analyze how long and what pages he has gone through.'+
                                                '</p>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="image1"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/heatmap.png"> </div>'+
                                    '</td>'+
                                    '<td style="padding-right:34px;">'+
                                        '<div class="image2" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/heatmap.png"></div>'+
                                        '<div class="text2"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size: 16px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom:'+
                                                    '10px;"><b style="color:#000 !important;">Id Based User'+
                                                        'Identification</b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color:#000 !important;">Lorem Ipsum is simply dummy text of'+
                                                    'the printing and typesetting industry specimen book.</p>'+
                                            '</div>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                           '</tbody>'+
                       '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="20">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-btn" style="text-align:center;"> <a'+
                                'style="    color: #ffffff;background: #0187D1;border-radius: 4px;-moz-border-radius: 4px;-webkit-border-radius: 4px;border-width: 0;padding: 16px 117px;font-size: 16px;font-family: "'+
                                'Poppins", sans-serif;font-weight: 600;text-decoration: none;"> Share Documents Now'+
                                '</button> </a>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-parac" style="text-align:center;">'+
                            '<p style="color:#000 !important;"> If you have any queries, please write to us at </p>'+
                            '<p><a href="#">support@docintact.com</a> </p>'+
                        '</div>'+
                   '</td>'+
                '</tr>'+
            '</table>'+
        '</td>'+
        '<td align="center" valign="top" class="" width="50" style="width: 50px;"> &nbsp;</td>'+
    '</tr>'+
    '<tr>'+
        '<td colspan="3" height="50" align="center" valign="middle" class="footer-text"'+
            'style="font-size: 14px;font-family: " Poppins", sans-serif;color: #A2A2A3;font-style: italic;">'+
            '<div class="round-brd"'+
                'style="display: inline-block;font-style: normal;border: 1px solid #A2A2A3;border-radius: 50%;width: 18px;height: 18px;">'+
                '<p style="font-size: 12px;margin: 0 !important;line-height: 1.5;color:#000 !important;">C</p>'+
            '</div>&nbsp;<p style="display:inline-block;color:#000 !important;">Doc Intact 2019-2020</p>'+
        '</td>'+
    '</tr>'+
'</table>'

transporter.sendMail(HelperOptions, function(err, info) {
                            if (err) { console.log("error occured when sending mail" + err) }
                            if (!err) {
                                console.log("Email sent")
                                // res.json({ "res": "success" })
                                res.json({ "linkstatus": "Success" });
                            }
                        });
                       
                    });
                }
            } else res.json({ "linkstatus": "Invalid" });
        });
    }
}


/**
 * @api {get} /checkstatus/:id    :  Check Mail link status
 * @apiName checkStatus
 * @apiGroup User
 * @apiParam  link Id
 * @apiSuccess {Json} User
 * @apiError  Link expired
 */
exports.checkStatus = function(req, res) {
    var decryptid = decrypt(key, req.params.id);
    User.findOne({ _id: decryptid }).exec(function(err, users) {
        if (err) return res.status(500).send(err);
        else {
            if (users && users.expire_at <= Date.now()) {
                res.json({ "linkstatus": "Link Expired" });
            } else {
                users = JSON.parse(JSON.stringify(users))
                users.encryptmail = encrypt(key, users.email)
                return res.status(200).json(users)
            }
        }
    });
};



/**
 * @api {post} /  Create  new User  Individual / organisation
 * @apiName create
 * @apiGroup User
 * @apiParam Json
 * @apiSuccess {Json} User
 * @apiError string 
 */
exports.create = function(req, res, next) {
    req.body.active = false;
    if (req.body.linkSignup) {
        req.body.email = decrypt(key, req.body.email);
        req.body.active = true;
        req.body.password = req.body.cPassword

    }
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    if (!req.body.new) newUser.new = 'true'
    newUser.created_at = moment().format('ddd, MMM D, YYYY hh:mm:ss A');
    newUser.expire_at = moment().add(1, 'day').format('ddd, MMM D, YYYY hh:mm:ss A');
    newUser.save(function(err, user) {
        if (err) return validationError(res, err);

        if (!req.body.linkSignup) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25, // use SSL
                auth: {
                    user: config.email,
                    pass: config.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            var activationkey = encrypt(key, user.email.toString());
            var HelperOptions = {

                from: '"DOCINTACT" '+config.email,
                to: user.email,
                subject: "Docintact Account Confirmation",

            };

            HelperOptions.html = '<div class="background" style= "width: 680px; height: 795px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
                '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
                '<div class="innrbackground"  style=" width: 580px; height: 535px; background-color: #FFF; text-align: center; margin: auto; margin-top: 2rem;">' +

                '<img src ="https://staging.docintact.com/assets/images/verifyemail.png" style="margin-top: 2rem;" >' +
                '<h2 style="margin-top: 2rem;  font-size:22px; font-weight: 600">Verify Your Email Address</h2>' +
                '<hr  class="mt-0 hr-w hr1_bg" style="width: 85%;     margin-top: 24px !important;">' +

                '<p style="font-size:16px; margin: 65px; margin-top: 26px; margin-bottom: 18px; font-weight: 500;">In order to start using your Doc Intact account, you need to' +
                'verify your email address.</p>' +
                '<h5>Click the Below Button to Verify Your Email Address</h5>' +
                '<span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary" href="' + config.frontendUrl + "/signupemailconfirm/" + activationkey + '"  style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Verify Email Address </a></span>' +
                '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +

                '<p style="font-size:16px; margin: 65px; margin-top: 14px; margin-bottom: 18px; color: #A2A2A3;">if you did not sign up for this account you can ignore this email and the  ' +
                'account will be deleted.</p>' +

                '</div>' +

                '<p style="font-size: 14px;color: #A2A2A3; margin-top: 50px;"><img src ="https://staging.docintact.com/assets/images/careof.png">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
                '</div>'

            transporter.sendMail(HelperOptions, function(err, info) {
                if (err) { console.log("error occured when sending mail" + err) } else { console.log("link sent" + id1); }
            });

        }

        var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
        return res.status(200).send({ token: token, email: user.email, name: user.name, role: user.role, type: user.type, new: user.new });
    });
};

/**
 * @api {post} /checkusers1   :  Check user individual / organisation user status when click on mail link
 * @apiName checkusers1
 * @apiGroup User
 * @apiParam Json
 * @apiSuccess {Json} User 
 * @apiError string 
 */

exports.checkusers1 = function(req, res) {
    if (req.body.type == 'email') var q = { email: req.body.value };
    if (req.body.type == 'mobile') var q = { mobilenumber: req.body.value };
    if (req.body.type == 'slug') var q = { slug: req.body.value };
    if (req.body.type == 'activeEmail') var q = { email: decrypt(key, req.body.value) };
    User.findOne(q, function(err, user) {
        console.log(user,"+++++++++++")
        if (err) return next(err);
        if (!user) return res.status(200).send({ "data": false });
        else return res.status(200).json({ "data": true, user });
    });

}
/**
 * @api {post} /checkusers :  Check user 
 * @apiName checkusers
 * @apiGroup User
 * @apiParam Json
 * @apiSuccess {Json} User 
 * @apiError string  data : false
 */
exports.checkusers = function(req, res) {
        if (req.body.type == 'email') var q = { email: req.body.value };
        if (req.body.type == 'mobile') var q = { mobilenumber: req.body.value };
        if (req.body.type == 'slug') var q = { slug: req.body.value };
        if (req.body.type == 'activeEmail') var q = { email: decrypt(key, req.body.value) };
        User.findOne(q, function(err, user) {
            if (err) return next(err);
            if (!user) return res.status(200).send({ "data": false });
            else return res.status(200).send({ "data": true, user });
        });

    }
/**
 * @api {post} /userecryptDatas   :  Decrypt all the data when user signin / signup from google/facebook/twitter
 * @apiName userecryptDatas
 * @apiGroup User
 * @apiParam Json
 * @apiSuccess {Json} User 
 */
exports.userecryptDatas = function(req, res) {
        var user = {}
        if (req.body) {
            if (req.body.name) user.name = decrypt(key, req.body.name)
            if (req.body.email) user.email = decrypt(key, req.body.email)
            if (req.body.new) user.new = req.body.new
            if (req.body.role) user.role = decrypt(key, req.body.role)
            if (req.body.type) user.type = decrypt(key, req.body.type)
            if (req.body.provider) user.provider = decrypt(key, req.body.provider)
            if (req.body.twitter_id) user.twitter_id = decrypt(key, req.body.twitter_id)
            if (req.body.facebook_id) user.facebook_id = decrypt(key, req.body.facebook_id)

            User.findOne({ email: user.email }, function(err, userdata) {

               if(userdata) return res.status(200).send(userdata);
               else if(!userdata) return res.status(200).send(user);
            })
        }
    }
/**
 * @api {get} /:id       :   get Profile 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName show
 * @apiGroup User
 * @apiParam user id
 * @apiSuccess {Json} user
 * @apiError 401-Unauthorized.
 */
exports.show = function(req, res, next) {
    var userId = req.params.id;
    User.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user.profile);
    });
};

/**
 * @api {Post} /forgotPassEmail :  Forgot Password Sending OTP to the Email
 * @apiName forgotPassEmail
 * @apiGroup User
 * @apiSuccess {String} success
 * @apiError 200-notFound.
 */ 
exports.forgotPassEmail = function(req, res) {
    if (req.headers && req.headers.ipaddress) {
        req.body.IpAddress = req.headers.ipaddress
    } else {
        req.body.IpAddress = req.body.IpAddress
    }
    const tempsess = req.session
    const email = req.body.email;
    User.findOne({ email: email }, function(err, user) {
        if (!user) return res.status(200).json({ "res": "notFound" });
        tempsess.email = email;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25, // use SSL
            auth: {
                user: config.email,
                pass: config.password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        var gen = rn.generator({
            min: 100000,
            max: 999999,
            integer: true
        })
        var otpttl = moment().add(120, 'seconds').format('ddd, MMM D, YYYY hh:mm:ss A')
        tempsess.count = 0;
        tempsess.registerotpttl = otpttl;
        const id1 = gen();
        tempsess.otpforemail = id1;
        var data = {};
        data.IP = req.body.IpAddress;
        data.otp = id1;
        data.email = email;
        data.expire_at = otpttl
        OtpModel.create(data);
        var HelperOptions = {
            from: '"DOCINTACT" '+config.email,
            to: email,
            subject: " Docintact Password Reset OTP ",

        };
        HelperOptions.html = '<div class="background" style= "width: 680px; height: 718px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
            '<h2 style="padding-top: 1rem;"> Password Reset OTP</h2>' +
            '<div class="innrbackground"  style=" width: 580px; height: 535px; background-color: #FFF; text-align: center; margin: auto; margin-top: 2rem;">' +

            '<img src ="https://staging.docintact.com/assets/images/otp.png" style="margin-top: 2rem;" >' +
            '<h2 style="margin-top: 2rem;  font-size:18px; font-weight: 500">Enter the OTP to Reset your Docintact Account  Password</h2>' +
            '<p>' + email + '</p>' +
            '<p style="font-size:1.5rem; margin: 65px; margin-top: 17px; margin-bottom: 18px; font-weight: 400;background-color:#d8d0d0;">Your One Time Password is  ' + id1 + '</p>' +
            '<h6 style="font-size:1rem;"> Do not share this OTP  to anyone for security reasons</h6>' +
            '<p style="font-size:13px; margin: 65px; margin-top: 14px; margin-bottom: 18px; color: #000; margin-top:2rem"><span style="color:#EA5455;font-size: 17px;">Note:</span>This OTP is valid for the 2 Mins only. If you did not make this request please' +
            '  write at support@docintact.com  </p>' +

            '</div>' +

            '<p style="font-size: 14px;color: #A2A2A3; margin-top: 50px;"><img src ="https://staging.docintact.com/assets/images/careof.png">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
            '</div>'
        transporter.sendMail(HelperOptions, function(err, info) {

            if (err) {
                res.json({ "res": "Server error" })
            } else {
                res.json({ "res": "success" })

            }
        });



    });

};

/**
 * @api {Post} /verifyotp  :  Verify OTP when user click on  Forgot Password
 * @apiName otpCheck
 * @apiGroup User
 * @apiSuccess {String} success
 * @apiError  OTPFAILED /block/OTP-expired
 * @apiError 422-Unable to Process 
 */ 
exports.otpCheck = function(req, res) {

    var timestamp = moment().format('ddd, MMM D, YYYY hh:mm:ss A')
    const otp = req.body.otp;

    OtpModel.findOne({ IP: req.body.IP }).sort({ _id: -1 }).exec(function(err, otpDoc) {
        if (new Date(otpDoc.expire_at) >= new Date(timestamp)) {

            if (otpDoc.otp == otp) {
                res.status(200).json({ "res": "success" })
            } else {
                var count = ++otpDoc.expire_count;
                otpDoc.expire_count = count;
                otpDoc.updated_at = Date.now();
                otpDoc.save(function(err) {
                    if (err) return validationError(res, err);

                });

                if (count >= 4) {
                    User.findOne({ email: otpDoc.email }, function(err, user) {
                        user.status = false;
                        user.updated_at = Date.now();
                        user.save(function(err) {
                            if (err) return validationError(res, err);
                            res.status(200).json({ "res": "block" })
                        });
                    });
                } else {
                    res.status(200).json({ "res": "OTPFAILED" })
                }
            }
        } else {
            res.status(200).json({ "res": "OTP-expired" });
        }
    });
};
/**
 * @api {Post} /verifyemail1  :  Verify OTP when user click on  Forgot Password
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. * 
 * @apiName mailer1
 * @apiGroup User
 * @apiSuccess {String} success
 * @apiError  {String}   failed
 */ 
exports.mailer1 = function(req, res) {
    const tempsess = req.session
    const email = req.user.email;
    tempsess.email = email;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, // use SSL
        auth: {
            user: config.email,
            pass: config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var gen = rn.generator({
        min: 100000,
        max: 999999,
        integer: true
    })
    var otpttl = moment().add(120, 'seconds').format('ddd, MMM D, YYYY hh:mm:ss A')
    tempsess.count = 0;
    tempsess.registerotpttl = otpttl;
    const id1 = gen();
    tempsess.otpforemail = id1;
    var data = {};
    data.IP = req.body.IP;
    data.otp = id1;
    data.email = email;
    data.expire_at = otpttl;
    OtpModel.create(data);

    var HelperOptions = {
        from: '"DOCINTACT" '+config.email,
        to: email,
        subject: "Email verification for OTP",
        text: "OTP for verifying your E-mail id is " + id1,

    };
    transporter.sendMail(HelperOptions, function(err, info) {

        if (err) {
            res.json({ "res": "failed" })
        } else {
            res.json({ "res": "success" })

        }
    });
};



/**
 * @api {Post} /:id      :    delete User from DB (admin)
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName destroy
 * @apiGroup User
 * @apiSuccess {String} No Content
 * @apiError  500 err
 */ 
exports.destroy = function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.status(500).send(err);
        return res.status(204).send('No Content');
    });
};

/**
 * @api {Put} /change/password        :   Change password
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName changePassword
 * @apiGroup User
 * @apiSuccess {String} success
 * @apiError  Old password mismatch / Forbidden
 * @apiError 500-InternalServerError SERVER error.
 */ 
exports.changePassword = function(req, res, next) {
    if (req.headers && req.headers.ipaddress) {
        req.body.IpAddress = req.headers.ipaddress
    } else {
        req.body.IpAddress = req.body.IpAddress
    }
    var userId = req.user._id;
    var oldPass = req.body.oldpass;
    const tempsess = req.session;
    var newPass = req.body.pwd3;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, // use SSL
        auth: {
            user: config.email,
            pass: config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        // if(req.body._id) { delete req.body._id; }

        User.find({ email: user.email }, function(err, dummy) {

            if (err) { return handleError(res, err); }
            const mysalt = dummy[0].salt;
            const mysalt1 = mysalt.toString('base64');
            var salt1 = new Buffer(mysalt1, 'base64');
            var pass = crypto.pbkdf2Sync(oldPass, salt1, 10000, 64, "sha512").toString('base64');
            if (dummy[0]) {
                if (dummy[0].hashedPassword == pass) {
                    User.findById(userId, function(err, user) {
                        var userdata = user
                        if (userdata.name) var name = userdata.name
                        if (userdata.companyname) var name = userdata.companyname
                        userdata.IpAddress = req.body.IpAddress;
                        userdata.browser = req.headers["user-agent"]
                        const DeviceDetector = require("device-detector-js");
                        const deviceDetector = new DeviceDetector();
                        const device = deviceDetector.parse(userdata.browser);
                        if (device.client.name && device.client.version) {
                            var browserinfo = device.client.name + ',Version' + device.client.version;
                        } else if (device.client.name && device.client.version) {
                            var browserinfo = device.client.name;

                        }
                        if (device.os) {
                            if (device.os.name && device.os.platform) {
                                var osinfo = device.os.name + ',Platform' + device.os.platform;
                            } else if (device.os.name && device.os.version && device.device.brand) {
                                var osinfo = device.os.name + ',Version' + device.os.version + '' + device.device.brand + '' + device.device.model;
                            }

                        }
                        //  userdata.deviceName = os.platform();
                        if (user.authenticate(oldPass)) {
                            user.password = newPass;
                            user.updated_at = Date.now();
                            user.save(function(err) {
                                if (err) return validationError(res, err);
                                else {

                                    var HelperOptions = {
                                        from: '"DOCINTACT" '+config.email,
                                        to: user.email,
                                        subject: "Docintact Password Reset Successfully ",
                                        // text: "link to accept the invitation:" + config.frontendUrl + "/signupemployee/" + activationkey
                                    };


                                    HelperOptions.html = '<div class="background" style= "width: 680px; height: 815px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
                                        '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
                                        '<div class="innrbackground"  style=" width: 580px; height: 679px; background-color: #FFF; text-align: center; margin: auto;">' +
                                        '<a href="#"><img src="https://staging.docintact.com/assets/images/passwordreset.png"></a>' +
                                        '<h2 style="margin-top: 0.9rem;  font-size:21px; font-weight: 500;color: #4CA2D1;margin-left: -122px;" >Hi,' + name + '</h2>' +
                                        '<ul style="list-style:none;text-align: left;margin-left: 77px;">' +
                                        '<li style="padding-bottom:10px;">You`ve successfully changed your DocIntact password.</li>' +
                                        '<li style="padding-top:5px;padding-bottom:10px;">The DocIntact Team</li>' +
                                        '<li>Thanks for using DocIntact !</li>' +
                                        '</ul>' +
                                        '<h2 style="margin-top: 0.9rem;  font-size:21px; font-weight: 500;color: #4CA2D1;margin-left: -21px;">When and where this happened:</h2>' +
                                        '<ul style="list-style:none;text-align:left;margin-left:78px;padding-inline-start: 0;">' +
                                        '<li style="padding-bottom:10px;">Date:&nbsp;&nbsp;' + moment(Date.now()).utcOffset(330).format('lll') + '</li>' +
                                        '<li style="padding-bottom:10px;">IP:&nbsp;&nbsp;' + userdata.IpAddress + '</li>' +
                                        '<li style="padding-bottom:10px;">Browser:&nbsp;&nbsp;' + browserinfo + '</li>' +
                                        '<li style="padding-bottom:10px;">OS:&nbsp;&nbsp;' + osinfo + '</li>' +
                                        '</ul>' +
                                        '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +
                                        '<p style="font-size:16px; margin: 65px; margin-top:4px; margin-bottom: 18px; color: #A2A2A3;">If it is not done by You? Make sure to change your password right away.</p>' +
                                        '</div>' +
                                        '<p style="font-size: 14px;color: #A2A2A3;"><img src ="https://staging.docintact.com/assets/images/careof.png" style="vertical-align: text-top;">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
                                        '</div>'



                                    transporter.sendMail(HelperOptions, function(err, info) {
                                        if (err) { console.log(err) } else { console.log("sucess") }
                                    });
                                    return res.json({ result: "success" });
                                }


                            });
                        } else {
                            res.status(403).send('Forbidden');
                        }
                    });
                } else {
                    return res.json({ result: "Old password mismatch" });
                }
            }
        })
    });
}


/**
 * @api {Post} /oldPasswordChecking  :  check old password when user user try to change password
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName oldPasswordChecking
 * @apiGroup User
 * @apiSuccess {String} matched
 * @apiError  {String}  Old password mismatch
 */ 

exports.oldPasswordChecking = function(req, res, next) {
        var userId = req.user._id;
        if (req.body.type == 'password') var oldPassword = { password: req.body.value };
        User.findById(userId, function(err, user) {
            if (user.authenticate(oldPassword.password)) {
                // user.password = newPassword;

                if (err) return validationError(res, err);
                return res.json({ "result": "matched" });
                //});
            } else {
                return res.json({ "result": "Old password mismatch" });
            }
        });
    }
    
    // Change password in Forgot password

/**
 * @api {Post} /changeForgotPass   :  Forgot Password Sending OTP to the Email
 * @apiName forgotPassChange
 * @apiGroup User
 * @apiSuccess {String} success
 * @apiError  {String} Unauthorized
 */ 
exports.forgotPassChange = function(req, res) {

    if (req.headers && req.headers.ipaddress) {
        req.body.IpAddress = req.headers.ipaddress
    } else {
        req.body.IpAddress = req.body.IpAddress
    }
    var email = req.body.email;
    var newPass = req.body.newPass;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, // use SSL
        auth: {
            user: config.email,
            pass: config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    User.findOne({ email: email }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        user.password = newPass;
        var userdata = user;
        if (userdata.name) var name = userdata.name
        if (userdata.companyname) var name = userdata.companyname
        userdata.IpAddress = req.body.IpAddress;
        userdata.browser = req.headers["user-agent"]
        user.updated_at = Date.now();
        const DeviceDetector = require("device-detector-js");
        const deviceDetector = new DeviceDetector();
        const device = deviceDetector.parse(userdata.browser);
        if (device.client.name && device.client.version) {
            var browserinfo = device.client.name + ',Version' + device.client.version;
        } else if (device.client.name && device.client.version) {
            var browserinfo = device.client.name;

        }
        if (device.os) {
            if (device.os.name && device.os.platform) {
                var osinfo = device.os.name + ',Platform' + device.os.platform;
            } else if (device.os.name && device.os.version && device.device.brand) {
                var osinfo = device.os.name + ',Version' + device.os.version + '' + device.device.brand + '' + device.device.model;
            }

        }
        user.save(function(err) {
            if (err)

            {
                return validationError(res, err);
            } else {
                var HelperOptions = {
                    from: '"DOCINTACT" '+config.email,
                    to: req.body.email,
                    subject: "Docintact Password Reset Successfully ",
                };

                HelperOptions.html = '<div  style= "width: 680px; height: 815px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
                    '<div style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
                    '<div  style=" width: 580px; height: 679px; background-color: #FFF; text-align: center; margin: auto;">' +
                    '<a href="#"><img src="https://staging.docintact.com/assets/images/passwordreset.png"></a>' +
                    '<h2 style="margin-top: 0.9rem;  font-size:21px; font-weight: 500;color: #4CA2D1;margin-left: -122px;" >Hi,' + name + '</h2>' +
                    '<ul style="list-style:none;text-align: left;margin-left: 77px;">' +
                    '<li style="padding-bottom:10px;">You`ve successfully changed your DocIntact password.</li>' +
                    '<li style="padding-top:5px;padding-bottom:10px;">The DocIntact Team</li>' +
                    '<li>Thanks for using DocIntact !</li>' +
                    '</ul>' +
                    '<h2 style="margin-top: 0.9rem;  font-size:22px; font-weight: 500;color: #4CA2D1;margin-left: -21px;">When and where this happened:</h2>' +
                    '<ul style="list-style:none;text-align:left;margin-left:78px;padding-inline-start: 0;">' +
                    '<li style="padding-bottom:10px;">Date:&nbsp;&nbsp;' + moment(Date.now()).utcOffset(330).format('lll') + '</li>' +
                    '<li style="padding-bottom:10px;">IP:&nbsp;&nbsp;' + userdata.IpAddress + '</li>' +
                    '<li style="padding-bottom:10px;">Browser:&nbsp;&nbsp;' + browserinfo + '</li>' +
                    '<li style="padding-bottom:10px;">OS:&nbsp;&nbsp;' + osinfo + '</li>' +
                    '</ul>' +
                    '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +
                    '<p style="font-size:16px; margin: 65px; margin-top: 4px; margin-bottom: 18px; color: #A2A2A3;">If it is not done by You? Make sure to change your password right away.</p>' +
                    '</div>' +
                    '<p style="font-size: 14px;color: #A2A2A3;"><img src ="https://staging.docintact.com/assets/images/careof.png" style="vertical-align: text-top;">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
                    '</div>'



                transporter.sendMail(HelperOptions, function(err, info) {
                    if (err) { console.log(err) } else { console.log("sucess") }
                });
                res.status(200).json({ res: "success" });
            }


        });

    });
}


//=================================================================================================

exports.checkUser = function(req, res) {
    if (req.body.type == 'email') var q = { email: req.body.value };
    if (req.body.type == 'mobile') var q = { mobilenumber: req.body.value };
    User.findOne(q, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(200).send({ "data": false });
        else return res.status(200).send({ "data": true });
    });

}


/**
 * @api {get} /me    :   get Profile 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName me
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError 401-Unauthorized.
 */
exports.me = function(req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId,
        active: true
    }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user);
    });
};
/**
 * @api {Post} /addEmployee  : Add new  Employee to particular Department
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName addEmployee
 * @apiGroup User
 * @apiSuccess {String} success
 * @apiError {String} error
 */
exports.addEmployee = function(req, res) {
    req.body.name = req.body.fname + " " + req.body.lname
    req.body.password = "AjXrffhgUgfdfgfDFRVghvshhbkbjvbjdh"
    req.body.type = "employee"
    req.body.status = true;
    req.body.active = false,
        req.body.organizationid = req.user.id;
    req.body.expire_at = moment().add(2, 'days').format('ddd, MMM D, YYYY hh:mm:ss A');
    // user.updated_at = Date.now();
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, // use SSL
        auth: {
            user: config.email,
            pass: config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var expire_at = moment().add(2, 'days').format('ddd, MMM D, YYYY hh:mm:ss A');
    var created_at = moment().format('ddd, MMM D, YYYY hh:mm:ss A');
    var linkdata = {
        created_at: created_at,
        expire_at: expire_at,
        email: req.body.email
    }
    Links.create(linkdata, function(err, link) {
        User.create(req.body, function(err, user) {
            if (err) {
                console.log(err)
                return validationError(res, err);
            } else {
                var activationkey = encrypt(key, user._id.toString());
                var HelperOptions = {
                    from: '"DOCINTACT" '+config.email,
                    to: req.body.email,
                    subject: "Docintact Account  Confirmation ",
                    // text: "link to accept the invitation:" + config.frontendUrl + "/signupemployee/" + activationkey
                };
                console.log(config.frontendUrl + "/signupemployee/" + activationkey)
                HelperOptions.html = '<div class="background" style= "width: 680px; height: 795px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
                    '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
                    '<div class="innrbackground"  style=" width: 580px; height: 535px; background-color: #FFF; text-align: center; margin: auto; margin-top: 2rem;">' +

                    '<img src ="https://staging.docintact.com/assets/images/verifyemail.png" style="margin-top: 2rem;" >' +
                    '<h2 style="margin-top: 2rem;  font-size:22px; font-weight: 600">Verify Your Email Address</h2>' +
                    '<hr  class="mt-0 hr-w hr1_bg" style="width: 85%;     margin-top: 24px !important;">' +

                    '<p style="font-size:16px; margin: 65px; margin-top: 26px; margin-bottom: 18px; font-weight: 500;">In order to start using your Doc Intact account, you need to' +
                    'Verify  your email address.</p>' +
                    '<h4> Click the Below   Button  to verify your email Address </h4>' +
                    '<span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary" href="' + config.frontendUrl + "/signupemployee/" + activationkey + '"  style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Verify Email Address </a></span>' +
                    '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +

                    '<p style="font-size:16px; margin: 65px; margin-top: 14px; margin-bottom: 18px; color: #A2A2A3;">if you did not sign up for this account you can ignore this email and the  ' +
                    'account will be deleted.</p>' +

                    '</div>' +

                    '<p style="font-size: 14px;color: #A2A2A3; margin-top: 50px;"><img src ="https://staging.docintact.com/assets/images/careof.png">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
                    '</div>'



                transporter.sendMail(HelperOptions, function(err, info) {
                    if (err) { res.json({ "res": "error" }) } else { res.json({ "res": "success" }) }
                });
            }
            res.json(user);


        });
    });


};

/**
 * @api {Post} /addemployeess     :    Add new  Employee to particular Department
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName addemployessfromexcel
 * @apiGroup User
 * @apiSuccess {Array} success
 * @apiError {String} Invalid excel format / Empty Data
 */
exports.addemployessfromexcel = async function(req, res) {
    var successdata = []
    var userexistdata = []
    var faileddata = []
  
    // excel sheet format 
    var rawdata = ['SNO',
        'FIRSTNAME',
        'LASTNAME',
        'EMAIL',
        'CONTACTNO',
        'GENDER',
        'DEPARTMENT'
    ]

    if (JSON.stringify(req.body[0]) == JSON.stringify(rawdata)) {
        if (req.body && req.body.length != 1) {
            var count = 0

            for (let data of req.body) {

                if (count != 0) {
                    var employeedata = {
                        name: data[1] + "" + data[2],
                        fname: data[1],
                        lname: data[2],
                        gender: data[5],
                        mobilenumber: data[4],
                        email: data[3],
                        password: '',
                        departmentname: data[6],
                        type: "employee",
                        active: false,
                        expire_at: moment().add(2, 'days').format('ddd, MMM D, YYYY hh:mm:ss A'),
                        status: true,
                    }
                }
                var name = /^[a-zA-Z]+$/
                var mailformat = /^([A-Za-z]|[0-9])[A-Za-z0-9.-]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})$/
                var mobilepat = /^\d{10}$/;
                if (employeedata && mailformat.test(String(employeedata.email).toLowerCase()) && name.test(String(employeedata.fname)) && name.test(String(employeedata.lname)) && ((String(employeedata.gender).toLowerCase() === 'f') || (String(employeedata.gender).toLowerCase() === 'male') || (String(employeedata.gender).toLowerCase() === 'm') || (String(employeedata.gender).toLowerCase() === 'female')) && mobilepat.test(employeedata.mobilenumber) && employeedata.departmentname) {
                    if ((String(employeedata.gender).toLowerCase() === 'f') || (String(employeedata.gender).toLowerCase() === 'female')) {
                        employeedata.gender = "Female"
                    }
                    if ((String(employeedata.gender).toLowerCase() === 'male') || (String(employeedata.gender).toLowerCase() === 'm')) {
                        employeedata.gender = "Male"
                    }
                    employeedata.password = "AjXrffhgUgfdfgfDFRVghvshhbkbjvbjdh"
                    employeedata.organizationid = req.user.id;
                    try {
                        let department = await Department.findOne({ $and: [{ deptname: String(employeedata.departmentname).toUpperCase() }, { organizationid: req.user._id }, { active: true }] }).populate('organizationid').populate('parentdepartmentid').exec()
                        let found = await User.findOne({ email: employeedata.email.toLowerCase() }).exec();
                        if (found != null) userexistdata.push(employeedata);
                        if (!found && department) {

                            if (employeedata && employeedata.departmentname) {
                                employeedata.department = department._id
                            }

                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                secure: false,
                                port: 25,
                                auth: {
                                    user: config.email,
                                    pass: config.password
                                },
                                tls: {
                                    rejectUnauthorized: false
                                }
                            });
                            var expire_at = moment().add(2, 'days').format('ddd, MMM D, YYYY hh:mm:ss A');
                            var created_at = moment().format('ddd, MMM D, YYYY hh:mm:ss A');
                            var linkdata = {
                                created_at: created_at,
                                expire_at: expire_at,
                                email: employeedata.email
                            }


                            let usercreate = await User.create(employeedata, async function(err, user) {
                                if (err) {
                                    console.log(err, "errorrrrr")

                                } else {

                                    var activationkey = encrypt(key, user._id.toString());
                                    var HelperOptions = {
                                        from: '"DOCINTACT" '+config.email,
                                        to: employeedata.email,
                                        subject: "Docintact Account  Confirmation ",
                                    };



                                    HelperOptions.html = '<div class="background" style= "width: 680px; height: 795px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
                                        '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
                                        '<div class="innrbackground"  style=" width: 580px; height: 535px; background-color: #FFF; text-align: center; margin: auto; margin-top: 2rem;">' +

                                        '<img src ="https://staging.docintact.com/assets/images/verifyemail.png" style="margin-top: 2rem;" >' +
                                        '<h2 style="margin-top: 2rem;  font-size:22px; font-weight: 600">Verify Your Email Address</h2>' +
                                        '<hr  class="mt-0 hr-w hr1_bg" style="width: 85%;     margin-top: 24px !important;">' +

                                        '<p style="font-size:16px; margin: 65px; margin-top: 26px; margin-bottom: 18px; font-weight: 500;">In order to start using your Doc Intact account, you need to' +
                                        'Verify  your email address.</p>' +
                                        '<h4> Click the Below   Button  to verify your email Address </h4>' +
                                        '<span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary" href="' + config.frontendUrl + "/signupemployee/" + activationkey + '"  style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Verify Email Address </a></span>' +
                                        '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +

                                        '<p style="font-size:16px; margin: 65px; margin-top: 14px; margin-bottom: 18px; color: #A2A2A3;">if you did not sign up for this account you can ignore this email and the  ' +
                                        'account will be deleted.</p>' +

                                        '</div>' +

                                        '<p style="font-size: 14px;color: #A2A2A3; margin-top: 50px;"><img src ="https://staging.docintact.com/assets/images/careof.png">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
                                        '</div>'




                                    let mailstatus = transporter.sendMail(HelperOptions, function(err, info) {
                                        if (err) { return err } else { return info }
                                    });
                                    console.log(mailstatus)
                                    return user


                                }
                            })
                            if (usercreate) successdata.push(usercreate)
                        } else if (!found && !department) {
                            faileddata.push(employeedata)
                        }

                    } catch (e) {}
                } else {
                    if (count != 0) faileddata.push(employeedata)
                }

                count++
            }
            res.json({ "success": successdata, "faileddata": faileddata, "userexistdata": userexistdata })
        } else {
            res.json({ "res": "Empty data" })
        }
    } else {
        res.json({ "res": "Invalid excel format" })
    }
};

/**
 * @api {Post} /getcountries   :  Get Country List  when user send link to Mobiles
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName countries
 * @apiGroup Countries
 * @apiSuccess {Array} countries
 * @apiError 500-InternalServerError SERVER error.
 */
exports.countries = function(req, res) {
        Countries.find({ name: { $regex: '^' + req.body.searchcountry, $options: 'i' } }).exec(function(err, countries) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(countries);
        })
    }

    /**
 * @api {Post} /contact    :    when user sending data for contact us
 * @apiName contact
 * @apiGroup User
 * @apiSuccess {Sring} Your message has been sent successfully
 * @apiError  200 A problem has been occurred while submitting your data
 */
exports.contact = function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, // use SSL
        auth: {
            user: config.email,
            pass: config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var HelperOptions = {
        from: '"DOCINTACT" '+config.email,
        to: '"DOCINTACT" '+config.email,
        subject: "Doc Intact ",
        text: "From:\n" + req.body.email + "\n" + "Message:\n\t" + req.body.message + "\n" + "Mobile Numbe:\n\t" + req.body.mnumber
    };
    transporter.sendMail(HelperOptions, function(err, info) {
        if (err) res.status(202).json({ "fail": "A problem has been occurred while submitting your data." });
        res.status(200).json({ "res": "Your message has been sent successfully" })
    });
};

/**
 * @api {get} /empdata   :  Get list of employees
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName employelist
 * @apiGroup User
 * @apiSuccess {Json} user
 * @apiError 500 err
 */
exports.employelist = function(req, res) {
    User.find({ $and: [{ organizationid: req.user.organizationid }, { active: true }] }).exec(function(err, users) {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).json(users);
    })
}


/**
 * @api {get} /empcount   :  Get list of employees
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName empcount
 * @apiGroup User
 * @apiSuccess {Json} users
 * @apiError 500 err
 */
exports.empcount = function(req, res) {
    User.find({ $and: [{ department: req.params.id }, { active: true }] }).exec(function(err, users) {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).json(users);
    })
}
/**
 * @api {get} /employeedetails   :  Get Employee Data
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName employeedetails
 * @apiGroup User
 * @apiSuccess {Json} users
 * @apiError 500 err
 */
exports.employeedetails = function(req, res) {
    User.find({ $and: [{ organizationid: req.user.id }, { type: 'employee' }], }).populate('department').sort({ created_at: -1 }).exec(function(err, users) {
        if (err) { return res.status(500).send(err); }
        return res.status(200).json(users);
    });
};
/**
 * @api {get} /searchEmployee  :  Filter Employess List 
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName searchEmployees
 * @apiGroup User
 * @apiSuccess {Array} users
 * @apiError 500 err
 */
exports.searchEmployees = function(req, res) {
    console.log(req.body.search)
    User.find({
        $and: [{
            $or: [{ fname: { $regex: req.body.search, $options: 'i' } }, { lname: { $regex: req.body.search, $options: 'i' } },
                { mobilenumber: { $regex: req.body.search, $options: 'i' } }, { email: { $regex: req.body.search, $options: 'i' } },
                { departmentname: { $regex: req.body.search, $options: 'i' } }
            ]
        }, { organizationid: req.user.id }, { status: true }]
    }).populate('department').exec(function(err, users) {
        if (err) { return res.status(500).send(err); }
        console.log(users)
        return res.status(200).json(users);
    });
};
/**
 * @api {get} /search/user    :  Search Employess based On Name
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName UsersSearch
 * @apiGroup User
 * @apiSuccess {Array} users
 * @apiError 500 err
 */
exports.UsersSearch = function(req, res) {
    console.log(req.body.search)
    User.find({ $or: [{ name: { $regex: req.body.search, $options: 'i' } }, { fname: { $regex: req.body.search, $options: 'i' } }] }).exec(function(err, users) {
        if (err) {
            console.log(err)
            return res.status(500).send(err);
        } else return res.status(200).json(users);
    });
};
 //  Not Used in web 
exports.employeelogin = function(req, res) {
    var decryptid = decrypt(key, req.body.id);

    //find the link
    Links.findOne({ _id: decryptid }, function(err, link) {
        if (err) { res.status(401).json({ "error": "error" }) }
        if (!link) res.status(400).json({ "msg": "Invalid Url" })
        console.log('sdfsfd');
        if (new Date(req.body.timestamp) > new Date(link.expire_at)) {

            res.status(400).json({ "msg": "Link expired" })
        } else {

            //if link exits find the user

            User.findOne({ email: link.email }, function(err, user) {
                if (err) return next(err);
                if (!user) return res.status(200).send({ "data": false });
                else return res.status(200).send(user);
            });
        }

    })


}

/**
 * @api {put} /updatenewuser   :  Update new variable when first time login when sign up
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName updatenewuser
 * @apiGroup User
 */

exports.updatenewuser = function(req, res) {
    if (req.body._id) { delete req.params.id; }
    User.findOne({ _id: req.user.id }, function(err, user) {
        user.new = false;
        user.save(function(err) {
            if (err) return validationError(res, err);
        });
    });

};

/**
 * @api {Post} /emailactivate    : Activate user through Mail Link
 * @apiName activateemail
 * @apiGroup User
 * @apiSuccess {Json} user
 * @apiError {String} Invalid /Link Expired"
 */
exports.activateemail = function(req, res) {
    var newpass = req.body.password;
    var decryptid = decrypt(key, req.body.id);
    if (newpass) {
        User.findOne({ email: decryptid }, '-salt -hashedPassword', function(err, user) {
            user.active = "true";
            user.new = 'true';
            user.password = newpass
            user.updated_at = Date.now();
            user.save(function(err, users) {
                if (err) return validationError(res, err);
                res.json(users)
            });
        });
    } else {
        User.findOne({ email: decryptid }, function(err, user) {
            if (user) {
                user.active = 'true';
                console.log(user.active)
                if (user.expire_at <= Date.now()) res.json({ "linkstatus": "Link Expired" });
                else {
                    user.updated_at = Date.now();
                    user.save(function(err, users) {
                        if (err) return validationError(res, err);
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            secure: false,
                            port: 25, // use SSL
                            auth: {
                                user: config.email,
                                pass: config.password
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                        var HelperOptions = {

                            from: '"DOCINTACT" '+config.email,
                            to: user.email,
                            subject: "Welcome to DocIntact",
                        };
                        if(user.name) user.name = user.name
                        else if(user.companyname) user.name = user.companyname

                        HelperOptions.html = '<table class="main" width="100%" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#F4F7FA"'+
                                             'style="border: 1px solid #DADADA;max-width: 680px;">'+            
                                             '<tr>'+
                                              '<td colspan="3" height="112" align="center" valign="middle"> <a href="'+config.frontendUrl+'">'+
                                              '<img src='+'"'+config.frontendUrl+'/images/Group2244.png" alt=""></a></td>'+
                                              '</tr>'+
                                              '<tr>'+
                                               '<td align="center" valign="top" class="" width="50" style="width: 50px;"> &nbsp;</td>'+
        '<td align="center" valign="top" class="" width="50" height="780"'+
            'style="border-radius:6px; background: #fff; width: 640px;  padding-left: 20px; padding-right:20px;">'+
            '<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-header"'+
                            'style="color: #000000;font-size: 24px;text-align: center;margin-top: 20px !important;margin-bottom: 30px !important;">'+
                            '<p style=" margin: 0;line-height: 1.5;color:#000 !important;">Welcome !</p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="start-content"'+
                            'style="padding-left:34px; padding-right:34px;color: #000000;font-size: 16px;text-align: left;font-family: "'+
                            'Poppins", sans-serif;">'+
                            '<p style="margin: 0;line-height: 1.5;color:#000 !important;"> Mr/Ms '+user.name+' ,Good Day</p>'+
                            '<p class="p-mrg"'+
                                'style="margin-bottom: 30px !important;margin-top: 20px !important;margin: 0 !important;line-height: 1.5;color:#000 !important;">'+
                                'Thank you for registering with DOC INTACT. Your account has been activated successfully.'+
                                'Please Sign in to <a href="'+config.frontendUrl+'">'+config.frontendUrl+'</a> </p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="30">&nbsp;'+
                        '<hr style="border: 0.5px solid #d5d5d5;">'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="center" valign="top">'+
                        '<div class="row-sub">'+
                            '<p style="color: #000 !important;font-size:20px;text-align: center;font-family:Poppins,'+
                                'sans-serif;margin: 0 !important;line-height: 1.5;"><b style="color:#000;">Our Beloved Features</b></p>'+
                        '</div>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%; " width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:34px;">'+
                                        '<div><img src='+'"'+config.frontendUrl+'/assets/images/icon1.png">'+
                                        '</div>'+
                                    '</td>'+
                                    '<td style="padding-right:59px;">'+
                                        '<div class="row-subr">'+
                                            '<p style="color: #000 !important;font-size:17px;font-family:Poppins,'+
                                                'sans-serif;text-align: left;padding-left: 36px;margin-bottom: 10px'+
                                                '!important;margin: 0 !important;line-height: 1.5;"><b'+
                                                    'style="color:#000 !important;">Access Your Files Anywhere</b></p>'+
                                        '</div>'+
                                        '<div class="row-parar" style="padding-right: 25px;">'+
                                            '<p style="color: #000 !important;font-size:15px;font-family:Poppins,'+
                                                'sans-serif;padding-left: 36px;margin: 0;line-height: 1.5;">Our Doc'+
                                                'Intact provides the access to your files from anywhere, thus avoiding'+
                                                '  any professional delays or work setbacks.</p>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
               '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%;" width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:59px;">'+
                                       '<div class="text1">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom: 10px'+
                                                    '!important;"><b>Upload your documents </b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color: #000000;font-size:15px;font-family:Poppins,'+
                                                    'sans-serif;text-align: left;padding-right: 36px;line-height:1.5;">Instantly Upload'+
                                                    '  the document and send it for any required actions, it can be a'+
                                                    '  signature, review and approval or all of them.</p>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="image1"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/docupld.png">'+
                                        '</div>'+
                                    '</td>'+
                                    '<td style="padding-right:34px;">'+
                                        '<div class="image2" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/docupld.png"></div>'+
                                        '<div class="text2"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<div class="row-subl">'+
                                                '<p><b>Share documents securely/b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p>Documents are end –to-end encrypted and can be shared via email with'+
                                                    '   geographical location restriction.</p>'+
                                           '</div>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%;" width="100%" border="0" align="left" cellpadding="0" cellspacing="0"'+
                            'class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:34px;">'+
                                        '<div><img src='+'"'+config.frontendUrl+'/assets/images/tempmng.png"></div>'+
                                    '</td>'+
                                    '<td style="padding-right:59px;">'+
                                        '<div class="row-subr">'+
                                            '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                'sans-serif;text-align: left;padding-left: 36px;margin-bottom: 10px;">'+
                                                '<b>Template management</b></p>'+
                                        '</div>'+
                                        '<div class="row-parar" style="padding-right: 25px;">'+
                                            '<p style="color: #000000;font-size: 15px;font-family:Poppins,'+
                                                'sans-serif;padding-left: 36px;line-height:1.5;">Doc Intact supports Template Management'+
                                                '  system to simplify the sharing process while sending documents to the'+
                                                '  small group or individuals. You can use same template without making any'+
                                                '  changes or can customize the template as per the requirement.</p>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<table style="width:100%; margin-bottom:30px;" width="100%" border="0" align="left"'+
                            'cellpadding="0" cellspacing="0" class="first-row">'+
                            '<tbody>'+
                                '<tr>'+
                                    '<td style="padding-left:59px;">'+
                                        '<div class="text1" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size:17px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom:'+
                                                    '10px"><b>Heat maps</b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color: #000000;font-size:15px;font-family:Poppins,'+
                                                    'sans-serif;text-align: left;padding-right: 36px;color:#000'+
                                                    '!important;line-height:1.5;">Heatmap tracks out the shared documents, where user pay'+
                                                    '  attention and analyze how long and what pages he has gone through.'+
                                                '</p>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="image1"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/heatmap.png"> </div>'+
                                    '</td>'+
                                    '<td style="padding-right:34px;">'+
                                        '<div class="image2" style="overflow: visible;float: none;visibility: visible;">'+
                                            '<img src='+'"'+config.frontendUrl+'/assets/images/heatmap.png"></div>'+
                                        '<div class="text2"'+
                                            'style="visibility: hidden;float: left;width: 0;height: 0;overflow: hidden;">'+
                                            '<div class="row-subl">'+
                                                '<p style="color: #000000;font-size: 16px;font-family:Poppins,'+
                                                    'sans-serif;text-align: right;padding-right: 36px;margin-bottom:'+
                                                    '10px;"><b style="color:#000 !important;">Id Based User'+
                                                        'Identification</b></p>'+
                                            '</div>'+
                                            '<div class="row-paral">'+
                                                '<p style="color:#000 !important;">Lorem Ipsum is simply dummy text of'+
                                                    'the printing and typesetting industry specimen book.</p>'+
                                            '</div>'+
                                        '</div>'+
                                    '</td>'+
                                '</tr>'+
                           '</tbody>'+
                       '</table>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="20">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                    '<span class="im" style="padding-left: 170px;">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary" href="' + config.frontendUrl + "/" +'"   style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank"> Share Documents Now  </a></span>'+
                    '</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top" height="40">&nbsp;</td>'+
                '</tr>'+
                '<tr>'+
                    '<td align="left" valign="top">'+
                        '<div class="row-parac" style="text-align:center;">'+
                            '<p style="color:#000 !important;"> If you have any queries, please write to us at </p>'+
                            '<p><a href="#">support@docintact.com</a> </p>'+
                        '</div>'+
                   '</td>'+
                '</tr>'+
            '</table>'+
        '</td>'+
        '<td align="center" valign="top" class="" width="50" style="width: 50px;"> &nbsp;</td>'+
    '</tr>'+
    '<tr>'+
        '<td colspan="3" height="50" align="center" valign="middle" class="footer-text"'+
            'style="font-size: 14px;font-family: " Poppins", sans-serif;color: #A2A2A3;font-style: italic;">'+
            '<div class="round-brd"'+
                'style="display: inline-block;font-style: normal;border: 1px solid #A2A2A3;border-radius: 50%;width: 18px;height: 18px;">'+
                '<p style="font-size: 12px;margin: 0 !important;line-height: 1.5;color:#000 !important;">C</p>'+
            '</div>&nbsp;<p style="display:inline-block;color:#000 !important;">Doc Intact 2019-2020</p>'+
        '</td>'+
    '</tr>'+
'</table>'

 transporter.sendMail(HelperOptions, function(err, info) {
                            if (err) { console.log("error occured when sending mail" + err) }
                            if (!err) {
                                console.log("Email sent")
                                // res.json({ "res": "success" })
                                res.json({ "linkstatus": "Success" });
                            }
                        });
                        // res.json(users)
                      
                    });
                }
            } else res.json({ "linkstatus": "Invalid" });
        });
    }
}

/**
 * @api {Post} /resendEmail   :  Resend Verification Mail Link
 * @apiName resendEmail
 * @apiGroup User
 * @apiSuccess {String} success
 */
exports.resendEmail = function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, // use SSL
        auth: {
            user: config.email,
            pass: config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    if (req.body.type) req.body.email = decrypt(key, req.body.email);
    var expire_at = moment().add(2, 'days').format('ddd, MMM D, YYYY hh:mm:ss A');
    var created_at = moment().format('ddd, MMM D, YYYY hh:mm:ss A');
    var linkdata = { created_at: created_at, expire_at: expire_at }
    User.findOne({ email: req.body.email }, function(err, user) {
        if (user) {
            var updated = _.merge(user, linkdata);
            updated.save(function(err) {});
        }
    })

    var activationkey = encrypt(key, req.body.email);
    var HelperOptions = {

        from: '"DOCINTACT" '+config.email,
        to: req.body.email,
        subject: "Docintact Account Confirmation",
    };
    HelperOptions.html = '<div class="background" style= "width: 680px; height: 795px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
        '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
        '<div class="innrbackground"  style=" width: 580px; height: 535px; background-color: #FFF; text-align: center; margin: auto; margin-top: 2rem;">' +

        '<img src ="https://staging.docintact.com/assets/images/verifyemail.png" style="margin-top: 2rem;" >' +
        '<h2 style="margin-top: 2rem;  font-size:22px; font-weight: 600">Verify Your Email Address</h2>' +
        '<hr  class="mt-0 hr-w hr1_bg" style="width: 85%;     margin-top: 24px !important;">' +

        '<p style="font-size:16px; margin: 65px; margin-top: 26px; margin-bottom: 18px; font-weight: 500;">In order to start using your Doc Intact account, you need to' +
        'confirm your email address.</p>' +
        '<h4> Click the Below   Button  to verify your email Address </h4>' +
        '<span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary" href="' + config.frontendUrl + "/signupemailconfirm/" + activationkey + '"   style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Verify Email Address </a></span>' +

        '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +

        '<p style="font-size:16px; margin: 65px; margin-top: 14px; margin-bottom: 18px; color: #A2A2A3;">if you did not sign up for this account you can ignore this email and the  ' +
        'account will be deleted.</p>' +

        '</div>' +

        '<p style="font-size: 14px;color: #A2A2A3; margin-top: 50px;"><img src ="https://staging.docintact.com/assets/images/careof.png">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
        '</div>'
    transporter.sendMail(HelperOptions, function(err, info) {
        if (err) { console.log("error occured when sending mail" + err) }
        if (!err) {
            console.log("Email sent")
            res.json({ "res": "success" })
        }
    });

}
/**
 * @api {Post} /resendEmailforemployee   :  Resend Mail Link to employees
 * @apiName resendEmailforemployee
 * @apiGroup User
 * @apiSuccess {String} success
 */
exports.resendEmailforemployee = function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25, // use SSL
        auth: {
            user: config.email,
            pass: config.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    var expire_at = moment().add(2, 'days').format('ddd, MMM D, YYYY hh:mm:ss A');
    var created_at = moment().format('ddd, MMM D, YYYY hh:mm:ss A');
    var linkdata = { created_at: created_at, expire_at: expire_at }
    User.findOne({ email: req.body.email }, function(err, user) {
        if (user) {
            var updated = _.merge(user, linkdata);
            updated.save(function(err) {});

            var activationkey = encrypt(key, user._id.toString());
            var HelperOptions = {
                from: '"DOCINTACT" '+config.email,
                to: req.body.email,
                subject: "Docintact Account  Confirmation ",
            };



            HelperOptions.html = '<div class="background" style= "width: 680px; height: 795px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
                '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
                '<div class="innrbackground"  style=" width: 580px; height: 535px; background-color: #FFF; text-align: center; margin: auto; margin-top: 2rem;">' +

                '<img src ="https://staging.docintact.com/assets/images/verifyemail.png" style="margin-top: 2rem;" >' +
                '<h2 style="margin-top: 2rem;  font-size:22px; font-weight: 600">Verify Your Email Address</h2>' +
                '<hr  class="mt-0 hr-w hr1_bg" style="width: 85%;     margin-top: 24px !important;">' +

                '<p style="font-size:16px; margin: 65px; margin-top: 26px; margin-bottom: 18px; font-weight: 500;">In order to start using your Doc Intact account, you need to' +
                'Verify  your email address.</p>' +
                '<h4> Click the Below   Button  to verify your email Address </h4>' +
                '<span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary" href="' + config.frontendUrl + "/signupemployee/" + activationkey + '"  style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Verify Email Address </a></span>' +
                '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +

                '<p style="font-size:16px; margin: 65px; margin-top: 14px; margin-bottom: 18px; color: #A2A2A3;">if you did not sign up for this account you can ignore this email and the  ' +
                'account will be deleted.</p>' +

                '</div>' +

                '<p style="font-size: 14px;color: #A2A2A3; margin-top: 50px;"><img src ="https://staging.docintact.com/assets/images/careof.png">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
                '</div>'

            transporter.sendMail(HelperOptions, function(err, info) {
                if (err) { console.log("error occured when sending mail" + err) }
                if (!err) {
                    res.json({ "res": "success" })
                }
            });








        }
    })
}


/**
 * @api {get} /deletesocialdoc/:id    :  Delete user when sign up with twitter / facebook verification (email id not updating)
 * @apiName deleteDoc
 * @apiGroup User
 * @apiSuccess {String} success
 * @apiError err
 */


exports.deleteDoc = function(req, res) {

    User.remove({ $or: [{ 'facebook.id': req.params.id }, { 'twitter.id_str': req.params.id }] }).exec(function(err) {
        if (err) return res.status(200).json(err)
        else return res.status(200).json("success")
    });
}
/**
 * @api {Post} /twitterlogin   :  login with twitter
 * @apiName twitteruserinfoweb
 * @apiGroup User
 * @apiSuccess {Array} User
 * @apiError {string} No account
 */

exports.twitteruserinfoweb = function(req, res) {
    User.findOne({ 'twitter.id_str': req.body.twitter_id }, function(err, user) {
        if (err) return res.status(200).json(err)
        else if (!user) return res.status(200).json("No account");
        else {
            user.email = req.body.email;
            user.save(function(err) {
                if (err) return res.status(200).json(err)
                else {
                    var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
                    return res.json({ user: user, token: token });
                }
            })
        }
    })

}
/**
 * @api {Post} / login with Facebook
 * @apiName facebookuserinfoweb
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError {string} No account
 */
exports.facebookuserinfoweb = function(req, res) {
        User.findOne({ 'facebook.id': req.body.facebook_id }, function(err, user) {
            if (err) return res.status(200).json(err)
            else if (!user) return res.status(200).json("No account");
            else {
                user.email = req.body.email;
                user.save(function(err) {
                    if (err) return res.status(200).json(err)
                    else {
                        var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
                        return res.json({ user: user, token: token });
                    }
                })
            }
        })

    }
/**
 * @api {Post} /update  :  Update Employee Details
 * @apiName updateemployee
 * @apiGroup User
 * @apiSuccess {Json} Token
 */
exports.updateemployee = function(req, res) {
    var newPass = req.body.password
    if (req.body._id) { delete req.body._id; }

    User.findOne({ _id: req.body.id }, function(err, user) {
        user.password = newPass;
        user.status = req.body.status
        user.updated_at = Date.now();
        user.save(function(err) {
            if (err) return validationError(res, err);

            var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 });
            res.json({ token: token });
        });

    });

};



 /**
 * @api {Post} /employeelogindetails   :  Update sharing records,photos,Signature,Photo,Stamp,Fieldoption,Fieldvalue,Notification when user deleted
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers.
 * @apiName employeelogindetails
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError {string} Not Found
* @apiError 500-InternalServerError SERVER error.
 */
exports.employeelogindetails = function(req, res) {
    User.findOne({ email: req.body.email }, async function(err, user) {
        if (err) { return handleError(res, err); }
        if (!user) { return res.status(404).send('Not Found'); }
        if (req.body.type == 'replace') {
            await Sharingpeople.find({ toemail: req.body.email }, { active: true }).exec(function(err, sharingpeoples) {
                async.each(sharingpeoples, async function(element, call) {
                    element.active = false
                    element.updated_at = Date.now();
                    element.save(function(err) {
                        if (err) { return handleError(res, err); }
                    });
                })
            })
            await Signature.find({ email: req.body.email }, { active: true }).exec(function(err, signatures) {
                async.each(signatures, async function(element, call) {
                    element.active = false
                    element.updated_at = Date.now();
                    element.save(function(err) {
                        if (err) { return handleError(res, err); }
                    });
                })
            })
            await Photo.find({ email: req.body.email }, { active: true }).exec(function(err, photos) {
                async.each(photos, async function(element, call) {
                    element.active = false
                    element.updated_at = Date.now();
                    element.save(function(err) {
                        if (err) { return handleError(res, err); }
                    });
                })
            })
            await Stamp.find({ email: req.body.email }, { active: true }).exec(function(err, stamps) {
                async.each(stamps, async function(element, call) {
                    element.active = false
                    element.updated_at = Date.now();
                    element.save(function(err) {
                        if (err) { return handleError(res, err); }
                    });
                })
            })
            await Fieldoption.find({ email: req.body.email }, { active: true }).exec(function(err, fieldoptions) {
                async.each(fieldoptions, async function(element, call) {
                    element.active = false
                    element.updated_at = Date.now();
                    element.save(function(err) {
                        if (err) { return handleError(res, err); }
                    });
                })
            })
            await Fieldvalue.find({ email: req.body.email }, { active: true }).exec(function(err, fieldvalues) {
                async.each(fieldvalues, async function(element, call) {
                    element.active = false
                    element.updated_at = Date.now();
                    element.save(function(err) {
                        if (err) { return handleError(res, err); }
                    });
                })
            })
            await Notification.find({ toemail: req.body.email }, { active: true }).exec(function(err, fieldoptions) {
                async.each(fieldoptions, async function(element, call) {
                    element.active = false
                    element.updated_at = Date.now();
                    element.save(function(err) {
                        if (err) { return handleError(res, err); }
                    });
                })
            })
            var newemail = req.body.email.substring(0, req.body.email.lastIndexOf("@"));
            console.log(newemail)
            var newmail = Math.round((new Date()).getTime() / 1000)
            var email = newemail + '_' + newmail + '@gmail.com'
            req.body.email = email
        }
        var user = _.merge(user, req.body);
        user.updated_at = Date.now();
        user.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(user);
        });
    });
};

 /**
 * @api {Post} /checkallusers  :  Check User is exist or not
 * @apiName checkallusers
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError {string} Not Found
 */
exports.checkallusers = function(req, res) {
    User.find({ email: req.body.email }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(400).send("Not Found");
        else return res.status(200).send(user);
    });

}

 /**
 * @api {Get} /shareable_employees/:id      :    Get List of Users in selected Departments
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. * 
 * @apiName departmentEmployess
 * @apiGroup User
 * @apiSuccess {Array} Users
 * @apiError {string} Not Found
 */

exports.departmentEmployess = function(req, res) {
    var users = []
    User.find({ department: req.params.id, active: true, status: true }).exec(function(err, user) {
        if (!user) return res.status(400).send("Not Found");
        else
            return res.status(200).send(user);
    });

}

 /**
 * @api {Get} /shareableemails/:id   :   Get List of emails in selected Departments
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. * 
 * @apiName departmentemails
 * @apiGroup User
 * @apiSuccess {Array} Users
 * @apiError {string} Not Found
 */

exports.departmentemails = function(req, res) {
        var users = []
        User.find({ department: req.params.id, active: true }).exec(function(err, user) {
            if (!user) return res.status(400).send("Not Found");
            else {
                user.forEach(element => {
                    users.push(element.email)
                })

            }
            return res.status(200).send(users);
        });

    }
 /**
 * @api {put} /:id    :    Update User (Admin)
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. * 
 * @apiName update
 * @apiParam user id
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError {string} Not Found
 * @apiError 500-InternalServerError SERVER error.
 */

exports.update = function(req, res) {
    if (req.body._id) { delete req.body._id; }
    User.findById(req.params.id, function(err, user) {
        if (err) { return handleError(res, err); }
        if (!user) { return res.status(404).send('Not Found'); }
        var updated = _.merge(user, req.body);
        updated.updated_at = Date.now();
        updated.save(function(err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(user);
        });
    });
};
 /**
 * @api {Post} /filterUsers    :  Update User 
 * @apiHeader (Authorization)(Admin) {String} authorization Bearer Authorization value will sent through headers. * 
 * @apiName filterResults
 * @apiGroup User
 * @apiSuccess {Json} User
 * @abiError 500 Intenal server Error
 * @apiError 500-InternalServerError SERVER error.
 */
exports.filterResults = function(req, res) {
    User.find(req.body.where).populate('uid').populate('touid').exec(function(err, user) {

        if (err) { return handleError(res, err); }

        return res.status(200).json(user);

    });
};
// Not Used In web
exports.sendMailForSignup = function(req, res) {
    console.log(req.body.email)
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) { return handleError(res, err); }
        if (!user) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                port: 25, // use SSL
                auth: {
                    user: config.email,
                    pass: config.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            var activationkey = encrypt(key, req.body.email.toString());

            var HelperOptions = {

                from: '"DOCINTACT" '+config.email,
                to: req.body.email,
                subject: "Docintact Account Confirmation",
                // text: "Click This link To Activate your Account : " + config.frontendUrl + "/signup/" + activationkey

            };
            HelperOptions.html = '<div class="background" style= "width: 680px; height: 795px; background-color: #F4F7FA; text-align: center; margin: auto;font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;">' +
                '<div class="logo" Style="margin-top:2rem"><img src ="https://staging.docintact.com/assets/images/Group2244.png"> </div>' +
                '<div class="innrbackground"  style=" width: 580px; height: 535px; background-color: #FFF; text-align: center; margin: auto; margin-top: 2rem;">' +

                '<img src ="https://staging.docintact.com/assets/images/verifyemail.png" style="margin-top: 2rem;" >' +
                '<h2 style="margin-top: 2rem;  font-size:22px; font-weight: 600">Verify Your Email Address</h2>' +
                '<hr  class="mt-0 hr-w hr1_bg" style="width: 85%;     margin-top: 24px !important;">' +

                '<p style="font-size:16px; margin: 65px; margin-top: 26px; margin-bottom: 18px; font-weight: 500;">In order to start  Your Free Trail using your Doc Intact account, you need to' +
                'confirm your email address.</p>' +
                '<h4> Click the Below   Button  to verify your email Address </h4>' +
                '<span class="im">&nbsp;<a class="m_233836446190015510btn m_233836446190015510btn-primary" href="' + config.frontendUrl + "/signup/" + activationkey + '"   style="text-decoration:none;display:inline-block;font-weight:normal;line-height:1.25;text-align:center;white-space:nowrap;vertical-align:middle;font-size:1rem;border-radius:0.25rem;color:#fff;background-color:#0275d8;padding:0.5rem 1rem;border:1px solid #0275d8;" target="_blank">Verify Email Address </a></span>' +

                '<hr  class="mt-0 hr-w" style=" width: 12%; margin-top: 35px !important;">' +

                '<p style="font-size:16px; margin: 65px; margin-top: 14px; margin-bottom: 18px; color: #A2A2A3;">if you did not sign up for this account you can ignore this email and the  ' +
                'account will be deleted.</p>' +

                '</div>' +

                '<p style="font-size: 14px;color: #A2A2A3; margin-top: 50px;"><img src ="https://staging.docintact.com/assets/images/careof.png">&nbsp;&nbsp; Doc Intact 2019-2020</p>' +
                '</div>'
            transporter.sendMail(HelperOptions, function(err, info) {
                if (err) { console.log("error occured when sending mail" + err) } else {
                    console.log("link sent" + id1);
                    res.json({ "res": "success" })
                }
            });
        }
    });


};

 /**
 * @api {Post} /twitteruserinfo    :     Signin/signup with Twitter using Mobile App
 * @apiName twitteruserinfo
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError {string} emailnotfound
 */
exports.twitteruserinfo = function(req, res) {
    var twitter = new twitterAPI({
        consumerKey: '7ByXzKGsLpep13Ov8RJ5oG9qE',
        consumerSecret: '2kr2wBmbfviB9kv3dSpgC2LC3aefMLkWMzrqHuplr8aYlAaQef',
        callback: ''
    });
    var params = {
        'include_email': true
    };
    twitter.verifyCredentials(req.body.token, req.body.secret, params, function(error, data, response) {
        if (error) {
        } else {
            User.findOne({ $or: [{ 'twitter.id_str': data.id_str }, { email: data.email }] }, function(err, user) {
                if (!user) {
                    user = new User({
                        name: data.name,
                        email: data.email,
                        role: 'user',
                        provider: req.body.provider,
                        type: req.body.type,
                        new: true,
                        active: true,
                        IP: req.body.IP,
                        twitter: data,
                    });
                    if (data.email != "" || data.email != null) {
                        user.save(function(err) {
                            if (err) return validationError(res, err);
                            var token = jwt.sign({ _id: user._id }, config.secrets.session,{ expiresIn:  60*60*5  });
                            userseesion.create({uid:user._id,token:token,active:true});
                            return res.status(200).send({ token: token, user: user });
                        });
                    } else {
                        user.save(function(err) {
                            if (err) return validationError(res, err);
                            return res.status(200).send({ user: user });
                        });
                    }
                } else {
                    console.log(user.email)
                    if (user.email != "" || user.email != null) {
                        var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn:  60*60*5  });
                        userseesion.create({uid:user._id,token:token,active:true});
                        return res.status(200).send({ token: token, user: user });
                    } else {
                        return res.status(200).send({ user: user, emailid: 'emailnotfound' });
                    }

                }
            })

        }
    })
}
 /**
 * @api {Post} /twtupdate      :   Update User when signup with twitter using Mobile App
 * @apiName twtupdate
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError {string} somethingwrong/emailexist
 */
exports.twtupdate = function(req, res) {
    User.findOne({ 'email': req.body.email }).exec(function(err, user) {
        if (user) {
            return res.status(200).send({ statustwt: 'emailexist' })
        } else {
            User.findOne({ 'twitter.id_str': req.body.recordid }).exec(function(err, user) {
                if (user) {

                    user.email = req.body.email;
                    user.save(function(err) {
                        if (err) return res.status(200).json(err)
                        else {
                            var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
                            return res.json({ user: user, token: token });
                        }
                    })
                } else {
                    return res.json({ twitwrusr: 'somethingwrong' });
                }
            })
        }
    })
}

 /**
 * @api {Post} /fbverifyemail   :   Update User when signup with facebook using Mobile App
 * @apiName fbverifyemail
 * @apiGroup User
 * @apiSuccess {Json} User
 * @apiError {string} emailnotfound/usernotfound
 */
exports.fbverifyemail = function(req, res) {
    User.findOne({ 'facebook.id': req.body.fbuniqid.id }).exec(function(err, user) {
        if (user) {
            if (user.email != undefined && user.email != "" && user.email != null) {
                var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
                return res.status(200).send({ token: token, user: user });
            } else {
                return res.status(200).send({ user: user, emailid: 'emailnotfound' });
            }
        } else {
            return res.status(200).send({ user: user, emailuser: 'usernotfound' });
        }
    })

}

 /**
 * @api {Post} /fbupdateemail  :   Update User Email when signup with facebook using Mobile App
 * @apiName fbverifyemail
 * @apiGroup User
 * @apiSuccess {Array} User ,token
 * @apiError {string} somethingwrong/emailexist
 */
exports.fbupdateemail = function(req, res) {
        User.findOne({ 'email': req.body.email }).exec(function(err, user) {
            if (user) {
                return res.status(200).send({ statusface: 'emailexist' })
            } else {
                User.findOne({ 'facebook.id': req.body.fbupdateid }).exec(function(err, user) {
                    if (user) {
                        user.email = req.body.email;
                        user.save(function(err) {
                            if (err) return res.status(200).json(err)
                            else {
                                var token = jwt.sign({ _id: user._id }, config.secrets.session, { expiresInMinutes: 60 * 5 });
                                return res.json({ user: user, token: token });
                            }
                        })
                    } else {
                        return res.json({ twitwrusr: 'somethingwrong' });
                    }
                })
            }
        })
    }
    /**
//  * @api {Post}  / mobileGoogleLogin     :  Login in google using Mobile app
 * @apiName sociallogin
 * @apiGroup User
 * @apiSuccess {Array} User ,token
 */
exports.sociallogin = function(req, res, next) {
    req.body.IP = req.connection.remoteAddress;
    User.findOne({
        'email': req.body.email
    }, function(err, user) {
        if (!user) {
            if (req.body.provider == 'google') {
                user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    role: 'user',
                    provider: req.body.provider,
                    type: req.body.type,
                    new: true,
                    active: true,
                    IP: req.body.IP,
                    google: req.body,
                });
            } else {
                user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    role: 'user',
                    provider: req.body.provider,
                    type: req.body.type,
                    new: true,
                    active: true,
                    IP: req.body.IP,
                    facebook: req.body.facebook,
                });
            }

            user.save(function(err) {
                if (err) return validationError(res, err);
                var token=jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn:  60*60*5  });
                userseesion.create({uid:user._id,token:token,active:true});
                return res.status(200).send({ token: token, user: user });
            });
        } else {
            console.log(user)
            var token=jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn:  60*60*5  });
                userseesion.create({uid:user._id,token:token,active:true});
                return res.status(200).send({ token: token, user: user });
        }
    })
};
 /**
 * @api {Post} / googledrivemobile    : google drive file picker for mobile APP
 * @apiName googledrivemobile
 * @apiGroup User
 * @apiSuccess {Array} Files
 */
exports.googledrivemobile = function(req, res) {
    // ya29.GlshB_bsPiKs7TpmDIWhLMWqLZRIfQFmE3NE7nNo0T_lvf4yfjOvP3Jvs149kfCj_iPnftBcY_FMK81cIcCpzt4P5WRvIYcD332euc0Imbu6U2K4ZMWVhj5yArJj
    var request = require('request')
    var headers = { "Authorization": 'Bearer ' + req.body.googletoken }
    request.get({
        url: 'https://www.googleapis.com/drive/v3/files/',
        headers: headers
    }, function(error, response, filedata) {
        return res.status(200).json(filedata)
    })

}
 /**
 * @api {Get}/ checkuserid/:id   :   Get user 
 * @apiHeader (Authorization)(Admin) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName getuser
 * @apiParam User id
 * @apiGroup User
 * @apiSuccess {Json} user
 */
exports.getuser = function(req, res) {
    User.findOne({ _id: req.params.id }).exec(function(err, users) {
        if (err) return res.status(500).send(err);
        else {

            return res.status(200).json(users)
        }

    });
}
 /**
 * @api {Get} /getDepartments     : get Active Users in Seleced Departments  
 * @apiHeader (Authorization) {String} authorization Bearer Authorization value will sent through headers. 
 * @apiName getDepartments
 * @apiGroup User
 * @apiSuccess {Json} user
 */
exports.getDepartments = (req, res) => {
    var departments = req.body.departments;
    var departData = [];
    async.forEach(departments, (depart, cb) => {
        User.find({ department: depart, active: true, status: true }).populate('department').exec((err, users) => {
            if (err) return res.status(500).send(err);
            if (users && users.length !== 0) {
                departData.push({ _id: users[0].department._id, deptname: users[0].department.deptname, active: users[0].department.active });
                cb(null);
            } else {
                cb(null);
            }
        })
    }, () => {
        return res.status(200).json(departData)
    })

}


/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};
/**
 * Error Handler, if it is called, it will return with 500 status code
 */
function handleError(res, err) {
    return res.status(500).send(err);
}