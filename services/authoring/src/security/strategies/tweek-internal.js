const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const tweekApp = {
  version: '1',
  name: 'tweek',
  isTweekService: true,
  permissions: '*',
};

class TweekInternalStrategy extends JwtStrategy {
  constructor(publicKey) {
    super(
      {
        secretOrKey: publicKey,
        issuer: 'tweek',
        algorithms: ['RS256'],
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      },
      (jwt_payload, done) => done(null, tweekApp),
    );
    this.name = 'tweek-internal';
  }

  authenticate(req, options) {
    try {
      return super.authenticate(req, options);
    } catch (ex) {
      console.log('errr');
      console.log(ex);
    }
  }
}

module.exports = TweekInternalStrategy;
