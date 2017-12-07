import nconf from 'nconf';
const passport = require('passport');

const selectAuthenticationProviders = require('./auth/providerSelector')
  .selectAuthenticationProviders;

function addAuthSupport(server) {
  server.use(passport.initialize());
  server.use(passport.session());

  server.get('/isAuthenticated', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
  });

  const authProviders = selectAuthenticationProviders(server, nconf) || [];
  server.get('/authProviders', (req, res) => {
    res.json(authProviders.map(ap => ({ name: ap.name, url: ap.url })));
  });

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  server.use('*', (req, res, next) => {
    if (req.isAuthenticated() || req.baseUrl.startsWith('/auth/') || req.baseUrl === '/health') {
      return next();
    }
    return res.sendStatus(403);
  });
}

function addNoAuthSupport(server) {
  server.get('/isAuthenticated', (req, res) => {
    res.json({ isAuthenticated: true });
  });

  server.get('/authProviders', (req, res) => {
    res.json([]);
  });
}

module.exports = {
  addAuthSupport,
  addNoAuthSupport,
};
