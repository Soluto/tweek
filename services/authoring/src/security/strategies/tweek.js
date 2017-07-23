const { JwtStrategy, ExtractJwt } = require('passport-jwt');

class TweekInternalStrategy extends Strategy {
  constructor(publicKey, appsRepo) {
    super({
      secretOrKey: publicKey,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    });
    this.name = 'tweek-internal';
  }
}
