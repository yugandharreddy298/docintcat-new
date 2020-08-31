'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VersionSchema = new Schema({
  uid: {type: Schema.Types.ObjectId, ref : 'User'},
  documentid:{type:Schema.Types.ObjectId,ref:'Document'},
  current: { type: Boolean, default:true },
  versionname: String,
  active: { type: Boolean, default:true },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: Date
})

module.exports = mongoose.model('Version', VersionSchema);