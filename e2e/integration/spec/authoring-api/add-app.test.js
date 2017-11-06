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
                                              .expect(200);
      
      let {appId, appSecret} = response.body;

      let appClient = await clients.authoring.with(client =>
                      client.set( {"x-client-id": appId, "x-client-secret": appSecret } )
                            .unset("Authorization")
                    );

      await appClient.get('/api/keys/@integration_tests/some_key')
                    .expect(200)

      await appClient.get('/api/keys')
                            .expect(403)
    });

     it('allow creating new app with invalid permission', async () => {
      await clients.authoring.post('/api/apps?author.name=test&author.email=test@soluto.com')
                             .send({ name: 'my-app', permissions: ['admin'] })
                             .expect(400);

      await clients.authoring.post('/api/apps?author.name=test&author.email=test@soluto.com')
                             .send({ name: 'my-app', permissions: ['my-permission'] })
                             .expect(400);
      
    });

  });

});
