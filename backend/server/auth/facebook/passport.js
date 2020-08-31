var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
// signin or signup through facebook
exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({$or:[{'facebook.id': profile.id},{email: profile._json.email}]},
      function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile._json.email,
            role: 'user',
            active: true,
            type:'individual',
            new : true,
            username: profile.username,
            provider: 'facebook',
            facebook: profile._json
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
      })
    }
  ));
};
