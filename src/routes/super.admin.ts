import express from 'express'
import { superAdminController } from '../DI/super.admin'

let SuperAdminRoutes = express.Router()

SuperAdminRoutes.get('/:key/:mail', superAdminController.createVendor);

export {SuperAdminRoutes}