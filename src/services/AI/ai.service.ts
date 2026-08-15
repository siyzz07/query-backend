import { GoogleGenAI } from "@google/genai";
import { IAIService } from "../../interface/service.interface/ai";
import { ICommonService } from "../../interface/service.interface/common";
import { AppError } from "../../middleware/errorHandler";
import { STATUS_CODES } from "../../constants/status";

export class AIService implements IAIService {
  private modelCache: Map<string, { models: string[]; timestamp: number }> = new Map();
  private CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache TTL
  private commonService: ICommonService;

  constructor(commonService: ICommonService) {
    this.commonService = commonService;
  }

  generateResponse = async (
    message: string,
    userApiKey?: string,
    history?: { role: string; text: string }[],
    systemInstruction?: string
  ): Promise<string> => {
    const candidateKeys = this.commonService.getCandidateKeys(userApiKey);

    if (candidateKeys.length === 0) {
      throw new AppError("Gemini API key is not available", STATUS_CODES.BAD_REQUEST);
    }

    let lastError: any = null;

    for (const apiKey of candidateKeys) {
      try {
        const availableModels = await this.getAvailableModelsCached(apiKey);

        if (availableModels.length === 0) {
          throw new AppError("No Gemini chat models available", STATUS_CODES.INTERNAL_SERVER_ERROR);
        }

        const ai = new GoogleGenAI({
          apiKey,
        });

        // Map the chat history to the format required by the Gemini API
        let contents: any;
        if (history && history.length > 0) {
          contents = history.map(h => ({
            role: h.role === "model" || h.role === "bot" ? "model" : "user",
            parts: [{ text: h.text }]
          }));

          // Make sure the last message in history is the current message
          // (if not, append it)
          const lastMsg = history[history.length - 1];
          if (lastMsg.text !== message) {
            contents.push({
              role: "user",
              parts: [{ text: message }]
            });
          }
        } else {
          contents = message;
        }

        const response = await ai.models.generateContent({
          model: availableModels[0],
          contents: contents,
          config: {
            temperature:0.2,
            systemInstruction: systemInstruction || "You are a helpful customer support assistant. Answer the user's questions in a clear, brief, and concise manner, ensuring that your response is complete and straight to the point.",
          },
        });
        return response.text ?? "";
      } catch (error: any) {
        const maskedKey = this.commonService.maskApiKey(apiKey);
        console.warn(`[AIService] Failed to generate response with API key (${maskedKey}):`, error.message || error);
        lastError = error;
      }
    }

    throw new AppError(lastError?.message || "Failed to generate response with all available API keys", STATUS_CODES.INTERNAL_SERVER_ERROR);
  };

  // Cached wrapper around getAvailableModels to avoid HTTP list call on every user query
  private getAvailableModelsCached = async (apiKey: string): Promise<string[]> => {
    const cached = this.modelCache.get(apiKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.models;
    }

    const models = await this.getAvailableModels(apiKey);
    if (models.length > 0) {
      this.modelCache.set(apiKey, { models, timestamp: now });
    }
    return models;
  };

  // Get models that can generate text responses
  private getAvailableModels = async (apiKey: string): Promise<string[]> => {
    const ai = new GoogleGenAI({
      apiKey,
    });

    const models = await ai.models.list();

    const availableModels: string[] = [];

    for await (const model of models) {
      if (
        model.name &&
        model.supportedActions?.includes("generateContent") &&
        model.name.includes("gemini") &&
        !model.name.includes("embedding") &&
        !model.name.includes("robotics") &&
        !model.name.includes("computer-use") &&
        !model.name.includes("deep-research")
      ) {
        availableModels.push(model.name.replace("models/", ""));
      }
    }

    availableModels.sort((a, b) => {
      const aVer = parseFloat(a.match(/gemini-(\d+\.\d+)/)?.[1] || "0");
      const bVer = parseFloat(b.match(/gemini-(\d+\.\d+)/)?.[1] || "0");

      if (aVer !== bVer) {
        return bVer - aVer;
      }

      const getTierScore = (name: string) => {
        // Prioritize lite models first (uses fewer tokens and is most cost-efficient)
        if (name.includes("flash-lite") || name.includes("lite")) return 3;
        if (name.includes("flash")) return 2;
        if (name.includes("pro")) return 1;
        return 0;
      };

      return getTierScore(b) - getTierScore(a);
    });

    return availableModels;
  };

/**
 * 
 *   ---------------------------------- generate embedding-------------------------------------------
 * 
 */

  generateEmbedding = async (text: string, userApiKey?: string): Promise<number[]> => {
    const candidateKeys = this.commonService.getCandidateKeys(userApiKey);

    if (candidateKeys.length === 0) {
      throw new AppError("Gemini API key is not available", STATUS_CODES.BAD_REQUEST);
    }

    let lastError: any = null;

    for (const apiKey of candidateKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: text,
        });

        if (response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
          return response.embeddings[0].values;
        }
        throw new AppError("Failed to retrieve embedding values from response", STATUS_CODES.INTERNAL_SERVER_ERROR);
      } catch (error: any) {
        const maskedKey = this.commonService.maskApiKey(apiKey);
        console.warn(`[AIService] Embedding failed with key (${maskedKey}):`, error.message || error);
        lastError = error;
      }
    }

    throw new AppError(lastError?.message || "Failed to generate embedding with all available API keys", STATUS_CODES.INTERNAL_SERVER_ERROR);
  };


/**
 * 
 *   ---------------------------------- extract text from pdf,png,jpg,jpeg,webp
 * 
 */
  extractTextFromDoc = async (
    base64Data: string,
    mimeType: string,
    userApiKey?: string
  ): Promise<string> => {
    const candidateKeys = this.commonService.getCandidateKeys(userApiKey);

    if (candidateKeys.length === 0) {
      throw new AppError("Gemini API key is not available", STATUS_CODES.BAD_REQUEST);
    }

    let cleanBase64 = base64Data;
    if (base64Data.includes(",")) {
      cleanBase64 = base64Data.split(",")[1];
    }

    let lastError: any = null;

    for (const apiKey of candidateKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType
              }
            },
            "Please extract and transcribe all readable text content from this document exactly as it is, maintaining paragraphs where possible. Output ONLY the raw text content without any comments, introduction, metadata, or markdown wrapper tags."
          ]
        });

        return response.text ?? "";
      } catch (error: any) {
        const maskedKey = this.commonService.maskApiKey(apiKey);
        console.warn(`[AIService] Document text extraction failed with key (${maskedKey}):`, error.message || error);
        lastError = error;
      }
    }

    throw new AppError(lastError?.message || "Failed to extract text from document with all available API keys", STATUS_CODES.INTERNAL_SERVER_ERROR);
  };
}
