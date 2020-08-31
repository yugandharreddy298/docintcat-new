'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();
router.post('/', controller.create);
router.post('/emailactivate',controller.activateemail)
router.post('/resendEmail',controller.resendEmail)
router.post('/resendEmailforemployee',controller.resendEmailforemployee)
router.get('/checkstatus/:id',controller.checkStatus);
router.post('/newemailactivate',controller.activatenewemail)
router.post('/addEmployee',auth.isAuthenticated(),controller.addEmployee)
router.post('/checkusers', controller.checkusers);
router.post('/checkusers1', controller.checkusers1);
router.post('/userecryptDatas', controller.userecryptDatas);
router.post('/checkallusers', controller.checkallusers);
router.post('/forgotPassEmail', controller.forgotPassEmail);
router.post('/verifyotp',controller.otpCheck);
router.post('/verifyemail1',auth.isAuthenticated(), controller.mailer1);
router.post('/changeForgotPass',controller.forgotPassChange);
router.post('/employeelogin',controller.employeelogin);
router.post('/update', controller.updateemployee);
router.post('/twitterlogin', controller.twitteruserinfoweb);
router.get('/deletesocialdoc/:id', controller.deleteDoc);
router.post('/facebooklogin', controller.facebookuserinfoweb);
router.post('/oldPasswordChecking', auth.isAuthenticated(), controller.oldPasswordChecking);
router.post('/employeelogindetails', auth.isAuthenticated(), controller.employeelogindetails);
router.get('/',auth.isAuthenticated(), controller.index);
router.get('/getUsers',auth.isAuthenticated(), controller.index1);
router.get('/getRegisteredUsers',auth.hasRole('admin'), controller.index);
router.get('/employeedetails', auth.isAuthenticated(), controller.employeedetails);
router.post('/searchEmployee', auth.isAuthenticated(), controller.searchEmployees);
router.post('/search/user', auth.isAuthenticated(), controller.UsersSearch);
router.get('/empdata',auth.isAuthenticated(), controller.employelist)
router.get('/empcount',auth.isAuthenticated(),controller.empcount);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/updatenewuser',auth.isAuthenticated(), controller.updatenewuser);
router.put('/:id',auth.hasRole('admin'), controller.update);
router.put('/change/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/shareable_employees/:id', auth.isAuthenticated(), controller.departmentEmployess);
router.get('/shareableemails/:id', auth.isAuthenticated(), controller.departmentemails);
router.post('/filterUsers',auth.hasRole('admin'), controller.filterResults);
router.post('/sendMail/Signup', controller.sendMailForSignup);
router.post('/contact', controller.contact);
router.post('/mobileGoogleLogin', controller.sociallogin);
router.post('/googledrivemobile', controller.googledrivemobile);
router.post('/twitteruserinfo', controller.twitteruserinfo);
router.post('/twtupdate', controller.twtupdate);
router.post('/fbverifyemail', controller.fbverifyemail);
router.post('/fbupdateemail', controller.fbupdateemail);
router.post('/addemployeess',auth.isAuthenticated(),controller.addemployessfromexcel)

router.get('/checkuserid/:id', controller.getuser);

router.post('/getcountries', controller.countries);
router.post('/getDepartments/',auth.isAuthenticated(), controller.getDepartments);
module.exports = router;




