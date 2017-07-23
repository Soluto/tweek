const { JwtStrategy, ExtractJwt } = require('passport-jwt');

const tweekApp = {
  tweek: {
    version: 1,
    friendlyName: 'tweek',
    isTweekService: true,
    permissions: '*',
  },
};

class TweekInternalStrategy extends Strategy {
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
