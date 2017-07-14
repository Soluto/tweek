import passport from 'passport';
import GoogleOauth2Strategy from 'passport-google-oauth20';

module.exports = function (server, config) {
  const strategyParams = {
    clientID: config.get('AUTH_GOOGLE_CLIENT_ID'),
    clientSecret: config.get('AUTH_GOOGLE_CLIENT_SECRET'),
    callbackURL: config.get('AUTH_GOOGLE_CALLBACK_URL'),
  };

  const scope = ['profile', 'email'];
  // this is very important to specify, otherwise untrusted person with Google Account can log in
  const hostedDomain = config.get('AUTH_GOOGLE_HOSTED_DOMAIN');
  const verify = (accessToken, refreshToken, profile, done) => {
    // this check is very important in order to prevent users of other domains from logging in
    if (hostedDomain && profile._json.domain !== hostedDomain) {
      done(
        JSON.stringify({
          error: 'invalid domain',
          expected: hostedDomain,
          actual: profile._json.domain,
        }),
        null,
      );
      return;
    }

    const user = {
      id: profile.id,
      sub: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      displayName: profile.displayName,
    };
    done(null, user);
  };

  passport.use(new GoogleOauth2Strategy(strategyParams, verify));

  server.get('/auth/google', passport.authenticate('google', { scope, hostedDomain }));

  server.get(
    '/auth/google/callback',
    passport.authenticate('google', { scope, hostedDomain }),
    (req, res) => res.redirect('/'),
  );

  return {
    url: '/auth/google',
    name: 'Google Account',
  };
};
