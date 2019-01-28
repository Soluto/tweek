import { ClientFunction } from 'testcafe';

export const getLocation = ClientFunction(() => document.location.href);
