// signin or signup through twitter
exports.setup = function (User, config) {
  var passport = require('passport');
  var TwitterStrategy = require('passport-twitter').Strategy;

  passport.use(new TwitterStrategy({
    consumerKey: config.twitter.clientID,
    consumerSecret: config.twitter.clientSecret,
    callbackURL: config.twitter.callbackURL,
    includeEmail: true,
  },
    function (token, tokenSecret, profile, done) {
      User.findOne({$or:[{'twitter.id_str': profile.id},{email: profile._json.email}]}, function (err, user) {
        if (err) {
          return done(err);
        }
        console.log("twitter",profile)
        if (!user) {
          user = new User({
            name: profile.displayName,
            username: profile.username,
            email: profile._json.email,
            role: 'user',
            type:'individual',
            new : true,
            provider: 'twitter',
            active: true,
            twitter: profile._json
          });
          user.save(function (err) {
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
