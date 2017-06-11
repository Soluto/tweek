import passport from 'passport';
import { DigestStrategy } from 'passport-http';

module.exports = function (server, config) {
  const givenUser = config.get('AUTH_DIGEST_USER');
  const givenPassword = config.get('AUTH_DIGEST_PASSWORD');
  const strategyParams = {
    realm: 'Tweek Editor',
    qop: 'auth', // Reference: https://github.com/jaredhanson/passport-http/blob/f66dfce9538a302e8c4706c77dd82374c5bfac22/lib/passport-http/strategies/digest.js#L31
  };

  const validate = (user, done) => {
    if (user === givenUser) {
      const userObject = {
        id: givenUser,
        sub: givenUser,
        name: givenUser,
        email: givenUser,
        displayName: givenUser,
      };
      done(null, userObject, givenPassword);
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
