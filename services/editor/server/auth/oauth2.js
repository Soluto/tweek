import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import jwt from 'jsonwebtoken';

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
    (accessToken, refreshToken, params, profile, cb) => {
      const decodedAccessToken = jwt.decode(accessToken) || profile;

      const user = {
        id: decodedAccessToken.upn,
        sub: decodedAccessToken.sub,
        name: decodedAccessToken.name,
        email: decodedAccessToken.upn,
        displayName: decodedAccessToken.displayName,
      };
      const info = accessToken;
      const allowedGroupsStr = config.get('AUTH_OAUTH2_ALLOWED_GROUPS');
      const allowedGroups = allowedGroupsStr ? allowedGroupsStr.split(',') : undefined;
      
      if (allowedGroups) {
        const idToken = params.id_token;
        const decodedIdToken = jwt.decode(idToken);

        if (!decodedIdToken) {
          return cb(new Error(`Invalid ID token ${idToken}`));
        }
        
        const groups = decodedIdToken.groups;

        if (!groups) {
          return cb(new Error('No groups defined in ID token'));
        }

        let inAllowedGroup = false;

        for (let group of groups) {
          if (allowedGroups.includes(group)) {
            inAllowedGroup = true;
            break;
          }
        }

        if (!inAllowedGroup) {
          return cb(new Error(`User not in one of the allowed groups: ${allowedGroups.join(', ')}`));
        }
      }

      return cb(null, user, info);
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
