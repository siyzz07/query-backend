import { Router } from 'express';
import { getLogs, getStats } from '../controller/logsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Only authenticated admins can fetch diagnostics logs & stats
router.get('/', authenticateToken, requireRole('admin'), getLogs);
router.get('/stats', authenticateToken, requireRole('admin'), getStats);

export default router;
