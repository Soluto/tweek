const { expect } = require('chai');
const { init: initClients } = require('../../utils/clients');

describe('Secure Gateway', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });
});
