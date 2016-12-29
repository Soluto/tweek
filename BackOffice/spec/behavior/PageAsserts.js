import assert from 'assert';

export default class PageAsserts {

  constructor(keysPageObject) {
    this.keysPageObject = keysPageObject;
  }

  assertIsInPage(expectedLocation, message = 'should be in correct page') {
    const location = this.keysPageObject.getUrlLocation();
    assert(location === expectedLocation ||
      location === expectedLocation + '?', message);
  }
}
