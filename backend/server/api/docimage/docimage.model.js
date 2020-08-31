'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DocimageSchema = new Schema({
  pageNo: Number,
  path: String,
  documentid:{type:Schema.Types.ObjectId,ref:'Document'},
  active: {type:Boolean,default:true},
  originalImg: {type:Boolean,default:true},
  versionid:{type:Schema.Types.ObjectId,ref:'Version'},
  created_at: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Docimage', DocimageSchema);