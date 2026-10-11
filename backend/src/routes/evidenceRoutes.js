import express from 'express';
import {
  uploadEvidenceFile,
  getEvidenceList,
  getEvidenceById,
  downloadEvidenceFile,
  deleteEvidenceItem,
} from '../controllers/evidenceController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { uploadEvidence } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateJwt);

router.post('/', uploadEvidence.single('file'), uploadEvidenceFile);
router.get('/', getEvidenceList);
router.get('/:id', getEvidenceById);
router.get('/:id/download', downloadEvidenceFile);
router.delete('/:id', deleteEvidenceItem);

export default router;
