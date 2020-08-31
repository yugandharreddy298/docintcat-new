'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FavoriteSchema = new Schema({
  name: String,
  filepassword:String,
  fromid:{type:Schema.Types.ObjectId,ref:'User'},
  toid: {type: Schema.Types.ObjectId, ref : 'User'},
  uid: {type: Schema.Types.ObjectId, ref : 'User'},
  fileid:{type:Schema.Types.ObjectId,ref:'Document'},
  accesstype:String,
  link:String,
  toemail:String,
  active: { type: Boolean, default:true },
  access_expirydate:Date,
  history:String,
  access:String,
  created_at: { type: Date},
  folderid:{type:Schema.Types.ObjectId,ref:'Folder'},
  updated_at:{ type: Date, required: true, default: Date.now },
  isFile:{ type: Boolean},
  isFolder:{ type: Boolean},

});

module.exports = mongoose.model('Favorite', FavoriteSchema);