'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinksSchema = new Schema({
  email: String,
  expire_at:Date,
  created_at: { type: Date, required: true, default: Date.now },
  info: String,
  active: {type:Boolean,default:true},
  fromid:{type:Schema.Types.ObjectId,ref:'User'},
  toid:{type:Schema.Types.ObjectId,ref:'User'},
  shareddocumentid:{type:Schema.Types.ObjectId,ref:'sharingpeople'},
},{timestamps:true});

module.exports = mongoose.model('Links', LinksSchema);