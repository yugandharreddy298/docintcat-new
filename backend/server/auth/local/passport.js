var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// signin 
exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
    username: 'email',
    password: 'password' // this is the virtual field on the model
  },
    function (email, password, done) {
      var query = { $or: [{ email: email }] }
      User.findOne(query, function (err, user) {
        if (err) return done(err);
        if (!user) {
          return done(null, false, { message: 'Account does not exist. Click Sign Up to create a New Account.' });
        }
        if (user.status==false) return done(null, false, { message: 'Account is blocked, Please contact admin.' });
        if (user.authenticate(password) && user.active==true) {
          return done(null, user);
        }if(!user.authenticate(password) && user.active==true){
        return done(null, false, { message: 'Wrong Password, Try again or reset password by Forgot Password.' });
        }
        return  done(null, false, { message: 'Account Verification is pending please verify.' });
        
      });
    
    }
  ));
};
