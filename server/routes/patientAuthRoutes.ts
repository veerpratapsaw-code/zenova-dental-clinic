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

const getPriorityWeight = (level: string) => {
  if (level === 'emergency') return 3;
  if (level === 'priority') return 2;
  return 1;
};

const calculateQueuePosition = (appointment: any, allActive: any[]) => {
  if (appointment.status !== 'pending' && appointment.status !== 'confirmed') return null;
  
  const sameDay = allActive.filter(a => a.preferredDate === appointment.preferredDate && a.id !== appointment.id);
  
  let aheadCount = 0;
  const myWeight = getPriorityWeight(appointment.priorityLevel || 'standard');
  const myTime = new Date(appointment.createdAt).getTime();

  for (const other of sameDay) {
    const otherWeight = getPriorityWeight(other.priorityLevel || 'standard');
    if (otherWeight > myWeight) {
      aheadCount++;
    } else if (otherWeight === myWeight) {
      const otherTime = new Date(other.createdAt).getTime();
      if (otherTime < myTime) {
        aheadCount++;
      }
    }
  }

  return aheadCount + 1;
};

// Patient Dashboard: Get their own appointments
router.get('/appointments', requirePatientAuth, async (req, res) => {
  const user = (req as any).user;
  const dbStatus = getDbStatus();

  try {
    if (dbStatus.connected) {
      const allActiveDocs = await AppointmentModel.find({ status: { $in: ['pending', 'confirmed'] } });
      const allActive = allActiveDocs.map(d => {
        const obj = d.toJSON();
        obj.id = d._id.toString();
        return obj;
      });

      const appointments = await AppointmentModel.find({ patientId: user.id }).sort({ createdAt: -1 });
      const mapped = appointments.map(doc => {
        const obj = doc.toJSON();
        obj.id = doc._id.toString();
        
        return {
          id: obj.id,
          name: obj.name,
          phone: obj.phone,
          email: obj.email,
          treatmentType: obj.treatmentType,
          preferredDate: obj.preferredDate,
          message: obj.message,
          status: obj.status,
          priorityLevel: obj.priorityLevel,
          assignedTime: obj.assignedTime,
          adminNotes: obj.adminNotes,
          createdAt: obj.createdAt,
          queuePosition: calculateQueuePosition(obj, allActive)
        };
      });
      res.status(200).json({ success: true, data: mapped });
    } else {
      const db = getFallbackDb();
      const allActive = (db.appointments || []).filter(a => a.status === 'pending' || a.status === 'confirmed');
      const appointments = (db.appointments || []).filter(a => a.patientId === user.id);
      
      const mapped = appointments.map(a => ({
        ...a,
        queuePosition: calculateQueuePosition(a, allActive)
      }));

      res.status(200).json({ success: true, data: mapped });
    }
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

export default router;
