export interface PolicyRule {
  group: string;
  user: string;
  contexts: {};
  object: string;
  action: 'read' | 'write' | '*';
  effect: 'allow' | 'deny';
}
