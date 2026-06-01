import { Router } from 'express';
import { createContactInquiry, getContactInquiries } from '../controllers/contactController';
import { validateContactInput } from '../middleware/validation';

const router = Router();

// Route: Logging general feedback or questions
router.post('/contact', validateContactInput, createContactInquiry);

// Route: Fetching list of general inquiries
router.get('/contact', getContactInquiries);

export default router;
