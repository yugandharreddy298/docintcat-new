
var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var SharingpeopleSchema = new Schema({
filepassword:String,
fromid:{type:Schema.Types.ObjectId,ref:'User'},
toid: {type: Schema.Types.ObjectId, ref : 'User'},
fileid:{type:Schema.Types.ObjectId,ref:'Document'},
departmentid:{type:Schema.Types.ObjectId,ref:'Department'},
organizationid:{type:Schema.Types.ObjectId,ref:'Department'},
groupid:String,
accesstype:String,
departmentlevels:{},
orgfileviewstatus:{ type:Boolean,default:false},
toemail:String,
sharelevel: String,
active: { type: Boolean, default:true },
view:{ type: Boolean, default:false },
edit:{ type: Boolean, default:false },
comment:{ type: Boolean, default:false },
access_expirydate:Date,
history:String,
access:String,
accept: { type: Boolean, default:false },
created_at: { type: Date},
folderid:{type:Schema.Types.ObjectId,ref:'Folder'},
updated_at:{ type: Date, required: true, default: Date.now },
Download:{ type: Boolean, default:false },
Copy:{ type: Boolean, default:false },
VersionAccess:{ type: Boolean, default:false },
Chat:{ type: Boolean, default:false },
share:{ type: Boolean, default:false },
heatmaps:{ type: Boolean, default:false },
VideoRecord:{ type: Boolean, default:false },
message: String,
watermark:String,
agreetoSign:{ type:Boolean,default:false},
agreetoReview:{ type:Boolean,default:false},
pin:{type:Boolean,default:false},
revoke:{type:Boolean,default:false},
reviewed:{ type: Boolean, default:false },
signed:{ type: Boolean, default:false },
organizationShare:{ type: Boolean, default:false } , //To identify the share i.e, shared through organization or individual
fileDelete:{ type: Boolean, default:false },

});





// Public profile information


// Non-sensitive info we'll be putting in the token

/**
 * Validations
 */

// Validate empty email


// Validate empty password

/**
 * Pre-save hook
 */

/**
 * Methods
 */


  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  


module.exports = mongoose.model('sharingpeople', SharingpeopleSchema);