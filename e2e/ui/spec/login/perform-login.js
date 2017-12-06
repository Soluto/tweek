import { expect } from 'chai';

describe.only('perform login', () => {
  before(() => {
    browser.url('/login').windowHandleSize({ width: 2000, height: 1000 });
  });

  it('should show all auth providers', () => {});
});
