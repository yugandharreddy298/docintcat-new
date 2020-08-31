'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
  comment: String,
  link:String,
  commentedlines:String,
  coordinatex:Number,
  coordinatey:Number,
  uid:{type:Schema.Types.ObjectId,ref:'User'},
  organizationid:{type:Schema.Types.ObjectId,ref:'User'},
  active: {type:Boolean,default:true},
  created_at: { type: Date, required: true, default: Date.now },
  documentid: {type:Schema.Types.ObjectId,ref:'Document'},
  sharedid: {type:Schema.Types.ObjectId,ref:'Sharingpeople'},
  updated_at: Date,
  last_update_userid:{type:Schema.Types.ObjectId,ref:'User'},
  folderid:{type:Schema.Types.ObjectId,ref:'Folder'},
  isFile:{ type: Boolean,  default: true },
  parentcommentid:{type:Schema.Types.ObjectId,ref:'Comment'},
  height:Number,
  width:Number,
  status:String,
  email:String,
  name:String
});

module.exports = mongoose.model('Comment', CommentSchema);