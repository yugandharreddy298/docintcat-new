'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UsersessionSchema = new Schema({
  uid: {type:Schema.Types.ObjectId,ref:'User'},
  token: String,
  active: Boolean
});

module.exports = mongoose.model('Usersession', UsersessionSchema);