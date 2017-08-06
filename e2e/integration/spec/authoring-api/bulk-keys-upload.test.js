const chai = require('chai');
chai.should();
const Rx = require('rx');
const nconf = require('nconf');
const getAuthenticatedClient = require("../../utils/getAuthenticatedClient");

nconf.argv().env().defaults({
  AUTHORING_URL: 'http://localhost:4005',
  API_URL: 'http://localhost:4003',
  GIT_PRIVATE_KEY_PATH: '../../services/git-service/ssh/tweekgit'
});

let authoringApiRequest;
let tweekApiRequest;

describe('authoring api', () => {
  before(async () => {
    authoringApiRequest = await getAuthenticatedClient(nconf.get("GIT_PRIVATE_KEY_PATH"), nconf.get('AUTHORING_URL'));
    tweekApiRequest = await getAuthenticatedClient(nconf.get("GIT_PRIVATE_KEY_PATH"), nconf.get('API_URL'));
  });

  describe('/PUT /bulk-keys-upload', () => {
    it('should accept a zip file and update rules', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
        .attach('bulk', './spec/authoring-api/test-data/bulk1.zip')
      response.status.should.eql(200);
      const result = await pollTweekUntil('/api/v1/keys/test_key1?user.Country=country&user.ClientVersion=1.0.0', true);
      result.should.eql(true);
    }).timeout(5000);;

    it('should not accept an input without a zip file named bulk', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')    
      response.status.should.eql(400);
      response.text.should.eql('Required file is missing: bulk');      
    });

    it('should not accept a corrupted zip file', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .attach('bulk', './spec/authoring-api/test-data/notZip.zip')      
      response.status.should.eql(400);
      response.text.should.include('Zip is corrupted:');
    });

    it('should not accept a zip file with invalid rules', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .attach('bulk', './spec/authoring-api/test-data/invalidRules.zip')      
      response.status.should.eql(500);
    });
  });
});


const pollTweekUntil = async (url, expectedResult, maxTimeout = 30000) => {
  const getValueFromTweek = async () => {
    const tweekResponse = await tweekApiRequest.get(url);
    if (tweekResponse.body) {
      return JSON.parse(tweekResponse.body) == expectedResult;
    }
    return false;
  }
  return Rx.Observable.defer(() => getValueFromTweek())
    .repeat()
    .first(x => x === true)
    .timeout(maxTimeout)
    .toPromise()
}