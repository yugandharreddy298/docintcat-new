'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
  
  info: String,
  active: {type:Boolean,default:true},
  deptname: String,
  organizationid:{type:Schema.Types.ObjectId,ref:'User'},
  parentdepartmentid:{type:Schema.Types.ObjectId,ref:'User'},
  created_at: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model('Department', DepartmentSchema);