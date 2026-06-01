import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getFallbackDb, saveFallbackDb, getDbStatus } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'zenova_super_secret_fallback_key_2026';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const { mode } = getDbStatus();
    let user;

    if (mode === 'mongodb') {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      const db = getFallbackDb();
      user = db.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const setupInitialSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mode } = getDbStatus();
    const superEmail = 'chandnid677@gmail.com';
    const superPassword = '#knight_killer99';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(superPassword, salt);

    if (mode === 'mongodb') {
      const exists = await User.findOne({ role: 'superadmin' });
      if (exists) {
        res.status(400).json({ success: false, message: 'Superadmin already exists' });
        return;
      }

      await User.create({
        email: superEmail,
        passwordHash,
        role: 'superadmin'
      });
    } else {
      const db = getFallbackDb();
      if (!db.users) db.users = [];
      
      const exists = db.users.find(u => u.role === 'superadmin');
      if (exists) {
        res.status(400).json({ success: false, message: 'Superadmin already exists' });
        return;
      }

      db.users.push({
        id: 'super-' + Date.now().toString(),
        email: superEmail,
        passwordHash,
        role: 'superadmin',
        createdAt: new Date().toISOString()
      });
      saveFallbackDb(db);
    }

    res.status(201).json({ success: true, message: 'Superadmin created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ success: false, message: 'Server error during setup' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
};

export const createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        res.status(400).json({ success: false, message: 'User already exists' });
        return;
      }
      await User.create({ email: email.toLowerCase(), passwordHash, role: 'admin' });
    } else {
      const db = getFallbackDb();
      if (!db.users) db.users = [];
      const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        res.status(400).json({ success: false, message: 'User already exists' });
        return;
      }
      db.users.push({
        id: 'admin-' + Date.now().toString(),
        email: email.toLowerCase(),
        passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      saveFallbackDb(db);
    }

    res.status(201).json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAdmins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mode } = getDbStatus();
    let users = [];
    if (mode === 'mongodb') {
      const records = await User.find().select('-passwordHash');
      users = records.map(r => ({ id: r.id, email: r.email, role: r.role }));
    } else {
      const db = getFallbackDb();
      users = (db.users || []).map(u => ({ id: u.id, email: u.email, role: u.role }));
    }
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const user = await User.findById(id);
      if (!user) {
         res.status(404).json({ success: false, message: 'User not found' });
         return;
      }
      if (user.role === 'superadmin') {
         res.status(403).json({ success: false, message: 'Cannot delete superadmin' });
         return;
      }
      await User.findByIdAndDelete(id);
    } else {
      const db = getFallbackDb();
      if (!db.users) db.users = [];
      const userIndex = db.users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      if (db.users[userIndex].role === 'superadmin') {
        res.status(403).json({ success: false, message: 'Cannot delete superadmin' });
        return;
      }
      db.users.splice(userIndex, 1);
      saveFallbackDb(db);
    }

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
