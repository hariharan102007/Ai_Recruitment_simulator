import express from 'express';
import {
  submitAptitudeTest,
  getUserProgress,
  getUserStats,
  getLeaderboard,
} from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', authenticate, submitAptitudeTest);
router.get('/', authenticate, getUserProgress);
router.get('/stats/user', authenticate, getUserStats);
router.get('/leaderboard', getLeaderboard);

export default router;
