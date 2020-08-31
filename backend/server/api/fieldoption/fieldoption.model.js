'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FieldoptionSchema = new Schema({
  uid:{type:Schema.Types.ObjectId,ref:'User'},
  organizationid:{type:Schema.Types.ObjectId,ref:'User'},
  active: {type:Boolean,default:true},
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: Date,
  last_update_userid:{type:Schema.Types.ObjectId,ref:'User'},
  encryptedid:String,
  documentid: {type:Schema.Types.ObjectId,ref:'Document'},
  fields: [{}],
  versionid:{type:Schema.Types.ObjectId,ref:'Version'},
  templatename:String,
  istemplate: {type:Boolean,default:false},
  pageNo : Number
});

module.exports = mongoose.model('Fieldoption', FieldoptionSchema);