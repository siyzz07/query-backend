import { Router } from 'express';
import { getMyInvoices } from '../controller/invoiceController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Only authenticated customers can view their invoices
router.get('/', authenticateToken, requireRole('customer'), getMyInvoices);

export default router;
