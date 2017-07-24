const TweekInternalStrategy = require('./strategies/tweek-internal');
const AppCredentialsStrategy = require('./strategies/app-credentials');
const passport = require('passport');

function configurePassport(publickey, appsRepository) {
  passport.use(new TweekInternalStrategy(publickey, appsRepository));
  passport.use(new AppCredentialsStrategy(appsRepository));
  return passport.initialize();
}

module.exports = configurePassport;
