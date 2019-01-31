import { expect } from 'chai';
import { waitFor } from '../utils/assertion-utils';
import { tweekClient } from './tweek-clients';

export const waitForValueToEqual = async (keyPath, expected) => {
  await waitFor(async () => {
    const result = await tweekClient.getValues(keyPath);
    expect(result).to.deep.equal(expected);
  });
};
