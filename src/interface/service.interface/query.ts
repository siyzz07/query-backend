export interface IQueryService {
  // userQuery(message: string, secretKey: string): Promise<string|null>;
  userQuery(message: string, secretKey: string, history?: any[]): Promise<any>;
}
