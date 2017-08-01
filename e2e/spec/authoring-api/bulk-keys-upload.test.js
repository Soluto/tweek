const jwt = require('jsonwebtoken');
const promisify = require('bluebird').promisify;
const supertest = require('supertest');
const fs = require('fs');
const chai = require('chai');
const wait = require('wait-promise');

let should = chai.should();
const authoringApiRequest = supertest('http://localhost:4005');
const tweekApiRequest = supertest('http://localhost:4003');
const jwtSign = promisify(jwt.sign);
const readFile = promisify(fs.readFile);

const jwtOptions = {
  algorithm: 'RS256',
  issuer: 'tweek',
  expiresIn: "15m"
};
let token = {};

describe("authoring api", () => {
  before(async () => {
    const keyPath = '../services/git-service/ssh/tweekgit';
    const authKey = await readFile(keyPath);
    token = await jwtSign({}, authKey, jwtOptions);
  });

  describe("/PUT /bulk-keys-upload", () => {
    it("should accept a zip file and update rules", (done) => {
      authoringApiRequest.put('/api/bulk-keys-upload?author.name=test&author.email=test@soluto.com')
        .attach('bulk', './spec/authoring-api/test-data/bulk1.zip')
        .set("Authorization", `Bearer ${token}`)
        .then((response) => {
          response.status.should.eql(200);
          pollTweekUntil('/api/v1/keys/test_key1?user.Country=country&user.ClientVersion=1.0.0', true, 30000)
          .then((result) => {
            result.should.eql(true);
            done();
          });
        })
        .catch(done);
    });

    it("should not accept an input without a zip file named bulk", (done) => {
      authoringApiRequest.put('/api/bulk-keys-upload?name=test&email=test@soluto.com')
      .set("Authorization", `Bearer ${token}`)      
      .expect(400, done);
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

  return new Promise((resolve, reject) => {
    const intervalHandle = setInterval(async () => {
      const tweekValue = await getValueFromTweek();
      if (tweekValue === true) {
        clearInterval(intervalHandle);
        clearTimeout(timeoutHandle);
        resolve(true);
      }
    }, 1000);
    const timeoutHandle = setTimeout(() => {
      clearInterval(intervalHandle);
      resolve(false);
    }, maxTimeout);
  });
}

