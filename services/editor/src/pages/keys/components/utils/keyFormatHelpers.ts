import { KeyImplementation } from 'tweek-client';

export const validKeyFormats = ['const', 'jpad'];

export const getManifestImplementationByFormat = (format: string): KeyImplementation => {
  switch (format) {
    case 'const':
      return { type: 'const', format: undefined, value: '' };
    case 'jpad':
      return { type: 'file', format: 'jpad', value: undefined };
    default:
      throw new Error(`Invalid format ${format}`);
  }
};
