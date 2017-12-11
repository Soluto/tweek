/* global describe, it, before, after, beforeEach, afterEach */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const buildRulesArtifact = require('../src/build-rules-artifiact');

chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();

function getFiles(filesToRead) {
  return Object.keys(filesToRead).map(name => ({
    name,
    read: async () => JSON.stringify(filesToRead[name]),
  }));
}

describe('build rules artifact', () => {
  it('should succeed building artifact', () => {
    const filesToRead = {
      'manifests/file/jpad': {
        key_path: 'file/jpad',
        dependencies: ['dependency'],
        implementation: {
          type: 'file',
          format: 'jpad',
        },
      },
      'implementations/jpad/file/jpad.jpad': 'file-content',
      'manifests/const': {
        key_path: 'const',
        dependencies: [],
        implementation: {
          type: 'const',
          value: 'some-value',
        },
      },
      'manifests/link': {
        key_path: 'link',
        dependencies: ['wrong_dep'],
        implementation: {
          type: 'link',
          key: 'some_key',
        },
      },
    };
    const files = getFiles(filesToRead);
    const expectedArtifact = {
      'file/jpad': {
        format: 'jpad',
        payload: JSON.stringify('file-content'),
        dependencies: ['dependency'],
      },
      const: {
        format: 'const',
        payload: JSON.stringify('some-value'),
        dependencies: [],
      },
      link: {
        format: 'link',
        payload: 'some_key',
        dependencies: ['some_key'],
      },
    };
    const artifacts = buildRulesArtifact(files);

    return expect(artifacts).to.eventually.deep.equal(expectedArtifact);
  });

  it('should fail building artifact', async () => {
    const filesToRead = {
      'manifests/file/jpad': {
        key_path: 'file/jpad',
        dependencies: [],
        implementation: {
          type: 'file',
          format: 'jpad',
        },
      },
    };
    const files = getFiles(filesToRead);
    const artifacts = buildRulesArtifact(files);
    return artifacts.should.be.rejected;
  });
});
