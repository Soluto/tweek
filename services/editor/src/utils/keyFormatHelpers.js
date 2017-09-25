export const validKeyFormats = ['const', 'jpad'];
export const formatSuggestions = validKeyFormats.map(x => ({ label: x, value: x }));
export const isValidFormat = format => validKeyFormats.includes(format);
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