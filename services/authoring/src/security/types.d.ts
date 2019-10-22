declare namespace Express {
  export interface User {
    isTweekService: boolean;
    permissions: string[];
  }
}
