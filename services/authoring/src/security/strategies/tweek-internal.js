const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const tweekApp = {
  version: '1',
  name: 'tweek',
  isTweekService: true,
  permissions: '*',
};

class TweekInternalStrategy extends JwtStrategy {
  constructor(publicKey, appsRepo) {
    super(
      {
        secretOrKey: publicKey,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      },
      (jwt_payload, done) => done(tweekApp),
    );
    this.name = 'tweek-internal';
  }
}

module.exports = TweekInternalStrategy;
