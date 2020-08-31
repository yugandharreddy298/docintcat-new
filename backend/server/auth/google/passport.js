var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// signin or signup through gmail
exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
     function(accessToken, refreshToken, profile, done) {
     console.log(accessToken)
      User.findOne({
        'email': profile.emails[0].value
      }, function(err, user) {
        if (err) return done(err);
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            type:'individual',
            username: profile.username,
            provider: 'google',
            new : true,
            active: true,
            google: profile._json,
          });
          user.save(function(err) {
          if (err) return done(err);
            done(err, user);
          });
        } else {
          if (user.status == false) return done(null, false, { message: 'Account is blocked, Please contact admin.' });
          if (user.active == true) return done(null, user);
          else return done(null, false, { message: 'Account Verification is pending please verify.' });
        }
      });
    }
  ));
};
