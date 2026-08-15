import { Router } from 'express';
import { authController } from '../DI/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.post('/refresh', authController.refresh);
router.put('/api-key', authenticateToken, authController.updateApiKey);
router.put('/prompt-settings', authenticateToken, authController.updatePromptSettings);

export default router;
