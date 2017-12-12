import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import jwt from 'jsonwebtoken';

const redirectHandler = (req, res) => res.redirect(req.query.state || '/');

module.exports = function (server, config) {
  const oauth2Strategy = new OAuth2Strategy(
    {
      scope: 'profile email',
      authorizationURL: config.get('AUTH_OAUTH2_AUTHORIZATION_URL'),
      tokenURL: config.get('AUTH_OAUTH2_TOKEN_URL'),
      clientID: config.get('AUTH_OAUTH2_CLIENT_ID'),
      clientSecret: config.get('AUTH_OAUTH2_CLIENT_SECRET'),
      callbackURL: config.get('AUTH_OAUTH2_CALLBACK_URL'),
    },
    (accessToken, refreshToken, profile, cb) => {
      const err = null;
      const decodedToken = jwt.decode(accessToken) || profile;
      const user = {
        id: decodedToken.upn,
        sub: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.upn,
        displayName: decodedToken.displayName,
      };
      const info = accessToken;
      return cb(err, user, info);
    },
  );

  // by default it doesn't propagate the parameters, so we override it here and add resource id
  oauth2Strategy.authorizationParams = options => ({
    ...options,
    resource: config.get('AUTH_OAUTH2_RESOURCE_ID'),
  });

  server.get('/auth/oauth2', passport.authenticate('oauth2'));
  server.get('/auth/oauth2/callback', passport.authenticate('oauth2'), redirectHandler);

  passport.use(oauth2Strategy);
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  return {
    url: '/auth/oauth2',
    name: 'OAuth2',
  };
};
