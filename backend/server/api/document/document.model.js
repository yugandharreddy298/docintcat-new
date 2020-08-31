'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocumentSchema = new Schema({
  name: String,
  originalfilename:String,
  path:String,
  size:String,
  link:String,
  copycount:Number,
  type: String,
  zfilePath:String,
  zipfileid:{type:Schema.Types.ObjectId,ref:'Document'},
  parentid:{type:Schema.Types.ObjectId,ref:'Document'},
  versionid:{type:Schema.Types.ObjectId,ref:'Version'},
  uid:{type:Schema.Types.ObjectId,ref:'User'},
  organizationid:{type:Schema.Types.ObjectId,ref:'User'},
  active: {type:Boolean,default:true},
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: Date,
  last_update_userid:{type:Schema.Types.ObjectId,ref:'User'},
  folderid:{type:Schema.Types.ObjectId,ref:'Folder'},
  isFile:{ type: Boolean,  default: true },
  encryptedid:String,
  value:String,
  waterMark: JSON,
  pagesInfo:[],
  status:{ type: String,  default: "upload" },
  isSent:{ type: Boolean,  default: false },
  thumbnail: String,
  completedDocPreview: String,
  privateKey: String,
  publicKey: String,
  certificate: String,
  expirydate: Date,
  crlPath: String,
  crlData: String,
  SerialNo: String
},
{timestamps: true}
);

module.exports = mongoose.model('Document', DocumentSchema);