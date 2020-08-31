'use strict';

var path = require('path');
var _ = require('lodash');
var config = require('../../config/environment/development');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}
process.env.AWS_SDK_LOAD_CONFIG = true; 
// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'docintact-secret'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  facebook: {
    // Staging
    clientID:     process.env.FACEBOOK_ID || '411381282923346',
    clientSecret: process.env.FACEBOOK_SECRET || '273c4d2865e0f6b5cf755b23c92ce0f6',
    // Local
    // clientID:     process.env.FACEBOOK_ID || '655709538184700',
    // clientSecret: process.env.FACEBOOK_SECRET || 'b718225d58b9d75e7bb5f1552010ab77',
    // callbackURL:  (process.env.DOMAIN || '') + '/auth/facebook/callback'
    callbackURL:  config.backendurl+'/auth/facebook/callback'
    // callbackURL:  'http://localhost:9000/auth/facebook/callback'
  },

  twitter: {
    clientID:     process.env.TWITTER_ID || 'flhclFKw5ma52dPtL9AFCFjCF',
    clientSecret: process.env.TWITTER_SECRET || '2529Dq0eDnjIlnG4CkRPAPVh9ogikV8BLfZWdQXcF3FwXfszFI',
    // callbackURL:  (process.env.DOMAIN || '') + '/auth/twitter/callback'
        callbackURL:  config.backendurl+'/auth/twitter/callback'
        // callbackURL:  'http://localhost:9000/auth/twitter/callback'
    
  },

  google: {
    clientID:     process.env.GOOGLE_ID || '778273248008-1u6qh3jmfg9pdmpdpns2noqp5439n2r1.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'ivYRmp9ZCwgBpCML1-yR65K5',
    callbackURL:  config.backendurl+'/auth/google/callback'
    // callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback'
    // callbackURL:  'http://localhost:9000/auth/google/callback'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
	// https://nodestage.docintact.com/auth/google/callback