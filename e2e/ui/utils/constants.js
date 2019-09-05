import nconf from 'nconf';

nconf
  .argv()
  .env()
  .defaults({
    GATEWAY_URL: 'http://localhost:8081',
    EDITOR_URL: 'http://localhost:8081/',
  });

const trimEnd = (str) => str.replace(/\/+$/, '');

export const gatewayUrl = trimEnd(nconf.get('GATEWAY_URL'));
export const editorUrl = trimEnd(nconf.get('EDITOR_URL'));
