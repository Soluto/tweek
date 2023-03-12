export type KeyImplementation = {
  format?: string;
  type: string;
  key?: string;
  [s: string]: unknown;
};

export type KeyMetadata = {
  name: string;
  description: string;
  readOnly?: boolean;
  archived?: boolean;
  tags?: string[];
};

export type KeyManifest = {
  key_path: string;
  meta: KeyMetadata;
  implementation: KeyImplementation;
  valueType: string;
  dependencies: string[];
};
