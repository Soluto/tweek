import { expect } from 'chai';

export function assertIsInPage(expectedLocation, message = 'should be in correct page') {
  expect(browser.getUrl(), message).to.endWith(expectedLocation);
}
