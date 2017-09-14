export const validKeyFormats = ['const', 'jpad'];
export const formatSuggestions = validKeyFormats.map(x => ({ label: x, value: x }));
export const isValidFormat = format => validKeyFormats.includes(format);
