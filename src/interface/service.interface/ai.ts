export interface IAIService {
  generateResponse(message: string, userApiKey?: string, history?: { role: string; text: string }[], systemInstruction?: string): Promise<string>;
  generateEmbedding(text: string, userApiKey?: string): Promise<number[]>;
  extractTextFromDoc(base64Data: string, mimeType: string, userApiKey?: string): Promise<string>;
}
