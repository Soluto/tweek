import { dataComp } from './selector-utils';

export const credentials = {
  username: 'admin-app',
  password: '8v/iUG0vTH4BtVgkSn3Tng==',
};

export const login = async (t) => {
  await t.click(dataComp('Basic Auth Login'));
};
