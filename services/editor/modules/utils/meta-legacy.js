import R from 'ramda';

function getAllGroups(str, pattern, groupIndex) {
  const regex = new RegExp(pattern, 'g');
  const result = [];
  let match;

  while ((match = regex.exec(str))) {
    result.push(match[groupIndex]);
  }

  return result;
}

export function convertMetaToNewFormat(keyPath, { keyDef, manifest }) {
  if (!manifest || manifest.meta) return manifest;

  return {
    key_path: keyPath,
    meta: {
      name: manifest.displayName,
      tags: manifest.tags,
      description: manifest.description,
      readOnly: manifest.readOnly,
      archived: false,
    },
    implementation: {
      type: 'file',
      format: keyDef.type,
    },
    valueType: manifest.valueType,
    dependencies: keyDef ? R.uniq(getAllGroups(keyDef.source, /"(?:@@key:|keys\.)(.+?)"/, 1)) : [],
    enabled: true,
  };
}
