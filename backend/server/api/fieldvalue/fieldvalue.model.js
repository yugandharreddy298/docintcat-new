'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var FieldvalueSchema = new Schema({
    active: { type: Boolean, default: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: Date,
    last_update_userid: { type: Schema.Types.ObjectId, ref: 'User' },
    encryptedid: String,
    documentid: { type: Schema.Types.ObjectId, ref: 'Document' },
    insertedemail: String,
    dateformats: String,
    type: String,
    value: String,
    id: String,
    fieldtype: String,
    people: String,
    active: Boolean,
    path: String,
    size: String,
    uid: { type: Schema.Types.ObjectId, ref: 'User' },
    organizationid: { type: Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    last_update_userid: { type: Schema.Types.ObjectId, ref: 'User' },
    folderid: { type: Schema.Types.ObjectId, ref: 'Folder' },
    isFile: { type: Boolean, default: true },
    encryptedid: String,
    signaturebaseData: { type: String },
    type: String,
    fontText: String,
    fontStyle: String,
    signatureType: String,
    photoType: String,
    stampType: String,
    signatureId: { type: Schema.Types.ObjectId, ref: 'Signature' },
    photoId: { type: Schema.Types.ObjectId, ref: 'Photo' },
    stampId: { type: Schema.Types.ObjectId, ref: 'Stamp' },
    longitude: Number,
    latitude: Number,
    fontsize:String
});

module.exports = mongoose.model('Fieldvalue', FieldvalueSchema);