export default interface Hook {
  id?: string;
  keyPath: string;
  type: string;
  url: string;
  tags?: string[];
  format?: string;
}
