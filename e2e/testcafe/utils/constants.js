import nconf from 'nconf';

nconf
  .argv()
  .env()
  .defaults({
    GATEWAY_URL: 'http://localhost:8080',
    EDITOR_URL: 'http://localhost:3000/',
  });

const trimEnd = (str) => str.replace(/\/+$/, '');

export const gatewayUrl = trimEnd(nconf.get('GATEWAY_URL'));
export const editorUrl = trimEnd(nconf.get('EDITOR_URL'));
