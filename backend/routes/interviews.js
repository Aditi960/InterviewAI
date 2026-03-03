import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  startInterview,
  submitInterview,
  getInterviewHistory,
  getInterviewById,
  transcribeAudio,
} from '../controllers/interviewController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/start', authMiddleware, upload.single('resume'), startInterview);
router.post('/submit', authMiddleware, submitInterview);
router.post('/transcribe', authMiddleware, transcribeAudio);
router.get('/history', authMiddleware, getInterviewHistory);
router.get('/:id', authMiddleware, getInterviewById);

export default router;