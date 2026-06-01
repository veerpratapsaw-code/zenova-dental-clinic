import express from 'express';
import { registerPatient, loginPatient, getPatientMe, updatePatientProfile } from '../controllers/patientAuthController';
import { requirePatientAuth } from '../middleware/patientAuthMiddleware';
import { getFallbackDb, getDbStatus } from '../config/db';
import { AppointmentModel } from '../models/Appointment';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/me', requirePatientAuth, getPatientMe);
router.put('/profile', requirePatientAuth, updatePatientProfile);

// Patient Dashboard: Get their own appointments
router.get('/appointments', requirePatientAuth, async (req, res) => {
  const user = (req as any).user;
  const dbStatus = getDbStatus();

  try {
    if (dbStatus.connected) {
      const appointments = await AppointmentModel.find({ patientId: user.id }).sort({ createdAt: -1 });
      const mapped = appointments.map(doc => ({
        id: doc._id.toString(),
        name: doc.name,
        phone: doc.phone,
        email: doc.email,
        treatmentType: doc.treatmentType,
        preferredDate: doc.preferredDate,
        message: doc.message,
        status: doc.status,
        assignedTime: doc.assignedTime,
        adminNotes: doc.adminNotes,
        createdAt: doc.createdAt.toISOString()
      }));
      res.status(200).json({ success: true, data: mapped });
    } else {
      const db = getFallbackDb();
      const appointments = (db.appointments || []).filter(a => a.patientId === user.id);
      res.status(200).json({ success: true, data: appointments });
    }
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

export default router;
