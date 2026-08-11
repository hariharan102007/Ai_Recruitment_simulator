import express from 'express';
import {
  createCodingProblem,
  getAllCodingProblems,
  getCodingProblemById,
  updateCodingProblem,
  deleteCodingProblem,
  publishCodingProblem,
} from '../controllers/codingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCodingProblems);
router.get('/:id', getCodingProblemById);
router.post('/', authenticate, authorize(['instructor', 'admin']), createCodingProblem);
router.put('/:id', authenticate, authorize(['instructor', 'admin']), updateCodingProblem);
router.delete('/:id', authenticate, authorize(['instructor', 'admin']), deleteCodingProblem);
router.post('/:id/publish', authenticate, authorize(['instructor', 'admin']), publishCodingProblem);

export default router;
