'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });
var crypto = require("crypto")
var key = "secretkey";
var userseesion=require('../api/usersession/usersession.model')
/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
       validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
       var token= req.headers.authorization.split(' ')[1];
      }
      userseesion.findOne({uid:req.user._id,token:token}).exec(function (err,activeuser) {
        if (err) return next(err);
        if(activeuser)
        {
          User.findById(req.user._id, function (err, user) {
            if (err) return next(err);
            if (!user) return res.status(401).send('Unauthorized');
            req.user = user;
            next();
          });
        }
       else{
        return res.status(401).send('Unauthorized');
       }
      
    })
    
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
    var token=jwt.sign({ _id: id }, config.secrets.session, { expiresIn:  60*60*5  });
    userseesion.create({uid:id,token:token,active:true});
    return token;
}

/**
 * Set token cookie directly for oAuth strategies
 */
function encrypt(key, data) {
  if(typeof data  == 'undefined') data = 'individual';
  var cipher = crypto.createCipher('aes-256-cbc', key);
  var crypted = cipher.update(data, 'utf-8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.role);
//  console.log("token1",'-----------------------',token)
//   res.cookie('token',token,{httpOnly: false,domain:"https://staging.docintact.com/mainnav/"});
//   res.cookie('user',JSON.stringify(req.user),{httpOnly: false,domain:"https://staging.docintact.com/mainnav/"});

var userDetails={token:token,user:req.user}
const url = require('url');
var obj={} 
if(req.user.provider=="facebook"){
  obj={
    "token": token,
    "name":encrypt(key,req.user.name),
    "email":encrypt(key,req.user.email),
     "new":req.user.new,
     "role":encrypt(key,req.user.role),
     "type":encrypt(key,req.user.type),
     "title":"googlelogin",
     "provider": encrypt(key,req.user.provider),
     "facebook_id": encrypt(key,req.user.facebook.id)
  }
}
else if(req.user.provider=="twitter"){
  obj={
    "token": token,
    "name":encrypt(key,req.user.name),
    "email":encrypt(key,req.user.email),
     "new":req.user.new,
     "role":encrypt(key,req.user.role),
     "type":encrypt(key,req.user.type),
     "title":"googlelogin",
     "provider": encrypt(key,req.user.provider),
     "twitter_id": encrypt(key,req.user.twitter.id_str)
  }
}
  else{
    obj={
      "token": token,
      "name":encrypt(key,req.user.name),
      "email":encrypt(key,req.user.email),
       "new":req.user.new,
       "role":encrypt(key,req.user.role),
       "type":encrypt(key,req.user.type),
       "title":"googlelogin",
       "provider": encrypt(key,req.user.provider),
    }
  }
  res.redirect(url.format({
    pathname:config.frontendUrl,
    query:obj
  }));
  
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
