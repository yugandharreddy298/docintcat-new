'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PhotoSchema = new Schema({
  name: String,
  info: String,
  originalfilename:String,
  path:String,
  size:String,
  link:String,
  setDefault: {type:Boolean,default:false},
  setDelete: {type:Boolean,default:false},
  uid:{type:Schema.Types.ObjectId,ref:'User'},
  organizationid:{type:Schema.Types.ObjectId,ref:'User'},
  active: {type:Boolean,default:true},
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: Date,
  last_update_userid:{type:Schema.Types.ObjectId,ref:'User'},
  folderid:{type:Schema.Types.ObjectId,ref:'Folder'},
  isFile:{ type: Boolean,  default: true },
  encryptedid:String,
  type:String,
  photobaseData:String,
  privateKey:String,
  publicKey:String,
  certificate:String,
  AIpath:String,
  authentication:{type:Boolean,default:false},
  bottlenecksCreated:{type:Boolean,default:false},
  email: { type: String, lowercase: true },
  pemFilePath:String,
  expirydate:Date,

});

module.exports = mongoose.model('Photo', PhotoSchema);