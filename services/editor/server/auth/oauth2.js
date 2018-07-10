import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import jwt from 'jsonwebtoken';

module.exports = function (server, config) {
  const oauth2Strategy = new OAuth2Strategy(
    {
      scope: 'profile email openid',
      authorizationURL: config.get('AUTH_OAUTH2_AUTHORIZATION_URL'),
      tokenURL: config.get('AUTH_OAUTH2_TOKEN_URL'),
      clientID: config.get('AUTH_OAUTH2_CLIENT_ID'),
      clientSecret: config.get('AUTH_OAUTH2_CLIENT_SECRET'),
      callbackURL: config.get('AUTH_OAUTH2_CALLBACK_URL'),
    },
    (accessToken, refreshToken, params, profile, cb) => {
      const err = null;
      const decodedAccessToken = jwt.decode(accessToken) || profile;
      const decodedIdToken = jwt.decode(params.id_token);
      const upn = decodedAccessToken.upn || decodedAccessToken.user_principal_name;
      const name = decodedAccessToken.name || decodedIdToken.name;
      const displayName = decodedAccessToken.displayName ||
        (decodedIdToken && decodedIdToken.given_name && decodedIdToken.family_name) ? `${decodedIdToken.given_name} ${decodedIdToken.family_name}` : null
      const user = {
        id: upn,
        sub: decodedAccessToken.sub || decodedIdToken.sub,
        name,
        email: upn,
        displayName: displayName,
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

  const passportAuthenticateWithStateHandler = (req, res, next) => {
    const state = req.query.redirectUrl;
    return passport.authenticate('oauth2', { state })(req, res, next);
  };
  server.get('/auth/oauth2', passportAuthenticateWithStateHandler);

  const passportAuthenticateCallbackHandler = (req, res, next) => {
    res.redirect(req.query.state || '/');
  };
  server.get(
    '/auth/oauth2/callback',
    passport.authenticate('oauth2'),
    passportAuthenticateCallbackHandler,
  );

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
