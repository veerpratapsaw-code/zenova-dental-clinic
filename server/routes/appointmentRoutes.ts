import { Router } from 'express';
import { createAppointment, getAppointments, getQueueStatus } from '../controllers/appointmentController';
import { validateAppointmentInput } from '../middleware/validation';

const router = Router();

// Route: Get Live Queue Status
router.get('/appointments/queue-status', getQueueStatus);

// Route: Recording clinical appointments
router.post('/appointments', validateAppointmentInput, createAppointment);

// Route: Listing clinical appointments (useful for management panels or validation checks)
router.get('/appointments', getAppointments);

export default router;
