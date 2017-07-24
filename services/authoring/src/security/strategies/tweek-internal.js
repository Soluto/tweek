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
        issuer: 'tweek',
        algorithms: ['RS256'],
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      },
      (jwt_payload, done) => done(null, tweekApp),
    );
    this.name = 'tweek-internal';
  }

  success(e) {
    console.log('success');
    super.success(e);
  }

  error(e) {
    console.log('error');
    console.log(e);
    super.error(e);
  }

  fail(er) {
    console.log('failed auth');
    console.log(er);
    super.fail(er);
  }

  authenticate(req, options) {
    console.log('authenticating');
    console.log(req.get('Authorization'));
    try {
      return super.authenticate(req, options);
    } catch (ex) {
      console.log('errr');
      console.log(ex);
    }
  }
}

module.exports = TweekInternalStrategy;
