const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');
const fetch = require('node-fetch');
const nconf = require('nconf');

describe('Secure Gateway v2 CORS tests', () => {
  const key = 'integration_tests/some_key';

  let clients;
  before(async () => {
    clients = await initClients();
  });

  it('Test GET request', async () => {
    const res = await fetch(`${nconf.get('GATEWAY_URL')}/api/v2/values/${key}`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'tweek.test.origin',
        ['Access-Control-Request-Method']: 'GET',
        ['Access-Control-Request-Headers']: 'Origin,Accept,Content-Type',
      },
    });

    expect(res).to.exist;
    expect(res.status).to.equal(200);
    expect(res.headers).to.exist;
    expect(res.headers.get('access-control-allow-credentials')).to.equal('true');
    expect(res.headers.get('access-control-allow-headers')).to.equal(
      'Origin, Accept, Content-Type',
    );
    expect(res.headers.get('access-control-allow-methods')).to.equal('GET');
    expect(res.headers.get('access-control-allow-origin')).to.equal('tweek.test.origin');
    expect(res.headers.get('access-control-max-age')).to.equal('60');
  });
});
