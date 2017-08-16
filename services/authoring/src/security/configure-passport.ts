const TweekInternalStrategy = require('./strategies/tweek-internal');
const AppCredentialsStrategy = require('./strategies/app-credentials');
const passport = require('passport');

export default function configurePassport(publickey, appsRepository) {
  passport.use(new TweekInternalStrategy(publickey));
  passport.use(new AppCredentialsStrategy(appsRepository));
  return passport.initialize();
}
