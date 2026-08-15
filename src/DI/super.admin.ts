import { SuperAdminController } from "../controller/superAdminController";
import { SuperAdminService } from "../services/super.admin/super.admin.service";
import { userRepository } from "./repository.di";


let superAdminService  = new SuperAdminService(userRepository)
let superAdminController = new SuperAdminController(superAdminService)


export {superAdminController}