'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OtpSchema = new Schema({
  IP: String,
  otp: String,
  email: { type: String, lowercase: true },
  expire_at: { type: Date },
  expire_count: {type: Number, default: 0},
  created_at: { type: Date, required: true, default: Date.now },
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Otp', OtpSchema);

