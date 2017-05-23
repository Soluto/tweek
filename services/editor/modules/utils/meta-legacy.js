import R from 'ramda';

function getAllGroups(str, pattern, groupIndex) {
  const regex = new RegExp(pattern, 'g');
  const result = [];
  let match;

  while (match = regex.exec(str)) {
    result.push(match[groupIndex]);
  }

  return result;
}

export function convertMetaToNewFormat(keyPath, { keyDef, meta }) {
  if (!meta || meta.meta) return meta;

  return {
    key_path: keyPath,
    meta: {
      name: meta.displayName,
      tags: meta.tags,
      description: meta.description,
      readOnly: meta.readOnly,
      archived: false,
    },
    implementation: {
      type: 'file',
      format: keyDef.type,
    },
    valueType: meta.valueType,
    dependencies: keyDef ? R.uniq(getAllGroups(keyDef.source, /"(?:@@key:|keys\.)(.+?)"/, 1)) : [],
    enabled: true,
  };
}
