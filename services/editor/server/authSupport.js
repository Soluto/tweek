import nconf from 'nconf';
import session from 'express-session';
const passport = require('passport');
const crypto = require('crypto');

const selectAuthenticationProviders = require('./auth/providerSelector')
  .selectAuthenticationProviders;

const addAuthSupport = (server) => {
  const cookieOptions = {
    secret: nconf.get('SESSION_COOKIE_SECRET_KEY') || crypto.randomBytes(20).toString('base64'),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  };
  server.use(session(cookieOptions));

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
};

const addNoAuthSupport = (server) => {
  server.get('/isAuthenticated', (req, res) => {
    res.json({ isAuthenticated: true });
  });

  server.get('/authProviders', (req, res) => {
    res.json([]);
  });
};

export const authMiddleware = (req, res, next) => {
  if ((nconf.get('REQUIRE_AUTH') || '').toLowerCase() === 'true') {
    return req.isAuthenticated() ? next() : res.sendStatus(403);
  } else {
    return next();
  }
};

export const initAuth = (server) => {
  if ((nconf.get('REQUIRE_AUTH') || '').toLowerCase() === 'true') {
    addAuthSupport(server);
  } else {
    addNoAuthSupport(server);
  }
};
