'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OnlineuserSchema = new Schema({
  name: String,
  uid: {type: Schema.Types.ObjectId, ref : 'User'},
  fileid:{type:Schema.Types.ObjectId,ref:'Document'},
  viewStatus:Boolean,
  active: Boolean,
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: Date,
  endTime:Date,
  email:String
});

module.exports = mongoose.model('Onlineuser', OnlineuserSchema);