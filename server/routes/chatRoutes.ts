import express from 'express';
import { handleChat } from '../controllers/chatController';

const router = express.Router();

router.post('/chat', handleChat);

export default router;
