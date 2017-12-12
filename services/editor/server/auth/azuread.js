import passport from 'passport';
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

module.exports = function (server, config, redirectHandler) {
  const oidcStrategy = new OIDCStrategy(
    {
      identityMetadata: 'https://login.microsoftonline.com/common/.well-known/openid-configuration',
      clientID: config.get('AUTH_AZUREAD_CLIENT_ID'),
      clientSecret: config.get('AUTH_AZUREAD_CLIENT_SECRET'),
      skipUserProfile: true,
      allowHttpForRedirectUrl: true,
      loggingLevel: 'info',
      responseType: 'code',
      responseMode: 'query',
      validateIssuer: false,
      scope: ['profile', 'email'],
      redirectUrl: config.get('AUTH_AZUREAD_CALLBACK_URL'),
    },
    (token, done) =>
      done(
        null,
        {
          id: token.upn,
          sub: token.sub,
          name: token.name,
          email: token.upn,
          displayName: token.displayName,
        },
        token,
      ),
  );

  server.get('/auth/openid', passport.authenticate('azuread-openidconnect'));
  server.get(
    '/auth/openid/callback',
    passport.authenticate('azuread-openidconnect'),
    redirectHandler,
  );

  passport.use(oidcStrategy);

  return {
    url: '/auth/openid',
    name: 'Azure open id connect',
  };
};
