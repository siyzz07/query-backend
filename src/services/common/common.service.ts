import { ICommonService } from "../../interface/service.interface/common";

export class CommonService implements ICommonService {
  maskApiKey = (key: string): string => {
    if (!key) return "";
    if (key.length <= 10) return "***";
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  };

  getEnvApiKeys = (): string[] => {
    const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    if (!keysStr) return [];

    if (keysStr.trim().startsWith("[") && keysStr.trim().endsWith("]")) {
      try {
        const parsed = JSON.parse(keysStr);
        if (Array.isArray(parsed)) {
          return parsed.map((k: any) => String(k).trim()).filter(k => k.length > 0);
        }
      } catch (e) {
        // Fallback to normal parsing
      }
    }

    return keysStr
      .split(/[,;\n\s]+/)
      .map(key => key.trim())
      .filter(key => key.length > 0);
  };

  getCandidateKeys = (userApiKey?: string): string[] => {
    const envKeys = this.getEnvApiKeys();
    if (userApiKey) {
      const userKeys = userApiKey
        .split(/[,;\n\s]+/)
        .map(key => key.trim())
        .filter(key => key.length > 0);
      return [...userKeys, ...envKeys];
    }
    return envKeys;
  };
}
