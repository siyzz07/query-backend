import { STATES } from "mongoose";
import envConfig from "../../config/env.config";
import { MESSAGES } from "../../constants/messages";
import { ISuperAdminService } from "../../interface/service.interface/super.admin";
import { AppError } from "../../middleware/errorHandler";
import { STATUS_CODES } from "../../constants/status";
import { IUserRepository } from "../../interface/repository.interface/user.repository";
import { UserRepository } from "../../repository/user.repository";
import crypto from 'crypto'

export class SuperAdminService implements ISuperAdminService{
    
    private UserRepository:IUserRepository;

    constructor(userRepository:IUserRepository){
      this.UserRepository=userRepository;
    }

    createVendor = async (key:string,mail:string):Promise<string | null | void> =>{

        if(key != envConfig.SUPER_ADMIN_KEY){
            throw new AppError(MESSAGES.SUPERADMIN.INVALID_CREDENTIALS,STATUS_CODES.BAD_REQUEST)
        }

        let exists = await this.UserRepository.findByEmail(mail)

        if(exists){
            throw new AppError(MESSAGES.SUPERADMIN.ALREADY_EXISTS,STATUS_CODES.BAD_REQUEST)
        }

        let secretKey = this.generateSecretKey();
        let result = await this.UserRepository.createUser(mail,secretKey)
        if(!result){
            throw new AppError(MESSAGES.SUPERADMIN.CREATE_VENDOR_FAILED,STATUS_CODES.BAD_REQUEST)
        }

        return MESSAGES.SUPERADMIN.CREATE_VENDOR_SUCCESS;
    }


    
   private generateSecretKey = () :string =>{
      return crypto.randomBytes(16).toString('hex');
   }
   
}