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
      const docs = await Doctor.find().sort({ order: 1 });
      data = docs.map((doc: any) => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = db.doctors || [];
      data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
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
      getIO().emit('doctors_update');
      res.status(200).json({ success: true, message: 'Doctor deleted' });
    } else {
      const db = getFallbackDb();
      if (db.doctors) {
        db.doctors = db.doctors.filter(d => d.id !== id);
        saveFallbackDb(db);
      }
      getIO().emit('doctors_update');
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update doctor
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, role, experience, imageURL, specialty, education, bio, daysAvailable } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { DoctorModel: Doctor } = await import('../models/Doctor');
      const item = await Doctor.findByIdAndUpdate(req.params.id, { name, role, experience, imageURL, specialty, education, bio, daysAvailable }, { new: true });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('doctors_update');
      res.status(200).json({ success: true, data: item });
    } else {
      const db = getFallbackDb();
      const idx = db.doctors?.findIndex(d => d.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.doctors) {
        db.doctors[idx] = { ...db.doctors[idx], name, role, experience, imageURL, specialty, education, bio, daysAvailable };
        saveFallbackDb(db);
        getIO().emit('doctors_update');
        res.status(200).json({ success: true, data: db.doctors[idx] });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating doctor' });
  }
});

export default router;
