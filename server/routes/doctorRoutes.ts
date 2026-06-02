import express from 'express';
import { getFallbackDb, saveFallbackDb, getDbStatus } from '../config/db';
import { getIO } from '../socket';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const { DoctorModel: Doctor } = await import('../models/Doctor');
      const docs = await Doctor.find();
      data = docs.map((doc: any) => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = db.doctors || [];
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a new doctor
router.post('/', requireAuth, async (req, res) => {
  try {
    const doctorData = req.body;
    const { mode } = getDbStatus();
    
    if (mode === 'mongodb') {
      const { DoctorModel: Doctor } = await import('../models/Doctor');
      const doctor = new Doctor(doctorData);
      await doctor.save();
    } else {
      const db = getFallbackDb();
      const newDoctor = {
        id: Date.now().toString(),
        ...doctorData,
        createdAt: new Date().toISOString()
      };
      if (!db.doctors) db.doctors = [];
      db.doctors.push(newDoctor);
      saveFallbackDb(db);
    }
    
    getIO().emit('doctors_update');
    res.status(201).json({ success: true, message: 'Doctor added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add doctor' });
  }
});

// Delete a doctor
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();
    
    if (mode === 'mongodb') {
      const { DoctorModel: Doctor } = await import('../models/Doctor');
      await Doctor.findByIdAndDelete(id);
    } else {
      const db = getFallbackDb();
      if (db.doctors) {
        db.doctors = db.doctors.filter(d => d.id !== id);
        saveFallbackDb(db);
      }
    }
    
    getIO().emit('doctors_update');
    res.status(200).json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete doctor' });
  }
});

export default router;
