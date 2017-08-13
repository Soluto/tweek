import chai, { expect } from 'chai';
chai.use(require('chai-string'));

export default class PageAsserts {
  static assertIsInPage(expectedLocation, message = 'should be in correct page') {
    expect(browser.getUrl()).to.endWith(expectedLocation);
  }
}
