'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FolderSchema = new Schema({
  name: String,
  parentid:{type:Schema.Types.ObjectId,ref:'Folder'},
  userid:{type:Schema.Types.ObjectId,ref:'User'},
  createdAt: { type: Date, required: true, default: Date.now },
  updated_at: Date,
  active: {type:Boolean,default:true},
  isFolder:{ type: Boolean,  default: true },
  nameCount:{type:Number,default:0},
  isSent:{ type: Boolean,  default: false }

},{timestamps:true});

module.exports = mongoose.model('Folder', FolderSchema);