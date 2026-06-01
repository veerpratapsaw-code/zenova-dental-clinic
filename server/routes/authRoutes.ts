import express from 'express';
import {
  loginAdmin,
  setupInitialSuperAdmin,
  getMe,
  createAdmin,
  getAdmins,
  deleteAdmin
} from '../controllers/authController';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public / Init
router.post('/login', loginAdmin);
router.post('/setup', setupInitialSuperAdmin);

// Protected Auth state
router.get('/me', requireAuth, getMe);

// Admin user management (relaxed to all admins)
router.get('/users', requireAuth, getAdmins);
router.post('/users', requireAuth, createAdmin);
router.delete('/users/:id', requireAuth, deleteAdmin);

export default router;
