
import { Express, Router } from "express";
import { queryController } from "../DI/query";

const QueryRouter = Router();

QueryRouter.post("/", queryController.userQuery);

export default QueryRouter;