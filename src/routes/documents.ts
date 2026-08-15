import { Router } from 'express';
import { documentController } from '../DI/document';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Only authenticated admins can manage system documents
router.get('/', authenticateToken, documentController.getDocuments);
router.post('/', authenticateToken, documentController.createDocument);
router.delete('/:id', authenticateToken, documentController.deleteDocument);

export default router;
