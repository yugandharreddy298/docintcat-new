'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  toid: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
  sharingPeopleId: { type: Schema.Types.ObjectId, ref: 'sharingpeople'},
  fromid: { type: Schema.Types.ObjectId, ref: 'User' },
  read: {type: Boolean, default: false},
  created_at: { type: Date, required: true, default: Date.now },
  documentid: {type:Schema.Types.ObjectId,ref:'Document'},
  folderid : {type:Schema.Types.ObjectId,ref:'Folder'},
  type:String,
  active: {type:Boolean,default:true},
  fromemail:String,
  toemail:String

});

module.exports = mongoose.model('Notification', NotificationSchema);