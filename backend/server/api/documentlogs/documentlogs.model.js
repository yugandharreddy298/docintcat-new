'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocumentlogsSchema = new Schema({
  info: String,
  height:Number,
  width:Number,
  // top:Number,
  // left:Number,
  coordinatex:Number,
  coordinatey:Number,
  text:String,
  uid:{type:Schema.Types.ObjectId,ref:'User'},
  toid:{type:Schema.Types.ObjectId,ref:'User'},
  toemail:String,
  documentid: {type:Schema.Types.ObjectId,ref:'Document'},
  folderid:{type:Schema.Types.ObjectId,ref:'Folder'},
  active: Boolean,
  timeinterval:Date,
  message:String,
  isFile:Boolean,
  fromName:String,
  toName:String,
  isFolder:Boolean,
  endTime:Date,
  sharedid: {type:Schema.Types.ObjectId,ref:'Sharingpeople'},
  Opened_at:Date,
  path: String,
  size: Number,
  originalFilename: String,
  name: String,
  type: String,
  longitude:String,
  latitude:String,
  IpAddress:String,
  Address:String,
  browser:String,
  email:String,
  deviceName:String,
  created_at: { type: Date, required: true, default: Date.now },
  photoId:{type:Schema.Types.ObjectId,ref:'Photo'},
  signatureId:{type:Schema.Types.ObjectId,ref:'Signature'},
  stampId:{type:Schema.Types.ObjectId,ref:'Stamp'},
  pageInfo:[{}],
  pageNo:Number,
  pageWidth:String,
  pageHeight:String

},{timestamps:true});

module.exports = mongoose.model('Documentlogs', DocumentlogsSchema);