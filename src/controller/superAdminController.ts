
import { Response, Request, NextFunction } from "express";
import { ISuperAdminService } from "../interface/service.interface/super.admin";
import { STATUS_CODES } from "../constants/status";
import { MESSAGES } from "../constants/messages";


export class SuperAdminController {
     
    private SuperAdminService :ISuperAdminService

    constructor ( superAdminService:ISuperAdminService){
         this.SuperAdminService = superAdminService
    }

   createVendor  = async (req:Request,res:Response, next:NextFunction) :Promise<void> =>{
        try {
            let key = (req.params.key || req.query.key) as string;
            let mail = (req.params.mail || req.query.mail) as string;

            let result = await this.SuperAdminService.createVendor(key, mail);
            if(result){
                res
                .status(STATUS_CODES.CREATED)
                .json({success:true,message: MESSAGES.SUPERADMIN.CREATE_VENDOR_SUCCESS});
            }
        } catch (error) {
            next(error);
        }
   }   
}
