import nconf from 'nconf';
import session from 'express-session';

import selectAuthenticationProviders from './auth/providerSelector';

const crypto = require('crypto');
const passport = require('passport');

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

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

export const isAuthRequired = () => (nconf.get('REQUIRE_AUTH') || '').toLowerCase() === 'true';

export const authMiddleware = (req, res, next) => {
  if (isAuthRequired()) {
    return req.isAuthenticated() ? next() : res.sendStatus(403);
  } else {
    return next();
  }
};

export const initAuth = (server) => {
  if (isAuthRequired()) {
    addAuthSupport(server);
  }
  const authProviders = selectAuthenticationProviders(server, nconf) || [];
  server.get('/authProviders', (req, res) => {
    res.json(authProviders.map(ap => ({ name: ap.name, url: ap.url })));
  });
};
