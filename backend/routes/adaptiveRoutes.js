import express from 'express';
import { startInterview, answerQuestion, finishInterview, getSession } from '../controllers/adaptiveController.js';

const router = express.Router();

// Start a new adaptive interview
router.post('/start', startInterview);

// Submit an answer (include sessionId, questionText, questionDifficulty, score)
router.post('/answer', answerQuestion);

// Finish an interview early
router.post('/finish', finishInterview);

// Get session
router.get('/:id', getSession);

export default router;
