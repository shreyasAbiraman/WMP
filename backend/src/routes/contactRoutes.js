import express from 'express';
import {
  getContacts,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { contactSchema, updateContactSchema } from '../validators/contactValidator.js';

const router = express.Router();

router.use(authenticateJwt);

router.get('/', getContacts);
router.post('/', validateRequest(contactSchema), createContact);
router.get('/:id', getContactById);
router.patch('/:id', validateRequest(updateContactSchema), updateContact);
router.delete('/:id', deleteContact);

export default router;
