/* global describe, it, afterEach */
import fetchMock from 'fetch-mock';
import chai, { expect } from 'chai';
import chaiThings from 'chai-things';
import * as AuthService from './auth-service';

chai.use(chaiThings);

describe('auth-service', () => {
  afterEach(() => fetchMock.restore());

  describe('getAuthProviders', () => {
    it('should fetch /auth/providers', async () => {
      // Arrange
      const authProviders = [
        { name: 'authProvider1', url: '/auth1URL' },
        { name: 'authProvider2', url: '/auth2URL' },
      ];
      fetchMock.get('glob:*/auth/providers', authProviders);

      // Act
      const res = await AuthService.getAuthProviders();

      // Assert
      expect(res).to.deep.equal(authProviders);
    });
  });
});
