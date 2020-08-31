'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  IP: String,
  message: String,
  type: String,
  read: { type: Boolean, required: true, default: false },
  from: {type: Schema.Types.ObjectId, ref : 'User'},
  to: {type: Schema.Types.ObjectId, ref : 'User'},
  documentid: {type:Schema.Types.ObjectId,ref:'Document'},
  created_at: { type: Date, required: true, default: Date.now },
  email:String
});

module.exports = mongoose.model('Chat', ChatSchema);