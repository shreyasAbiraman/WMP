import express from 'express';
import { askAiAssistant } from '../controllers/aiController.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateJwt);

router.post('/chat', askAiAssistant);

export default router;
