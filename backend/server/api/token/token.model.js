'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TokenSchema = new Schema({
  uid: {type: Schema.Types.ObjectId, ref : 'User'},
  deviceid: String,
  platform: {type: String, default: 'mobile'},
  deviceuuid: String,
  isLoggedIn: { type :Boolean, default: true}
});

module.exports = mongoose.model('Token', TokenSchema);