import passport from 'passport';
import { DigestStrategy } from 'passport-http';

module.exports = function (server, config) {
  const givenUser = config.get('AUTH_DIGEST_USER');
  const givenPassword = config.get('AUTH_DIGEST_PASSWORD');
  const givenCreds = config.get('AUTH_DIGEST_CREDENTIALS');
  const strategyParams = {
    realm: 'Tweek Editor',
    qop: 'auth', // Reference: https://github.com/jaredhanson/passport-http/blob/f66dfce9538a302e8c4706c77dd82374c5bfac22/lib/passport-http/strategies/digest.js#L31
  };

  const creds = new Map(
          [...(givenUser ? [[givenUser, givenPassword]] : []),
           ...(givenCreds || []).split(';').map(x=> x.split(":"))
          ])

  const validate = (user, done) => {
    if (creds.has(user)) {
      const userObject = {
        id: user,
        sub: user,
        name: user,
        email: user,
        displayName: user,
      };
      done(null, userObject, creds.get(user));
    } else {
      done(null, false);
    }
  };

  passport.use(new DigestStrategy(strategyParams, validate));

  server.get('/auth/digest', passport.authenticate('digest', { session: true }), (req, res) =>
    res.redirect('/'),
  );

  return {
    url: '/auth/digest',
    name: 'Username and password (Digest Authentication)',
  };
};
