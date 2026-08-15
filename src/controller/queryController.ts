import { Request, Response } from "express";
import { IQueryService } from "../interface/service.interface/query";
import { STATUS_CODES } from "../constants/status";

export class QueryController {
    
    private QueryService :IQueryService;

    constructor (queryService :IQueryService){
        this.QueryService = queryService;
    }

    userQuery = async (req: Request, res: Response) => {
         let result = await this.QueryService.userQuery(req.body.message, req.body.secretKey, req.body.history);
         
         if (result?.error) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(result);
         }

         return res.status(STATUS_CODES.OK).json(result);
    };
}