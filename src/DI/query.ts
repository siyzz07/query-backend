import { QueryController } from "../controller/queryController";
import { AIService } from "../services/AI/ai.service";
import { QueryService } from "../services/query/query.service";
import { userRepository, documentChunkRepository } from "./repository.di";
import { commonService } from "./common";

const aiService = new AIService(commonService);

const queryService = new QueryService(userRepository, aiService, documentChunkRepository);
export const queryController = new QueryController(queryService);