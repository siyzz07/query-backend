import { IUserRepository } from '../../interface/repository.interface/user.repository';
import { IDocumentChunkRepository } from '../../interface/repository.interface/documentChunk.repository';
import { IAIService } from '../../interface/service.interface/ai';
import { IQueryService } from '../../interface/service.interface/query';
import { MESSAGES } from '../../constants/messages';

export class QueryService implements IQueryService {

     private UserRepository :IUserRepository
     private AIService :IAIService
     private documentChunkRepository: IDocumentChunkRepository

    constructor(userRepository :IUserRepository, aiService: IAIService, documentChunkRepository: IDocumentChunkRepository){
       this.UserRepository = userRepository
       this.AIService = aiService
       this.documentChunkRepository = documentChunkRepository
     }
     
      userQuery = async (message: string, secretKey: string, history?: any[]): Promise<any> => {
        const User =  await this.UserRepository.findBySecretKey(secretKey);
        if(!User){
           return { error: true, message: MESSAGES.QUERY.INVALID_SECRET_KEY };
        }

        const botName = User.botName || "QuickBot";
        const botRole = User.botRole || "a friendly customer support agent";
        const companyName = User.companyName || "QuickKicks Shoe Store";
        const primaryGoal = User.primaryGoal || "Help users check order statuses, shipping information, and return policies.";
        const toneOfVoice = User.toneOfVoice || "polite, energetic, and helpful.";
        const allowedTopics = User.allowedTopics || "QuickKicks products, shoe sizing, delivery times, and returns.";
        const forbiddenTopics = User.forbiddenTopics || "other shoe brands, general news, or personal advice.";
        const fallbackMessage = User.fallbackMessage || "I am not sure about that. Please email support@quickkicks.com for more help.";
        const maxLengthSentences = User.maxLengthSentences || 3;
        const preferredLanguage = User.preferredLanguage || "English";

        let systemInstruction = `You are ${botName}, a ${botRole} for ${companyName}.

Goal: ${primaryGoal}

Rules & Boundaries:

Tone: Be ${toneOfVoice}

Allowed Topics: Only answer questions about ${allowedTopics}

Forbidden Topics: Politely decline to answer questions about ${forbiddenTopics}

Fallback: If you do not know the answer, say: "${fallbackMessage}".

Formatting Rules:

Keep responses under ${maxLengthSentences} sentences.

Always answer in ${preferredLanguage}.`;

        console.log('[DEBUG QueryService] Fetched User:', {
          email: User.email,
          botName: User.botName,
          botRole: User.botRole,
          companyName: User.companyName,
        });

        try {
          const chunks = await this.documentChunkRepository.find({ secretKey });

          if (chunks && chunks.length > 0) {
            let queryEmbedding: number[];
            try {
              queryEmbedding = await this.AIService.generateEmbedding(message, User.apiKey);
            } catch (embedErr: any) {
              console.error("[QueryService] Failed to generate query embedding:", embedErr.message || embedErr);
              queryEmbedding = [];
            }

            if (queryEmbedding && queryEmbedding.length > 0) {
              const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
                let dotProduct = 0.0;
                let normA = 0.0;
                let normB = 0.0;
                const length = Math.min(vecA.length, vecB.length);
                for (let i = 0; i < length; i++) {
                  dotProduct += vecA[i] * vecB[i];
                  normA += vecA[i] * vecA[i];
                  normB += vecB[i] * vecB[i];
                }
                if (normA === 0 || normB === 0) return 0;
                return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
              };

              const scoredChunks = chunks.map(chunk => {
                const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
                return { chunk, similarity };
              });

              scoredChunks.sort((a, b) => b.similarity - a.similarity);

              const topChunks = scoredChunks
                .filter(sc => sc.similarity >= 0.3)
                .slice(0, 4);

              if (topChunks.length > 0) {
                console.log(
                  `[QueryService] Found ${topChunks.length} relevant chunks. Top similarity: ${topChunks[0].similarity.toFixed(4)}`
                );
                const contextBlocks = topChunks
                  .map(sc => {
                    const sourceTag = sc.chunk.documentTitle ? `[Source: ${sc.chunk.documentTitle}]\n` : '';
                    return `${sourceTag}${sc.chunk.text}`;
                  })
                  .join("\n\n");

                systemInstruction += `\n\nUse the following context from the user's uploaded documents to answer the question if relevant. Only answer using the context if relevant. Do not explicitly state that you are referencing documents or reading a database unless asked:\n\n${contextBlocks}`;
              } else {
                console.log("[QueryService] No document chunks exceeded the relevance threshold.");
              }
            }
          } else {
            console.log("[QueryService] No document chunks found in database for this secretKey.");
          }

          console.log('[DEBUG QueryService] Final systemInstruction:\n', systemInstruction);

          let aiResponse = await this.AIService.generateResponse(message, User.apiKey, history, systemInstruction);
          console.log('ai response', aiResponse);
          return { error: false, message: aiResponse };
        } catch (error: any) {
          console.error('[QueryService] Error in userQuery:', error.message || error);
          if (error.message && error.message.includes("API key is not available")) {
            return { error: true, message: MESSAGES.QUERY.API_KEY_NOT_AVAILABLE };
          }
          return { error: true, message: error.message || "Failed to process query" };
        }
      };
}
