import { DocumentController } from "../controller/documentController";
import { DocumentService } from "../services/documents/document.service";
import { AIService } from "../services/AI/ai.service";
import { commonService } from "./common";
import { userRepository, documentRepository, documentChunkRepository } from "./repository.di";

const aiService = new AIService(commonService);
const documentService = new DocumentService(
  aiService,
  commonService,
  userRepository,
  documentRepository,
  documentChunkRepository
);
export const documentController = new DocumentController(documentService);
