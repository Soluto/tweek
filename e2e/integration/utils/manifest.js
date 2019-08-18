const createManifestForJPadKey = (key_path) => ({
  key_path: `${key_path}`,
  meta: {
    name: 'aaaaaaa',
    tags: [],
    description: '',
    archived: false,
  },
  implementation: {
    type: 'file',
    format: 'jpad',
  },
  valueType: 'number',
  dependencies: [],
  enabled: true,
});

module.exports.createManifestForJPadKey = createManifestForJPadKey;
