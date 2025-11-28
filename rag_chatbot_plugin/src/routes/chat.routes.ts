import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const controller = new ChatController();

// Public chat endpoint (no auth required)
router.post('/chat', controller.chat);

export default router;
