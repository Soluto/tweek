const createManifestForJPadKey = (key_path, name = 'aaaaaa') => ({
  key_path: `${key_path}`,
  meta: {
    name: name,
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