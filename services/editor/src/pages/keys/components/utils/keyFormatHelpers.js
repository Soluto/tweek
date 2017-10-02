export const validKeyFormats = ['const', 'jpad'];

export const getManifestImplementationByFormat = (format) => {
  switch(format) {
  case 'const':
    return ({ type: 'const', format: undefined, value: '' });
  case 'jpad':
    return ({ type: 'file', format: 'jpad', value: undefined });
  default:
    console.error(`Invalid format ${format}`);
  }
};
