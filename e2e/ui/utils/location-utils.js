import { ClientFunction } from 'testcafe';

export const getLocation = ClientFunction(() => document.location.href);

export const refresh = ClientFunction(() => location.reload(true));
