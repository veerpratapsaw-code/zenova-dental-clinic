import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PatientModel } from '../models/Patient';
import User from '../models/User';
import { getDbStatus, getFallbackDb, saveFallbackDb } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'zenova_super_secret_jwt_key_99';

export const registerPatient = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  const dbStatus = getDbStatus();

  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (dbStatus.connected) {
      const existing = await PatientModel.findOne({ email });
      if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

      const passwordHash = await bcrypt.hash(password, 10);
      const patient = new PatientModel({ name, email, phone, passwordHash });
      await patient.save();

      const token = jwt.sign({ id: patient._id.toString(), role: 'patient' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ success: true, token, patient: { id: patient._id, name, email, phone } });
    } else {
      const db = getFallbackDb();
      if (db.patients?.find(p => p.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const newPatient = {
        id: `pat-${Date.now()}`,
        name,
        email,
        phone,
        passwordHash,
        createdAt: new Date().toISOString()
      };
      
      // Ensure patients array exists
      if (!db.patients) db.patients = [];
      db.patients.push(newPatient);
      saveFallbackDb(db);

      const token = jwt.sign({ id: newPatient.id, role: 'patient' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ 
        success: true, 
        token, 
        patient: { id: newPatient.id, name, email, phone } 
      });
    }
  } catch (error: any) {
    console.error('Patient register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const loginPatient = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const dbStatus = getDbStatus();

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    let patient: any = null;

    if (dbStatus.connected) {
      patient = await PatientModel.findOne({ email });
    } else {
      const db = getFallbackDb();
      patient = db.patients?.find(p => p.email === email);
    }

    if (!patient) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, patient.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const id = dbStatus.connected ? patient._id.toString() : patient.id;
    const token = jwt.sign({ id, role: 'patient' }, JWT_SECRET, { expiresIn: '7d' });

    let isAdmin = false;
    if (dbStatus.connected) {
      const admin = await User.findOne({ email });
      if (admin) isAdmin = true;
    } else {
      const db = getFallbackDb();
      const admin = db.users?.find((u: any) => u.email === email);
      if (admin) isAdmin = true;
    }

    return res.status(200).json({
      success: true,
      token,
      patient: { id, name: patient.name, email: patient.email, phone: patient.phone, isAdmin }
    });
  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const getPatientMe = async (req: Request, res: Response) => {
  // requirePatientAuth middleware sets req.user
  const user = (req as any).user;
  const dbStatus = getDbStatus();

  try {
    let patientData: any = null;

    if (dbStatus.connected) {
      const patient = await PatientModel.findById(user.id).select('-passwordHash');
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
      patientData = { id: patient._id, name: patient.name, email: patient.email, phone: patient.phone };
    } else {
      const db = getFallbackDb();
      const patient = db.patients?.find(p => p.id === user.id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
      patientData = { id: patient.id, name: patient.name, email: patient.email, phone: patient.phone };
    }

    let isAdmin = false;
    if (dbStatus.connected) {
      const admin = await User.findOne({ email: patientData.email });
      if (admin) isAdmin = true;
    } else {
      const db = getFallbackDb();
      const admin = db.users?.find((u: any) => u.email === patientData.email);
      if (admin) isAdmin = true;
    }

    patientData.isAdmin = isAdmin;

    return res.status(200).json({ success: true, patient: patientData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};
