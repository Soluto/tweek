const chai = require('chai');
const expect = chai.expect;
chai.should();
const {init:initClients} = require("../../utils/clients");
const {pollUntil} = require("../../utils/utils");

describe('authoring api', () => {
  let clients;
  before(async () => {
    clients = await initClients();
  });

  describe('/PUT /bulk-keys-upload', () => {
    it('should accept a zip file and update rules', async () => {
      const response = await clients.authoring.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
        .attach('bulk', './spec/authoring-api/test-data/bulk1.zip')
      response.status.should.eql(204);
      await pollUntil(()=> clients.api.get('/api/v1/keys/test_key1?user.Country=country&user.ClientVersion=1.0.0'), 
                            res=> expect(JSON.parse(res.body)).to.eql(true))
    });

    it('should not accept an input without a zip file named bulk', async () => {
      const response = await clients.authoring.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')    
      response.status.should.eql(400);
      response.text.should.eql('Required file is missing: bulk');      
    });

    it('should not accept a corrupted zip file', async () => {
      const response = await clients.authoring.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .attach('bulk', './spec/authoring-api/test-data/notZip.zip')      
      response.status.should.eql(400);
      response.text.should.include('Zip is corrupted:');
    });

    it('should not accept a zip file with invalid structure', async () => {
      const response = await clients.authoring.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .attach('bulk', './spec/authoring-api/test-data/invalidStructure.zip')      
      response.status.should.eql(400);
    });

    it('should not accept a zip file with invalid rules', async () => {
      const response = await clients.authoring.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .attach('bulk', './spec/authoring-api/test-data/invalidRules.zip')      
      response.status.should.eql(500);
    });
  });
});

