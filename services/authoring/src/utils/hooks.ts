export interface Hook {
  type: string;
  url: string;
}

export interface KeyHooks {
  keyPath: string;
  hooks: Hook[];
}
