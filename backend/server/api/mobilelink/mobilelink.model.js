'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MobilelinkSchema = new Schema({
  phNumber: String,
  countrycode: String,
  type: String,
  fieldid: String,
  expire_at:Date,
  fromIP:String,
  toIP:String,
  documentid: {type:Schema.Types.ObjectId,ref:'Document'},
  uid: {type:Schema.Types.ObjectId,ref:'User'},
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: Date,
  active: {type:Boolean,default:true},
  signatureId:{type:Schema.Types.ObjectId,ref:'Signature'},
  signaturebaseData:String,
  signatureType:String,
  originalfilename:String,
  path:String,
  size:String,
  link:String,
  encryptedid:String,
  photobaseData:String,
  stampbaseData:String,
  photoType:String,
  stampType:String,
  photoId:{type:Schema.Types.ObjectId,ref:'Photo'},
  stampId:{type:Schema.Types.ObjectId,ref:'Stamp'},
  name:String,
  signtype:String,
  authentication:Boolean,
  email:String,
  pemFilePath: String
});

module.exports = mongoose.model('Mobilelink', MobilelinkSchema);