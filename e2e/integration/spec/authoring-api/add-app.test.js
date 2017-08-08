const chai = require('chai');
chai.should();
const {init:initClients} = require("../../utils/clients");
const delay = (duration)=> new Promise(resolve=>setTimeout(resolve,duration));

describe('authoring api', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  describe('/posts /apps/new', () => {
    it('allow creating new app with keys-read permission', async () => {
      const response = await clients.authoring.post('/api/apps?author.name=test&author.email=test@soluto.com')
                                              .send({ name: 'my-app', permissions: ['keys-read'] })
      response.status.should.eql(200);
      let {appId, appSecret} = response.body;

      const allowedRes = await clients.authoring.get('/api/keys/@integration_tests/some_key')
                                  .set({"x-client-id": appId, "x-client-secret": appSecret} )                      
                                  .unset("Authorization");
      
      allowedRes.status.should.eql(200);


      const forbiddenRes = await clients.authoring.get('/api/keys')
                                  .set({"x-client-id": appId, "x-client-secret": appSecret} )                      
                                  .unset("Authorization");

      forbiddenRes.status.should.eql(403);
    });

  });

});