import jwt from 'jsonwebtoken';

import chai, { expect } from 'chai';
import chaiThings from 'chai-things';
import getOauth2User from '../../../../server/utils/get-oauth2-user';
chai.use(chaiThings);

describe('getOauth2User', () => {
  beforeEach(
    () =>
      (jwt.decode = jest.fn((token) => {
        switch (token) {
        case 'accessToken':
          return {
            user_principal_name: 'JOHN.DOE@DOMAIN.COM',
          };

        case 'idToken':
          return {
            sub: '123456',
            name: 'Doe, John',
            given_name: 'John',
            family_name: 'Doe',
          };
        }
      })),
  );

  afterEach(() => jest.unmock('jsonwebtoken'));

  it('should properly decode a user from the access token, id token, and profile', () => {
    const user = getOauth2User('accessToken', { id_token: 'idToken' }, {});
    expect(user).to.deep.equal({
      id: 'JOHN.DOE@DOMAIN.COM',
      sub: '123456',
      name: 'Doe, John',
      email: 'JOHN.DOE@DOMAIN.COM',
      displayName: 'John Doe',
    });
  });
});
