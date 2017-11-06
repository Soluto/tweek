import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const tweekApp = {
  version: '1',
  name: 'tweek',
  isTweekService: true,
  permissions: '*',
};

export default class TweekInternalStrategy extends JwtStrategy {
  readonly name = 'tweek-internal';
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
  }
}
