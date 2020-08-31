/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
var Usersession = require('../api/usersession/usersession.model');
var Token = require('../api/token/token.model');
var Countrycode = require('../api/countrycode/countrycode.model');
var Mobilelink = require('../api/mobilelink/mobilelink.model');
var Favorite = require('../api/favorite/favorite.model');
var Documentlogs = require('../api/documentlogs/documentlogs.model');
var Onlineuser = require('../api/onlineuser/onlineuser.model');
var Stamp = require('../api/stamp/stamp.model');
var Photo = require('../api/photo/photo.model');
var Version = require('../api/version/version.model');
var Comment = require('../api/comment/comment.model');
var Chat = require('../api/chat/chat.model');
var Fieldvalue = require('../api/fieldvalue/fieldvalue.model');
var Fielddata = require('../api/fielddata/fielddata.model');
var Fieldoption = require('../api/fieldoption/fieldoption.model');
var Links = require('../api/links/links.model');
var Department = require('../api/department/department.model');
var Otp = require('../api/otp/otp.model');
var Sharingpeople = require('../api/sharingpeople/sharingpeople.model');
var Folder = require('../api/folder/folder.model');
var Document = require('../api/document/document.model');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Signature = require('../api/signature/signature.model');

// Insert seed data below
var usersessionSeed = require('../api/usersession/usersession.seed.json');
var tokenSeed = require('../api/token/token.seed.json');
var countrycodeSeed = require('../api/countrycode/countrycode.seed.json');
var mobilelinkSeed = require('../api/mobilelink/mobilelink.seed.json');
var favoriteSeed = require('../api/favorite/favorite.seed.json');
var documentlogsSeed = require('../api/documentlogs/documentlogs.seed.json');
var onlineuserSeed = require('../api/onlineuser/onlineuser.seed.json');
var stampSeed = require('../api/stamp/stamp.seed.json');
var photoSeed = require('../api/photo/photo.seed.json');
var versionSeed = require('../api/version/version.seed.json');
var commentSeed = require('../api/comment/comment.seed.json');
var chatSeed = require('../api/chat/chat.seed.json');
var fieldvalueSeed = require('../api/fieldvalue/fieldvalue.seed.json');
var fielddataSeed = require('../api/fielddata/fielddata.seed.json');
var fieldoptionSeed = require('../api/fieldoption/fieldoption.seed.json');
var linksSeed = require('../api/links/links.seed.json');
var departmentSeed = require('../api/department/department.seed.json');
var otpSeed = require('../api/otp/otp.seed.json');
var sharingpeopleSeed = require('../api/sharingpeople/sharingpeople.seed.json');
var folderSeed = require('../api/folder/folder.seed.json');
var documentSeed = require('../api/document/document.seed.json');
var thingSeed = require('../api/thing/thing.seed.json');
var signatureSeed = require('../api/signature/signature.seed.json');

// Insert seed inserts below
Usersession.find({}).remove(function() {
	Usersession.create(usersessionSeed);
});

Token.find({}).remove(function() {
	Token.create(tokenSeed);
});

Message.find({}).remove(function() {
	Message.create(messageSeed);
});

Countrycode.find({}).remove(function() {
	Countrycode.create(countrycodeSeed);
});

Mobilelink.find({}).remove(function() {
	Mobilelink.create(mobilelinkSeed);
});

Favorite.find({}).remove(function() {
	Favorite.create(favoriteSeed);
});

Documentlogs.find({}).remove(function() {
	Documentlogs.create(documentlogsSeed);
});

Onlineuser.find({}).remove(function() {
	Onlineuser.create(onlineuserSeed);
});

Stamp.find({}).remove(function() {
	Stamp.create(stampSeed);
});

Photo.find({}).remove(function() {
	Photo.create(photoSeed);
});



Version.find({}).remove(function() {
	Version.create(versionSeed);
});

Comment.find({}).remove(function() {
	Comment.create(commentSeed);});
Chat.find({}).remove(function() {
	Chat.create(chatSeed);
});

Signature.find({}).remove(function() {
	Signature.create(signatureSeed);
});
Fieldvalue.find({}).remove(function() {
	Fieldvalue.create(fieldvalueSeed);
});

Fielddata.find({}).remove(function() {
	Fielddata.create(fielddataSeed);
});

Fieldoption.find({}).remove(function() {
	Fieldoption.create(fieldoptionSeed);
});

Links.find({}).remove(function() {
	Links.create(linksSeed);
});

Department.find({}).remove(function() {
	Department.create(departmentSeed);
});

Otp.find({}).remove(function() {
	Otp.create(otpSeed);
});

Sharingpeople.find({}).remove(function() {
Sharingpeople.create(sharingpeopleSeed);});

Folder.find({}).remove(function() {
	Folder.create(folderSeed);
});

Document.find({}).remove(function() {
	Document.create(documentSeed);
});

Thing.find({}).remove(function() {
  Thing.create(thingSeed);
});