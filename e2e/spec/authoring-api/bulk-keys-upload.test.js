const jwt = require('jsonwebtoken');
const promisify = require('bluebird').promisify;
const supertest = require('supertest');
const fs = require('fs');
const chai = require('chai');
const Rx = require('rx');

let should = chai.should();
const authoringApiRequest = supertest('http://localhost:4005');
const tweekApiRequest = supertest('http://localhost:4003');
const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: '15m'
};
let token = {};

describe('authoring api', () => {
  before(async () => {
    const keyPath = '../services/git-service/ssh/tweekgit';
    const authKey = await readFile(keyPath);
    token = await jwtSign({}, authKey, jwtOptions);
  });

  describe('/PUT /bulk-keys-upload', () => {
    it('should accept a zip file and update rules', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
        .attach('bulk', './spec/authoring-api/test-data/bulk1.zip')
        .set('Authorization', `Bearer ${token}`);
      response.status.should.eql(200);
      const result = await pollTweekUntil('/api/v1/keys/test_key1?user.Country=country&user.ClientVersion=1.0.0', true);
      result.should.eql(true);
    });

    it('should not accept an input without a zip file named bulk', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .set('Authorization', `Bearer ${token}`)      
      response.status.should.eql(400);
      response.text.should.eql('Required file is missing: bulk');      
    });

    it('should not accept a corrupted zip file', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .attach('bulk', './spec/authoring-api/test-data/notZip.zip')      
      .set('Authorization', `Bearer ${token}`)
      response.status.should.eql(400);
      response.text.should.include('Zip is corrupted:');
    });

    it('should not accept a zip file with invalid rules', async () => {
      const response = await authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
      .attach('bulk', './spec/authoring-api/test-data/invalidRules.zip')      
      .set('Authorization', `Bearer ${token}`)
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
  return Rx.Observable
  .interval(1000)
  .concatMap(_ => getValueFromTweek())
  .filter(x => x == true)
  .first()
  .timeout(maxTimeout, Rx.Observable.just(false))
  .toPromise();
}
