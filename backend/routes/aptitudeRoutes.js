import express from 'express';
import {
  createAptitude,
  getAllAptitudes,
  getAptitudeById,
  updateAptitude,
  deleteAptitude,
  publishAptitude,
} from '../controllers/aptitudeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllAptitudes);
router.get('/:id', getAptitudeById);
router.post('/', authenticate, authorize(['instructor', 'admin']), createAptitude);
router.put('/:id', authenticate, authorize(['instructor', 'admin']), updateAptitude);
router.delete('/:id', authenticate, authorize(['instructor', 'admin']), deleteAptitude);
router.post('/:id/publish', authenticate, authorize(['instructor', 'admin']), publishAptitude);

export default router;
