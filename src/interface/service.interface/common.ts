export interface ICommonService {
  maskApiKey(key: string): string;
  getEnvApiKeys(): string[];
  getCandidateKeys(userApiKey?: string): string[];
}
