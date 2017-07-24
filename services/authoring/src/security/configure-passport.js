const TweekInternalStrategy = require('./strategies/tweek-internal');
const AppCredentialsStrategy = require('./strategies/app-credentials');
const passport = require('passport');
const { getApp } = require('../apps/apps-index');
const appRepo = { get: getApp };

function configurePassport(publickey) {
  passport.use(new TweekInternalStrategy(publickey, appRepo));
  passport.use(new AppCredentialsStrategy(appRepo));
  return passport.initialize();
}

module.exports = configurePassport;
